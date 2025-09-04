import { tool } from '@langchain/core/tools';
import { waivioApiClient } from '../../clients/waivio-api';

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
        'Use this tool to get campaigns that currently active on site',
      responseFormat: 'content',
    },
  );
