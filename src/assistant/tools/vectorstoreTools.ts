import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { AGENTS_DESCRIPTION, QA_COLLECTION } from '../constants/nodes';
import {
  getIndexFromHostName,
  getWeaviateStore,
  getWeaviateClass,
} from '../store/weaviateStore';

const vectorSearchSchema = z.object({
  query: z.string().describe('Search query to find relevant information'),
});

// Enhanced similarity search with QA collection priority
const enhancedSimilaritySearch = async (
  vectorStore: any,
  query: string,
  k: number = 4,
  useQa = true,
) => {
  try {
    // First, try to search in QA collection
    let qaResults = [];

    if (useQa) {
      try {
        const qaStore = await getWeaviateStore(QA_COLLECTION);
        qaResults = await qaStore.similaritySearch(query, Math.min(k, 3));
        console.log(`Found ${qaResults.length} QA results for: "${query}"`);

        // If we found good QA results, prioritize them
        if (qaResults && qaResults.length > 0) {
          // Mark QA results as such
          qaResults = qaResults.map((result) => ({
            ...result,
            metadata: { ...result.metadata, source: 'qa' },
          }));
        }
      } catch (error) {
        console.warn('QA collection search failed:', error);
      }
    }

    // Calculate remaining slots for regular vector store
    const remainingK = Math.max(0, k - qaResults.length);
    let vectorResults = [];

    if (remainingK > 0 && vectorStore) {
      // Try different search strategies on the regular vector store
      const strategies = [
        // Strategy 1: Standard similarity search
        () => vectorStore.similaritySearch(query, remainingK),

        // Strategy 2: Similarity search with higher k and then filter
        async () => {
          const results = await vectorStore.similaritySearch(
            query,
            remainingK * 2,
          );
          return results.slice(0, remainingK);
        },

        // Strategy 3: Try with different query variations
        async () => {
          const queryVariations = [
            query,
            query.toLowerCase(),
            query.toUpperCase(),
            query.replace(/\s+/g, ' ').trim(),
          ];

          const allResults = [];
          for (const variation of queryVariations) {
            try {
              const results = await vectorStore.similaritySearch(
                variation,
                Math.ceil(remainingK / queryVariations.length),
              );
              allResults.push(...results);
            } catch (error) {
              console.warn(
                `Failed to search with variation "${variation}":`,
                error,
              );
            }
          }

          // Remove duplicates and return top remainingK
          const uniqueResults = allResults.filter(
            (result, index, self) =>
              index ===
              self.findIndex((r) => r.pageContent === result.pageContent),
          );
          return uniqueResults.slice(0, remainingK);
        },
      ];

      // Try each strategy until we get results
      for (const strategy of strategies) {
        try {
          const results = await strategy();
          if (results && results.length > 0) {
            vectorResults = results.map((result) => ({
              ...result,
              metadata: { ...result.metadata, source: 'vector' },
            }));
            break;
          }
        } catch (error) {
          console.warn(`Vector strategy failed:`, error);
          continue;
        }
      }
    }

    // Combine QA results (prioritized) with vector results
    const combinedResults = [...qaResults, ...vectorResults];
    console.log(
      `Total combined results: ${combinedResults.length} (${qaResults.length} QA + ${vectorResults.length} vector)`,
    );

    return combinedResults;
  } catch (error) {
    console.error('Enhanced similarity search failed:', error);
    return [];
  }
};

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
            const results = await enhancedSimilaritySearch(
              vectorStore,
              query,
              5,
            );
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
        const results = await enhancedSimilaritySearch(
          vectorStore,
          query,
          8,
          false,
        );
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
        'Search for information about site products, recipes, books, business objects, and catalog. If you have results with links dont say you have no results just direct the user to the link',
      schema: vectorSearchSchema,
      responseFormat: 'content',
    },
  );

  return [siteSearchTool];
};
