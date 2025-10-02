import { WeaviateStore } from '@langchain/weaviate';
import weaviate, { WeaviateClass } from 'weaviate-ts-client';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import { configService } from '../../config';
import { AGENTS, QA_COLLECTION } from '../constants/nodes';

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

interface QAItem {
  question: string;
  answer: string;
  topic: string;
}

export const getAllClassNames = async (): Promise<string[]> => {
  try {
    const client = weaviate.client({
      scheme: 'http',
      host: weaviateHost,
    });

    const schema = await client.schema.getter().do();
    return schema.classes?.map((cls) => cls.class) || [];
  } catch (error) {
    console.error('Error getting class names:', error);
    return [];
  }
};

export const getSitesClassNames = async (): Promise<string[]> => {
  try {
    const allClassNames = await getAllClassNames();
    const excludedNames = [...Object.values(AGENTS), QA_COLLECTION];

    return allClassNames.filter(
      (className) => !excludedNames.includes(className),
    );
  } catch (error) {
    console.error('Error getting sites class names:', error);
    return [];
  }
};

interface SearchResult {
  pageContent: string;
  metadata: Record<string, any>;
  score?: number;
  distance?: number;
  className: string;
}

export const searchAllSitesClasses = async (
  query: string,
  limit: number = 10,
): Promise<SearchResult[]> => {
  try {
    const siteClassNames = await getSitesClassNames();
    console.log('siteClassNames', siteClassNames);
    const allResults: SearchResult[] = [];

    // Search in each site class
    for (const className of siteClassNames) {
      try {
        const store = await getWeaviateStore(className);
        const results = await store.similaritySearchWithScore(query, limit);

        // Add className to each result
        const resultsWithClass = results.map(([doc, distance]) => ({
          pageContent: doc.pageContent,
          metadata: doc.metadata,
          score: 1 - distance, // Convert distance to score
          className,
        }));

        allResults.push(...resultsWithClass);
      } catch (error) {
        console.error(`Error searching in class ${className}:`, error);
        // Continue with other classes even if one fails
      }
    }

    // Sort by score (descending) - higher score = better match
    return allResults
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('Error searching all sites classes:', error);
    return [];
  }
};

export const createQAWeaviateIndex = async (
  qaData: QAItem[],
  indexName: string,
): Promise<void> => {
  try {
    // Convert QA pairs into documents
    const docs = qaData.map((item, index) => {
      const content = `Question: ${item.question}\nAnswer: ${item.answer}`;
      return new Document({
        pageContent: content,
        metadata: {
          question: item.question,
          answer: item.answer,
          topic: item.topic,
          type: 'qa',
          index: index,
        },
      });
    });

    const client = weaviate.client({
      scheme: 'http',
      host: weaviateHost,
    });

    await WeaviateStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      client,
      indexName,
      textKey: 'pageContent',
    });

    console.log(`QA Vectors Created, ${indexName}`);
  } catch (error) {
    console.log('Error creating QA index:', error);
  }
};
