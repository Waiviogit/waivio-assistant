import { VectorStoreInfo } from 'langchain/agents';
import {
  VectorStoreRouterToolkit,
  VectorStoreToolkit,
} from 'langchain/agents/toolkits';
import type { BaseLanguageModelInterface } from '@langchain/core/language_models/base';
import { AGENTS_DESCRIPTION } from '../constants/nodes';
import { getIndexFromHostName, getWeaviateStore } from '../store/weaviateStore';

export const getVectorStores = async (llm: BaseLanguageModelInterface) => {
  const vectorStores: VectorStoreInfo[] = [];

  for (const [collection, description] of Object.entries(AGENTS_DESCRIPTION)) {
    try {
      const vectorStore = await getWeaviateStore(collection);

      const vectorStoreInfo: VectorStoreInfo = {
        name: collection,
        description,
        vectorStore,
      };

      vectorStores.push(vectorStoreInfo);
    } catch (error) {
      console.error(`Failed to create vector store for ${collection}:`, error);
      // Continue with other collections even if one fails
    }
  }

  if (vectorStores.length === 0) {
    throw new Error('No vector stores could be created');
  }

  const toolkit = new VectorStoreRouterToolkit(vectorStores, llm);
  return toolkit.getTools();
};

export const getSiteVectorTool = async (
  host: string,
  llm: BaseLanguageModelInterface,
) => {
  const vectorStore = await getWeaviateStore(getIndexFromHostName({ host }));
  if (!vectorStore) {
    console.log(`Failed to create vector store for ${host}`);
    return [];
  }

  const vectorStoreInfo: VectorStoreInfo = {
    name: 'siteProductInfo',
    description:
      'information about site product, recipe, books business object catalog',
    vectorStore,
  };

  const toolkit = new VectorStoreToolkit(vectorStoreInfo, llm);
  return toolkit.getTools();
};
