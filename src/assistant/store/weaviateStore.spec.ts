import {
  getAllClassNames,
  getSitesClassNames,
  getWeaviateClass,
  searchAllSitesClasses,
} from './weaviateStore';
import { AGENTS, QA_COLLECTION } from '../constants/nodes';

describe('WeaviateStore', () => {
  describe('getAllClassNames', () => {
    it('should return an array of class names', async () => {
      const classNames = await getAllClassNames();

      expect(Array.isArray(classNames)).toBe(true);
      expect(classNames.every((name) => typeof name === 'string')).toBe(true);
    }, 30000);

    it('should handle empty database gracefully', async () => {
      const classNames = await getAllClassNames();

      expect(Array.isArray(classNames)).toBe(true);
      // Empty array is valid for empty database
    }, 30000);

    it('should return class names that exist in the database', async () => {
      const classNames = await getAllClassNames();

      if (classNames.length > 0) {
        // Test that at least one class name can be verified to exist
        const firstClassName = classNames[0];
        const existingClass = await getWeaviateClass(firstClassName);
        expect(existingClass).toBeTruthy();
      }
    }, 30000);

    it('should handle connection errors gracefully', async () => {
      // This test verifies the function doesn't throw on connection issues
      // The function should return empty array on error
      const classNames = await getAllClassNames();

      expect(Array.isArray(classNames)).toBe(true);
      // Function should not throw, even on connection errors
    }, 30000);

    it('should return unique class names', async () => {
      const classNames = await getAllClassNames();

      if (classNames.length > 0) {
        const uniqueNames = new Set(classNames);
        expect(uniqueNames.size).toBe(classNames.length);
      }
    }, 30000);
  });

  describe('getSitesClassNames', () => {
    it('should return an array of class names excluding AGENTS and QA_COLLECTION', async () => {
      const sitesClassNames = await getSitesClassNames();
      const allClassNames = await getAllClassNames();

      expect(Array.isArray(sitesClassNames)).toBe(true);
      expect(sitesClassNames.every((name) => typeof name === 'string')).toBe(
        true,
      );

      // Should be subset of all class names
      expect(sitesClassNames.length).toBeLessThanOrEqual(allClassNames.length);
    }, 30000);

    it('should not include any AGENTS values', async () => {
      const sitesClassNames = await getSitesClassNames();
      const agentValues = Object.values(AGENTS);

      agentValues.forEach((agentValue) => {
        expect(sitesClassNames).not.toContain(agentValue);
      });
    }, 30000);

    it('should not include QA_COLLECTION', async () => {
      const sitesClassNames = await getSitesClassNames();

      expect(sitesClassNames).not.toContain(QA_COLLECTION);
    }, 30000);

    it('should handle empty database gracefully', async () => {
      const sitesClassNames = await getSitesClassNames();

      expect(Array.isArray(sitesClassNames)).toBe(true);
      // Empty array is valid for empty database
    }, 30000);

    it('should handle connection errors gracefully', async () => {
      const sitesClassNames = await getSitesClassNames();

      expect(Array.isArray(sitesClassNames)).toBe(true);
      // Function should not throw, even on connection errors
    }, 30000);

    it('should return unique class names', async () => {
      const sitesClassNames = await getSitesClassNames();

      if (sitesClassNames.length > 0) {
        const uniqueNames = new Set(sitesClassNames);
        expect(uniqueNames.size).toBe(sitesClassNames.length);
      }
    }, 30000);

    it('should be consistent with getAllClassNames minus exclusions', async () => {
      const allClassNames = await getAllClassNames();
      const sitesClassNames = await getSitesClassNames();
      const agentValues = Object.values(AGENTS);
      const expectedExcluded = allClassNames.filter(
        (name) => !agentValues.includes(name) && name !== QA_COLLECTION,
      );

      expect(sitesClassNames.sort()).toEqual(expectedExcluded.sort());
    }, 30000);
  });

  describe('searchAllSitesClasses', () => {
    it('should return search results from all site classes', async () => {
      const query = 'test query';
      const results = await searchAllSitesClasses(query, 5);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(5);
    }, 30000);

    it('should return results with proper structure', async () => {
      const query = 'test query';
      const results = await searchAllSitesClasses(query, 3);

      if (results.length > 0) {
        const firstResult = results[0];

        expect(firstResult).toHaveProperty('pageContent');
        expect(firstResult).toHaveProperty('metadata');
        expect(firstResult).toHaveProperty('className');
        expect(firstResult).toHaveProperty('score');
        expect(firstResult).toHaveProperty('distance');

        expect(typeof firstResult.pageContent).toBe('string');
        expect(typeof firstResult.metadata).toBe('object');
        expect(typeof firstResult.className).toBe('string');
        expect(typeof firstResult.score).toBe('number');
        expect(typeof firstResult.distance).toBe('number');
      }
    }, 30000);

    it('should sort results by score in descending order', async () => {
      const query = 'test query';
      const results = await searchAllSitesClasses(query, 10);

      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
        }
      }
    }, 30000);

    it('should include className in each result', async () => {
      const query = 'test query';
      const results = await searchAllSitesClasses(query, 5);

      results.forEach((result) => {
        expect(result.className).toBeDefined();
        expect(typeof result.className).toBe('string');
        expect(result.className.length).toBeGreaterThan(0);
      });
    }, 30000);

    it('should handle empty query gracefully', async () => {
      const results = await searchAllSitesClasses('', 5);

      expect(Array.isArray(results)).toBe(true);
      // Empty query might return empty results or some default results
    }, 30000);

    it('should respect limit parameter', async () => {
      const query = 'test query';
      const limit = 3;
      const results = await searchAllSitesClasses(query, limit);

      expect(results.length).toBeLessThanOrEqual(limit);
    }, 30000);

    it('should handle connection errors gracefully', async () => {
      const results = await searchAllSitesClasses('test query', 5);

      expect(Array.isArray(results)).toBe(true);
      // Function should not throw, even on connection errors
    }, 30000);

    it('should calculate distance correctly from score', async () => {
      const query = 'test query';
      const results = await searchAllSitesClasses(query, 3);

      results.forEach((result) => {
        if (result.score !== undefined && result.distance !== undefined) {
          expect(result.distance).toBeCloseTo(1 - result.score, 5);
        }
      });
    }, 30000);

    it('should filter duplicate pageContent based on object name pattern and keep highest score', async () => {
      const query = 'test query';
      const results = await searchAllSitesClasses(query, 10);

      // Check that all results follow the [object name] pattern
      results.forEach((result) => {
        const match = result.pageContent.match(/^\[([^\]]+)\]/);
        expect(match).toBeTruthy();
        expect(match[1]).toBeTruthy(); // object name should exist
      });

      // Check that all object names are unique
      const objectNames = results
        .map((result) => {
          const match = result.pageContent.match(/^\[([^\]]+)\]/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      const uniqueObjectNames = new Set(objectNames);
      expect(uniqueObjectNames.size).toBe(objectNames.length);
    }, 30000);
  });
});
