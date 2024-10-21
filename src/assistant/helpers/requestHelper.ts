import { configService } from '../../config';
import { createFetchRequest } from './createFetchRequest';

type sitesDescriptionType = {
  result: string;
};

type sitesConfigurationType = {
  advancedAI?: string;
};

export const getSiteDescription = async (host: string): Promise<string> => {
  configService.getAppHost();
  const url = `https://${configService.getAppHost()}/api/sites/description`;
  const response = await createFetchRequest({
    api: { method: 'GET', url },
    params: {},
    accessHost: host,
  });

  const { result } = response as sitesDescriptionType;

  return result;
};

export const getSiteConfig = async (
  host: string,
): Promise<sitesConfigurationType> => {
  configService.getAppHost();
  const url = `https://${configService.getAppHost()}/api/sites/configuration`;
  const response = await createFetchRequest({
    api: { method: 'GET', url },
    params: { host },
    accessHost: host,
  });

  return response as sitesConfigurationType;
};
