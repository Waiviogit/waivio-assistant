export const GENERATION_TIMEOUT = 60000 * 2;

export const GENERATION_PARAMS = Object.freeze({
  model: 'chatgpt-image-latest',
  output_format: 'webp',
  quality: 'medium',
  n: 1,
} as const);
