import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { createFetchRequest } from '../helpers/createFetchRequest';
import { configService } from '../../config';
import { MAP_OBJECTS } from '../constants/common';

const restaurantTypes = [
  'cafe',
  'restaurant',
  'food',
  'pizza',
  'sushi',
  'coffee',
  'coffeeshop',
];

const waivioSearchSchema = z.object({
  string: z.string(),
});

const waivioSearchUserSchema = z.object({
  string: z.string().describe('search string for username'),
});

const waivioSearchMapSchema = z
  .object({
    string: z
      .string()
      .optional()
      .describe(
        `search string for short tag you may retrieve from query, for example: 
        coffeeshop, coffee, btc, pizza, cafe, campground, beautysalon.
        use only one word best match the query.
        Don't use ${MAP_OBJECTS.join(',')} words, if you define them as best match send empty string.
        You also can send empty string if you can't come up with the right tag
        `,
      ),
    box: z.object({
      topPoint: z
        .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
        .describe(
          'top right coordinate of the box first element longitude, second element latitude',
        ),
      bottomPoint: z
        .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
        .describe(
          'bottom left coordinate of the box first element longitude, second element latitude',
        ),
    }),
    object_type: z
      .enum(Object.values(MAP_OBJECTS) as [string, ...string[]])
      .optional()
      .describe(
        `use for filter results for particular type example:
         I want find restaurants in Vancouver => object_type: "restaurant".
         Valid types: ${MAP_OBJECTS.join(',')}.
         If you see in query words like ${restaurantTypes.join(',')} and others connected to food or drink service
         it is restaurant type
         `,
      ),
  })
  .describe('use only map or box not both');

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

type siteFirstLoadType = {
  owner: string;
};

type userSearchType = {
  users: waivioUserType[];
};

const wobjectsFormatResponse = (
  objects: waivioObjectType[],
  host: string,
): string => {
  return objects
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
};

const usersFormatResponse = (users: waivioUserType[], host: string): string => {
  return users
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
};

export const generateSearchToolsForHost = (host: string) => {
  const waivioSearchTool = tool(
    async ({ string }) => {
      configService.getAppHost();
      const url = `https://${configService.getAppHost()}/api/generalSearch`;

      const result = await createFetchRequest({
        api: { method: 'POST', url },
        params: {
          string,
          userLimit: 5,
          wobjectsLimit: 15,
        },
        accessHost: host,
      });

      if (!result) return 'Error during request';

      const { users, wobjects } = result as generalSearchType;
      if (!users?.length && !wobjects?.length) return 'Not found';

      if (!wobjects?.length) return 'Not found';

      return `here is objects i found ${wobjectsFormatResponse(wobjects, host)}`;
    },
    {
      name: 'waivioSearchTool',
      description: 'Search waivio objects (products, books, shops, recipe etc)',
      schema: waivioSearchSchema,
      responseFormat: 'content',
    },
  );
  const waivioObjectsMapTool = tool(
    async ({ box, object_type, string }) => {
      const url = `https://${configService.getAppHost()}/api/wobjects/search-area`;

      const result = await createFetchRequest({
        api: { method: 'POST', url },
        params: { box, object_type, string },
        accessHost: host,
      });

      if (!result) return 'Error during request';

      const { wobjects } = result as generalSearchType;
      if (!wobjects?.length) return 'Not found';

      return `here is objects i found ${wobjectsFormatResponse(wobjects, host)}`;
    },
    {
      name: 'waivioObjectsMapTool',
      description:
        'Search waivio objects in particular area for example: find objects in London etc. you have tools: map - search from center in radius or box - search in box coordinates, choose only one',
      schema: waivioSearchMapSchema,
      responseFormat: 'content',
    },
  );

  const waivioOwnerContactTool = tool(
    async () => {
      const url = `https://${configService.getAppHost()}/api/sites`;

      const result = await createFetchRequest({
        api: { method: 'POST', url },
        params: {},
        accessHost: host,
      });

      if (!result) return 'Error during request';

      const { owner } = result as siteFirstLoadType;
      if (!owner) return 'Not found';

      return `to contact site owner go to https://${host}/@${owner}/threads`;
    },
    {
      name: 'waivioOwnerContactTool',
      description:
        'Use this tool for get contacts of site owner, customer support contacts',
      responseFormat: 'content',
    },
  );
  const waivioUserSearchTool = tool(
    async ({ string }) => {
      console.log('HOST', host);
      console.log('STRING', string);
      const url = `https://${configService.getAppHost()}/api/users/search/host`;

      const result = await createFetchRequest({
        api: { method: 'POST', url },
        params: { string, host },
        accessHost: host,
      });
      console.log('RESULT', JSON.stringify(result));

      if (!result) return 'Error during request';

      const { users } = result as userSearchType;
      if (!users?.length) return 'Not found';

      return `${usersFormatResponse(users, host)} posting_json_metadata is kind of settings for hive accounts you can find additional info there`;
    },
    {
      name: 'waivioUserSearchTool',
      description: 'Use this tool for user account search',
      schema: waivioSearchUserSchema,
      responseFormat: 'content',
    },
  );

  return {
    waivioSearchTool,
    waivioObjectsMapTool,
    waivioOwnerContactTool,
    waivioUserSearchTool,
  };
};
