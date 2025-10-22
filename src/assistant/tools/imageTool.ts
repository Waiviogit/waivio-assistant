import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { imageGenerator } from '../images/imageGenerator';
import { googleGenAi } from '../images/googleGenAi';

const waivioImageToolSchema = z.object({
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
      schema: waivioImageToolSchema,
      responseFormat: 'content',
    },
  );

const waivioImageToTextToolSchema = z.object({
  prompt: z.string().describe('prompt for analyzing image'),
});
export const imageToTextTool = (images?: string[]) =>
  tool(
    async ({ prompt }) => {
      if (!images?.length) return 'No image to analyze';
      return googleGenAi.imageToText(prompt, images[0]);
    },
    {
      name: 'imageToTextTool',
      description:
        'Use this tool when you need image to text or describing what on picture; do not use when asked edit or change image',
      schema: waivioImageToTextToolSchema,
      responseFormat: 'content',
    },
  );
