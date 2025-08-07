import axios from 'axios';
import FormData from 'form-data';
import { configService } from '../config';

export const loadBase64Image = async (base64: string, size?: string) => {
  try {
    const url = `https://${configService.getAppHost()}/api/image`;
    const bodyFormData = new FormData();
    const buffer = Buffer.from(base64, 'base64');

    bodyFormData.append('file', buffer, {
      filename: 'image.webp',
      contentType: 'image/webp',
    });
    if (size) {
      bodyFormData.append('size', size);
    }
    const resp = await axios.post(url, bodyFormData, {
      headers: bodyFormData.getHeaders(),
      timeout: 60000,
    });
    const result = resp?.data?.image as string;
    if (!result) return { error: new Error('Internal server error') };
    return { result };
  } catch (error) {
    console.error(error.message);
    return { error };
  }
};
