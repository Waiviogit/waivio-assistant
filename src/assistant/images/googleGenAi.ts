import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { configService } from '../../config';

export class GoogleGenAi {
  client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  timeout = (ms = 60 * 1000) =>
    new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Request timed out after ${ms}ms`)),
        ms,
      );
    });

  async getPictureBase64ByUrl(url: string): Promise<string> {
    try {
      const result = await fetch(url);
      const arrayBuffer = await result.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString('base64');
    } catch (error) {
      void error;
      return '';
    }
  }

  async imageToText(prompt: string, imageUrl: string) {
    try {
      const picture = await this.getPictureBase64ByUrl(imageUrl);
      if (!picture) {
        return 'Error image processing';
      }
      const pictureData = {
        inlineData: {
          data: picture,
          mimeType: 'image/webp',
        },
      };

      const response = (await Promise.race([
        this.client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [prompt, pictureData],
        }),
        this.timeout(),
      ])) as GenerateContentResponse;

      return response.text;
    } catch (error) {
      void error;
      return 'Error image processing';
    }
  }
}

export const googleGenAi = new GoogleGenAi(configService.getGoogleAIKey());
