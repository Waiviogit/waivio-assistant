import { configService } from '../../config';
import { createFetchRequest } from '../helpers/createFetchRequest';

interface IntentionI {
  host: string;
  currentUser?: string;
}

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

const requestToAvailableRewards = async (host: string) => {
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
};

const requestRecentTitles = async (userName: string, host: string) => {
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
};

export const getIntention = async ({ host, currentUser }: IntentionI) => {
  // Compose a structured, LLM-optimized system prompt
  let prompt = ``;

  if (!currentUser) {
    prompt += `\n[User Status]\n- The user is not logged in.\n`;
    prompt += `\n[Your Goals]\n- Encourage the user to log in or register, preferably using a Google account.\n- Explain the benefits of having an account.\n`;
    prompt += `\n[Instructions]\n- Be friendly and persuasive.\n- Highlight features available after login. Follow up with a relevant, open-ended, goal-oriented question that invites the user to respond, clarify, or request further help. \n`;
    return prompt;
  }

  prompt += `\n[User Status]\n- The user is logged in as: ${currentUser}.\n`;

  const [objectsWithActiveCampaigns, titles] = await Promise.all([
    requestToAvailableRewards(host),
    requestRecentTitles(currentUser, host),
  ]);

  if (titles) prompt += `\n[User recent post titles]: ${titles}`;

  if (objectsWithActiveCampaigns) {
    prompt += `\n[Relevant Rewards]\n- Here are recent objects with active rewards: ${objectsWithActiveCampaigns}\n`;
    prompt += `\n[Your Goals]\n- Motivate the user to participate in campaigns to earn WAIV tokens.\n- Use the provided rewards info to personalize your suggestions.`;
  } else {
    prompt += `\n[Relevant Rewards]\n- No active rewards found at this time.\n`;
    prompt += `\n[Your Goals]\n- Motivate the user to check the rewards page and participate when new campaigns are available.\n- Direct the user to https://${host}/rewards/global.\n`;
  }

  prompt += `\n[Instructions]\n- Be concise, friendly.\n- Personalize your message using the user's name and available rewards info/post info. Follow up with a relevant, open-ended question that invites the user to respond, clarify, or request further help \n`;

  return prompt;
};
