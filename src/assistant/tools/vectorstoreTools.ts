import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { AGENTS_DESCRIPTION } from '../constants/nodes';
import {
  getIndexFromHostName,
  getWeaviateStore,
  getWeaviateClass,
} from '../store/weaviateStore';

const vectorSearchSchema = z.object({
  query: z.string().describe('Search query to find relevant information'),
});

export const getVectorStores = async () => {
  const tools = [];

  for (const [collection, description] of Object.entries(AGENTS_DESCRIPTION)) {
    try {
      // Check if collection exists before creating vector store
      const existingClass = await getWeaviateClass(collection);
      if (!existingClass) {
        console.log(`Collection ${collection} does not exist, skipping...`);
        continue;
      }

      const vectorStore = await getWeaviateStore(collection);

      const vectorSearchTool = tool(
        async ({ query }) => {
          console.log(`Searching in ${collection} for: "${query}"`);
          try {
            const results = await vectorStore.similaritySearch(query, 4);
            console.log(`Found ${results.length} results in ${collection}`);

            if (!results || results.length === 0) {
              return `No relevant information found in ${collection} for: "${query}"`;
            }

            const formattedResults = results
              .map((doc, index) => {
                const content = doc.pageContent || '';
                const metadata = doc.metadata || {};
                return `Result ${index + 1}:\nContent: ${content}\nMetadata: ${JSON.stringify(metadata)}`;
              })
              .join('\n\n');

            return `Found ${results.length} relevant results from ${collection}:\n\n${formattedResults}`;
          } catch (error) {
            console.error(`Error searching in ${collection}:`, error);
            return `Error searching in ${collection}: ${error.message}`;
          }
        },
        {
          name: `${collection}Search`,
          description: `Search for information in ${collection}: ${description}`,
          schema: vectorSearchSchema,
          responseFormat: 'content',
        },
      );

      tools.push(vectorSearchTool);
    } catch (error) {
      console.error(
        `Failed to create vector store tool for ${collection}:`,
        error,
      );
      // Continue with other collections even if one fails
    }
  }

  if (tools.length === 0) {
    console.warn(
      'No vector store tools could be created, returning empty array',
    );
    return [];
  }

  return tools;
};

export const getSiteVectorTool = async (host: string) => {
  const vectorStore = await getWeaviateStore(getIndexFromHostName({ host }));
  if (!vectorStore) {
    console.log(`Failed to create vector store for ${host}`);
    return [];
  }

  const siteSearchTool = tool(
    async ({ query }) => {
      console.log(`Searching in site ${host} for: "${query}"`);
      try {
        const results = await vectorStore.similaritySearch(query, 4);
        console.log(`Found ${results.length} results in site ${host}`);

        if (!results || results.length === 0) {
          return `No relevant information found in site ${host} for: "${query}"`;
        }

        const formattedResults = results
          .map((doc, index) => {
            const content = doc.pageContent || '';
            const metadata = doc.metadata || {};
            return `Result ${index + 1}:\nContent: ${content}\nMetadata: ${JSON.stringify(metadata)}`;
          })
          .join('\n\n');

        return `Found ${results.length} relevant results from site ${host}:\n\n${formattedResults}`;
      } catch (error) {
        console.error(`Error searching in site ${host}:`, error);
        return `Error searching in site ${host}: ${error.message}`;
      }
    },
    {
      name: 'siteProductInfoSearch',
      description:
        'Search for information about site products, recipes, books, business objects, and catalog',
      schema: vectorSearchSchema,
      responseFormat: 'content',
    },
  );

  return [siteSearchTool];
};
