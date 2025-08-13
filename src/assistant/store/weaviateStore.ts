import { WeaviateStore } from '@langchain/weaviate';
import weaviate, { WeaviateClass } from 'weaviate-ts-client';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { configService } from '../../config';

const weaviateHost = configService.getWeaviateHost();

export const getWeaviateStore = async (
  indexName: string,
): Promise<WeaviateStore> => {
  const client = weaviate.client({
    scheme: 'http',
    host: weaviateHost,
  });

  // Create a store for an existing index
  const store = await WeaviateStore.fromExistingIndex(new OpenAIEmbeddings(), {
    client,
    indexName,
    textKey: 'pageContent',
  });

  return store;
};

interface CreateWeaviateIndexI {
  text: string;
  indexName: string;
}

export const createWeaviateIndex = async ({
  text,
  indexName,
}: CreateWeaviateIndexI): Promise<void> => {
  try {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', '! ', '? ', ' ', ''],
    });

    const docs = await textSplitter.createDocuments([text]);

    const client = weaviate.client({
      scheme: 'http',
      host: weaviateHost,
    });

    await WeaviateStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      client,
      indexName,
      textKey: 'pageContent',
    });

    console.log(`Vectors Created, ${indexName}`);
  } catch (error) {
    console.log(error);
  }
};

export const dropWeaviateIndex = async (indexName: string) => {
  try {
    const client = weaviate.client({
      scheme: 'http',
      host: weaviateHost,
    });

    await client.schema.classDeleter().withClassName(indexName).do();
    console.log(`Vectors dropped ${indexName}`);
  } catch (error) {
    console.error(error);
  }
};

export const getWeaviateClass = async (
  className: string,
): Promise<WeaviateClass | null> => {
  try {
    const client = weaviate.client({
      scheme: 'http',
      host: weaviateHost,
    });
    return await client.schema.classGetter().withClassName(className).do();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
};

export const getIndexFromHostName = ({ host }) => {
  const cleanedHostName = host.replace(/[^a-zA-Z0-9]/g, '');
  return (
    cleanedHostName.charAt(0).toUpperCase() +
    cleanedHostName.slice(1).toLowerCase()
  );
};

export const checkClassExistByHost = async ({ host }): Promise<boolean> => {
  const className = getIndexFromHostName({ host });
  const result = await getWeaviateClass(className);
  return !!result;
};
