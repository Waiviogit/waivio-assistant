import { tool } from '@langchain/core/tools';
import { hiveClient } from '../../clients/hiveClient';
import { waivioApiClient } from '../../clients/waivio-api';

export const userVotingPowerTool = (currentUser?: string) =>
  tool(
    async () => {
      if (!currentUser) return 'user is not logged in';
      if (currentUser.includes('_')) {
        const mana = waivioApiClient.getGuestUserMana(currentUser);
        return `Guest users have only mana, your mana is ${mana}`;
      }

      const power = await hiveClient.getVotingPower(currentUser);
      return `Current voting power is ${power / 100}`;
    },
    {
      name: 'userVotePowerTool',
      description:
        'Use this tool to get user voting power (vp) min 0% max 100%',
      responseFormat: 'content',
    },
  );

export const userResourceCreditTool = (currentUser?: string) =>
  tool(
    async () => {
      if (!currentUser) return 'user is not logged in';
      if (currentUser.includes('_')) {
        const mana = waivioApiClient.getGuestUserMana(currentUser);
        return `Guest users have only mana, your mana is ${mana}`;
      }
      const rc = await hiveClient.getAccountRCPercentage(currentUser);
      return `Current resource credits is ${rc / 100}`;
    },
    {
      name: 'userResourceCreditTool',
      description:
        'Use this tool to get user resource credits (mana) min 0% max 100%',
      responseFormat: 'content',
    },
  );

export const userProfileTool = (currentUser?: string) =>
  tool(
    async () => {
      if (!currentUser) return 'user is not logged in';

      const user = await waivioApiClient.getUser(currentUser);
      if (!user) return 'user not found';

      try {
        const metdata = JSON.parse(user.posting_json_metadata);
        if (!metdata.profile) return 'no profile info found';

        return `profile data ${JSON.stringify(metdata.profile)}`;
      } catch (error) {
        void error;
        return 'error during parsing profile';
      }
    },
    {
      name: 'userProfileTool',
      description:
        'Use this tool to get user profile info such as: social links, about, cover and profile image ',
      responseFormat: 'content',
    },
  );

export const userRecentPostTitlesTool = (host: string, currentUser?: string) =>
  tool(
    async () => {
      if (!currentUser) return 'user is not logged in';

      const titles = await waivioApiClient.requestRecentTitles(
        currentUser,
        host,
      );
      if (titles) return `[User recent post titles]: ${titles}`;
      return 'posts not found';
    },
    {
      name: 'userRecentPostTitlesTool',
      description: 'Use this tool to get user recent post titles',
      responseFormat: 'content',
    },
  );

export const userCheckImportTool = (currentUser?: string) =>
  tool(
    async () => {
      if (!currentUser) return 'user is not logged in';

      const methodToCall = currentUser.includes('_')
        ? waivioApiClient.isActiveObjectImport
        : hiveClient.isActiveObjectImport;

      const response = await methodToCall(currentUser);

      return response ? 'Import is enabled' : 'Import is disabled';
    },
    {
      name: 'userCheckImportTool',
      description:
        'Use this tool check if user activated Object import service',
      responseFormat: 'content',
    },
  );

export const userPageContextTool = (currentPageContent?: string) =>
  tool(
    async () => {
      if (!currentPageContent) return 'no page context';

      return currentPageContent;
    },
    {
      name: 'userPageContextTool',
      description:
        "Use this tool to see user's current page content (if he asks to proofread post with no details or answer about some data on page he currently on)",
      responseFormat: 'content',
    },
  );
