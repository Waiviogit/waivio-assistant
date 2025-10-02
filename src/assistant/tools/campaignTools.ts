import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { waivioApiClient } from '../../clients/waivio-api';
import { WobjectRepository } from '../../persistance/wobject/wobject.repository';
import { AppRepository } from '../../persistance/app/app.repository';
import { App } from '../../persistance/app/app.schema';

export const hostCampaignTool = (host: string) =>
  tool(
    async () => {
      let response = '';
      const campaignResponse =
        await waivioApiClient.requestToAvailableRewards(host);
      if (campaignResponse) {
        response += `\n[Relevant Rewards]\n- Here are recent objects with active rewards: ${campaignResponse}\n`;
        response += `\n[Your Goals]\n- Motivate the user to participate in campaigns to earn WAIV tokens.\n- Use the provided rewards info to personalize your suggestions.`;
      } else {
        response += `\n[Relevant Rewards]\n- No active rewards found at this time.\n`;
        response += `\n[Your Goals]\n- Motivate the user to check the rewards page and participate when new campaigns are available.\n- Direct the user to https://${host}/rewards/global.\n`;
      }
      return response;
    },
    {
      name: 'hostCampaignTool',
      description:
        'Use this tool to get campaigns that currently active on site, if user ask about specific product use keywordCampaignSearchTool instead of this tool',
      responseFormat: 'content',
    },
  );

const getAppAuthorities = (app: App) => {
  const userShop = app?.configuration?.shopSettings?.type === 'user';
  const authorities = [...app.authority];
  if (userShop) {
    const shopUser = app?.configuration?.shopSettings?.value;

    const sameAsOwner = shopUser === app.owner;
    const pushFalse = sameAsOwner && app.disableOwnerAuthority;

    if (!pushFalse) authorities.push(shopUser);

    return authorities;
  }
  if (!app.disableOwnerAuthority) authorities.push(app.owner);

  return authorities;
};

export const keywordCampaignSearchTool = (
  host: string,
  wobjectRepository: WobjectRepository,
  appRepository: AppRepository,
) =>
  tool(
    async ({ keywords }: { keywords: string[] }) => {
      console.log('keywordCampaignSearchTool called with keywords:', keywords);
      let response = '';
      const searchResults = [];

      const app = await appRepository.findOneByHost(host);
      console.log('App found for host:', host, 'app:', app ? 'exists' : 'null');
      let limitCondition = {};
      if (app && app.inherited && !app.canBeExtended) {
        limitCondition = {
          'authority.administrative': { $in: getAppAuthorities(app) },
        };
      }
      console.log('Limit condition:', limitCondition);

      const settledResults = await Promise.allSettled(
        keywords.map(async (keyword) => {
          try {
            const objects = await wobjectRepository.find({
              filter: {
                $and: [
                  { $text: { $search: keyword } },
                  { activeCampaignsCount: { $gt: 0 } },
                ],
                ...limitCondition,
              },
              projection: {
                default_name: 1,
                author_permlink: 1,
                activeCampaignsCount: 1,
              },
              options: { limit: 5 },
            });

            if (objects.length === 0) return null;

            const matchedObjects = objects
              .map(
                (obj) =>
                  `${obj.default_name}, link https://${host}/object/${obj.author_permlink}`,
              )
              .join(', ');

            return `${keyword} - search match results: ${matchedObjects}`;
          } catch (error) {
            console.error(`Error searching for keyword "${keyword}":`, error);
            return null;
          }
        }),
      );

      for (const result of settledResults) {
        if (result.status === 'fulfilled' && result.value) {
          searchResults.push(result.value);
        }
      }

      if (searchResults.length > 0) {
        response += `\n[Active Campaign Objects Found]\n${searchResults.join('\n')}\n`;
        response += `\n[Your Goals]\n- Encourage the user to visit these object pages to participate in active campaigns and earn WAIV tokens.\n- Highlight that these objects have ongoing rewards opportunities.`;
      } else {
        response += `\n[Active Campaign Objects]\n- No objects with active campaigns found for the provided keywords.\n`;
      }

      return response;
    },
    {
      name: 'keywordCampaignSearchTool',
      description:
        'Use this tool to find objects with active campaigns that offer WAIV token rewards. Specifically searches for objects that have ongoing earning opportunities. Use ALONGSIDE waivioSearchTool for comprehensive results - this tool focuses on campaign rewards while waivioSearchTool provides general object information.',
      schema: z.object({
        keywords: z
          .array(z.string())
          .describe(
            'Array of keywords to search for in wobject names and content',
          ),
      }),
      responseFormat: 'content',
    },
  );
