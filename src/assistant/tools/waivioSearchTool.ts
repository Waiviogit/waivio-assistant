import { z } from 'zod';
import { tool } from '@langchain/core/tools';
// import { createFetchRequest } from '../helpers/createFetchRequest';
import axios from 'axios';
import { configService } from '../../config';

const waivioSearchSchema = z.object({
  string: z.string(),
});

type waivioObjectType = {
  name: string;
  description?: string;
  object_type: string;
  defaultShowLink: string;
  avatar?: string;
  author_permlink: string;
};

type waivioUserType = {
  account: string;
  posting_json_metadata?: string;
};

type generalSearchType = {
  wobjects: waivioObjectType[];
  users: waivioUserType[];
};

export const generateSearchToolsForHost = (host: string) => {
  const waivioSearchTool = tool(
    async ({ string }) => {
      configService.getAppHost();
      const url = `https://${configService.getAppHost()}/api/generalSearch`;

      console.log('URL _____________', url);

      const result = await axios.post(
        url,
        {
          string,
          userLimit: 5,
          wobjectsLimit: 15,
        },
        {
          timeout: 20000,
          headers: {
            'Access-Host': host,
          },
        },
      );

      if (!result.data) return 'Error during request';

      const { users, wobjects } = result.data as generalSearchType;
      if (!users?.length && !wobjects?.length) return 'Not found';

      let response = '';
      if (wobjects?.length) {
        const defaultShowLink = wobjects
          .map(
            (el) => `
            name: ${el.name},
            ${el.description ? `description:  ${el.description}` : ''}
            ${el.avatar ? `avatar:  ${el.avatar}` : ''}    
            objectType:  ${el.object_type}
            link:  https://${host}${el.defaultShowLink}
            `,
          )
          .join('\n');
        response += `here is wobjects i found ${defaultShowLink}`;
      }

      if (users?.length) {
        const defaultShowLink = users
          .map(
            (el) => `
            account: ${el.account}, 
            ${
              el.posting_json_metadata
                ? `posting_json_metadata:  ${el.posting_json_metadata}`
                : ''
            } 
            link:  https://${host}/@${el.account}
            `,
          )
          .join('\n');
        response += `here is user accounts i found :${defaultShowLink} posting_json_metadata is kind of settings for hive accounts you can find additional info there`;
      }

      return response;
    },
    {
      name: 'waivioSearchTool',
      description:
        'Search waivio objects (products, books, shops, recipe etc) and user accounts',
      schema: waivioSearchSchema,
      responseFormat: 'content',
    },
  );

  return {
    waivioSearchTool,
  };
};
