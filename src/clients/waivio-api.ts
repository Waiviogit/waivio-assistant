import axios from 'axios';
import FormData from 'form-data';
import { configService } from '../config';
import { ExtendedAccount } from '@hiveio/dhive';
import { createFetchRequest } from '../assistant/helpers/createFetchRequest';

type Object = {
  name: string;
  avatar: string;
  author_permlink: string;
  object_type: string;
  campaigns: {
    campaignTypes: string[];
  };
  propositions: { type: string }[];
};

type WobjectsWithActiveCampaignResponse = {
  wobjects: Object[];
};

type UsersPostsTitleResponse = {
  result: {
    title: string;
  }[];
};

class WaivioApi {
  async loadBase64Image(base64: string, size?: string) {
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
      if (!result) {
        console.log('Waivio Api failed uploading image');
        return { error: new Error('Internal server error') };
      }
      return { result };
    } catch (error) {
      console.error(error.message);
      return { error };
    }
  }

  async getUser(userName: string): Promise<ExtendedAccount | null> {
    try {
      const response = await fetch(
        `https://${configService.getAppHost()}/api/user/${userName}?with_followings=false`,
      );

      const user = await response.json();
      return user;
    } catch (error) {
      void error;
      return null;
    }
  }

  async requestToAvailableRewards(host: string) {
    const url = `https://${configService.getAppHost()}/api/wobjects/active-campaigns`;
    const response = await createFetchRequest({
      api: { method: 'POST', url },
      params: {},
      accessHost: host,
    });

    if (!response) return '';

    const { wobjects } = response as WobjectsWithActiveCampaignResponse;

    const getCampaignNames = (object: Object) => {
      const propositionTypes = (object.propositions || []).map((el) => el.type);

      const typesArr = [
        ...(object?.campaigns?.campaignTypes || []),
        ...propositionTypes,
      ].filter((el, index, self) => index === self.indexOf(el));

      if (!typesArr.length) return '';
      if (typesArr.length === 1) {
        return `campaign type: ${typesArr[0]},`;
      }
      return `campaign types: ${typesArr.join(', ')},`;
    };

    return wobjects
      .map(
        (o) =>
          `name: ${o.name}, ${getCampaignNames(o)} link: https://${host}/object/${o.author_permlink}`,
      )
      .join('\n');
  }

  async requestRecentTitles(userName: string, host: string) {
    const url = `https://${configService.getAppHost()}/api/user/${userName}/blog/title`;
    const response = await createFetchRequest({
      api: { method: 'POST', url },
      params: {},
      accessHost: host,
    });

    if (!response) return '';

    const { result } = response as UsersPostsTitleResponse;

    return result
      .map((p) => p.title)
      .filter((el) => !!el)
      .join(',');
  }

  async getGuestUserMana(userName: string): Promise<number> {
    try {
      const response = await fetch(
        `https://${configService.getAppHost()}/api/user/${userName}/guest-mana`,
      );

      const data = await response.json();
      return data.result;
    } catch (error) {
      void error;
      return 0;
    }
  }

  async isActiveObjectImport(userName: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.waivio.com/import-objects-service/guest/authorize-import?account=${userName}`,
      );

      const data = await response.json();
      return data.importAuthorization as boolean;
    } catch (error) {
      void error;
      return false;
    }
  }
}

export const waivioApiClient = new WaivioApi();
