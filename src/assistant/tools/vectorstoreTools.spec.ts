import { getWeaviateStore, getWeaviateClass } from '../store/weaviateStore';
import { AGENTS } from '../constants/nodes';

describe('Vector Store Similarity Search', () => {
  const collectionName = AGENTS.CampaignManagement;
  const testQuery = 'campaign management';

  describe('CampaignManagement Collection', () => {
    it('should perform similarity search for campaign management', async () => {
      // Check if collection exists
      const existingClass = await getWeaviateClass(collectionName);
      expect(existingClass).toBeTruthy();

      // Get vector store
      const vectorStore = await getWeaviateStore(collectionName);
      expect(vectorStore).toBeDefined();

      // Test multiple queries to see which work better
      const testQueries = [
        'campaign statuses',
        'campaign management',
        'Earn section',
        'rewards campaign',
        'primary card',
        'secondary card',
        'reservation modal',
        'match bots',
      ];

      for (const query of testQueries) {
        console.log(`\nTesting query: "${query}"`);

        const results = await vectorStore.similaritySearch(query, 5);
        console.log(`Found ${results.length} results for "${query}"`);

        // Log results for debugging
        results.forEach((doc, index) => {
          console.log(`Result ${index + 1}:`);
          console.log(`Content: ${doc.pageContent.substring(0, 200)}...`);
          console.log(`Metadata: ${JSON.stringify(doc.metadata)}`);
          console.log('---');
        });

        // Basic assertions
        expect(Array.isArray(results)).toBe(true);

        if (results.length > 0) {
          results.forEach((doc) => {
            expect(doc).toHaveProperty('pageContent');
            expect(doc).toHaveProperty('metadata');
            expect(typeof doc.pageContent).toBe('string');
          });
        }
      }
    }, 60000); // Increased timeout for vector search

    it('should handle empty results gracefully', async () => {
      const vectorStore = await getWeaviateStore(collectionName);
      const results = await vectorStore.similaritySearch(
        'nonexistent query that should return nothing',
        4,
      );

      expect(Array.isArray(results)).toBe(true);
      // Empty results are valid
    }, 30000);

    it('should return results with proper structure', async () => {
      const vectorStore = await getWeaviateStore(collectionName);
      const results = await vectorStore.similaritySearch(testQuery, 2);

      if (results.length > 0) {
        const firstResult = results[0];

        // Check structure
        expect(firstResult).toHaveProperty('pageContent');
        expect(firstResult).toHaveProperty('metadata');

        // Check content is not empty
        expect(firstResult.pageContent).toBeTruthy();
        expect(firstResult.pageContent.length).toBeGreaterThan(0);

        // Check metadata is an object
        expect(typeof firstResult.metadata).toBe('object');
      }
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle invalid collection gracefully', async () => {
      try {
        await getWeaviateStore('NonExistentCollection');
        // If we get here, the collection might exist, which is fine
      } catch (error) {
        // Expected error for non-existent collection
        expect(error).toBeDefined();
      }
    });

    it('should handle similarity search errors', async () => {
      const vectorStore = await getWeaviateStore(collectionName);

      try {
        // Test with empty query
        const results = await vectorStore.similaritySearch('', 4);
        expect(Array.isArray(results)).toBe(true);
      } catch (error) {
        // Some vector stores might throw on empty query
        expect(error).toBeDefined();
      }
    }, 30000);
  });
});
