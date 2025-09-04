import { OpenAIClient } from '@langchain/openai';
import { waivioApiClient } from '../../clients/waivio-api';
import {
  GENERATION_PARAMS,
  GENERATION_TIMEOUT,
} from '../constants/imageGeneration';
import { configService } from '../../config';

type GeneralImagePrompt = {
  query: string;
  size: `1024x1024` | `1536x1024` | `1024x1536`;
};

type EditImagePrompt = GeneralImagePrompt & {
  files: File[];
};

type InputImageRequest = GeneralImagePrompt & { images?: string[] };

const IMAGE_GENERATION_ERROR = 'Error while generating image';
class ImageGenerator {
  private readonly openAiClient: OpenAIClient;

  constructor(client: OpenAIClient) {
    this.openAiClient = client;
  }

  private async getImageFileFromUrl(imageUrl: string, fileName = 'image') {
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(
          `Failed to download image: ${imageResponse.statusText}`,
        );
      }
      const imageBuffer = await imageResponse.arrayBuffer();

      const imageFile = new File([imageBuffer], `${fileName}.webp`, {
        type: 'image/webp',
      });

      return imageFile;
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  private generateImage = async ({ query, size }: GeneralImagePrompt) => {
    try {
      const response = await this.openAiClient.images.generate(
        { prompt: query, size, ...GENERATION_PARAMS },
        {
          timeout: GENERATION_TIMEOUT,
        },
      );
      const result = response?.data?.[0]?.b64_json;
      const { result: link } = await waivioApiClient.loadBase64Image(result);

      return link || IMAGE_GENERATION_ERROR;
    } catch (error) {
      console.log(error.message);
      return IMAGE_GENERATION_ERROR;
    }
  };

  async editImageFromUrl({ files, query, size }: EditImagePrompt) {
    try {
      const response = await this.openAiClient.images.edit(
        { image: files, prompt: query, size, ...GENERATION_PARAMS },
        {
          timeout: GENERATION_TIMEOUT,
        },
      );
      const result = response?.data?.[0]?.b64_json;

      const { result: link } = await waivioApiClient.loadBase64Image(result);

      return link || IMAGE_GENERATION_ERROR + '(editing error)';
    } catch (error) {
      console.error('Error editing image:', error);
      return IMAGE_GENERATION_ERROR + '(editing error)';
    }
  }

  async invoke({ query, images, size = '1024x1024' }: InputImageRequest) {
    if (!images?.length) return this.generateImage({ query, size });
    const files: File[] = [];

    for (const [index, image] of images.entries()) {
      const file = await this.getImageFileFromUrl(image, `image${index}`);
      if (file) files.push(file);
    }

    if (!files?.length) return this.generateImage({ query, size });
    console.info('EDIT IMAGE');
    return this.editImageFromUrl({ files, query, size });
  }
}

export const imageGenerator = new ImageGenerator(
  new OpenAIClient({
    apiKey: configService.getOpenAiKey(),
    organization: configService.getOpenAiOrg(),
  }),
);
