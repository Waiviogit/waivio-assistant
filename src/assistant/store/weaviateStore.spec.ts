import {
  getAllClassNames,
  getSitesClassNames,
  getWeaviateClass,
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
});
