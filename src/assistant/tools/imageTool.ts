import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { imageGenerator } from '../images/imageGenerator';

const waivioSearchUserSchema = z.object({
  query: z.string().describe('query for generation / edit image'),
  size: z
    .enum(['1024x1024', '1536x1024', '1024x1536'])
    .default('1024x1024')
    .describe('image size, default 1024x1024'),
});
export const getImageTool = (images?: string[]) =>
  tool(
    async ({ query, size }) => {
      return imageGenerator.invoke({ images, query, size });
    },
    {
      name: 'waivioImageTool',
      description:
        'Use this tool for image generation. Always use if you have "/imagine" in prompt',
      schema: waivioSearchUserSchema,
      responseFormat: 'content',
    },
  );
