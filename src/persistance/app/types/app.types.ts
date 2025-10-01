import { Document } from 'mongoose';
import {
  App,
  AppBot,
  AppCity,
  AppColors,
  AppCommissions,
  AppConfiguration,
  AppMapPoints,
  AppTagsData,
  AppTopUsers,
  ReferralTimers,
} from '../app.schema';

export type AppBeneficiaryType = {
  account: string;
  percent: number;
};

export type ChosenPostType = {
  account: string;
  permlink: string;
  title: string;
};

export type AppMapPointsDocumentType = AppMapPoints & Document;

export type AppCityDocumentType = AppCity & Document;

export type AppColorsDocumentType = AppColors & Document;

export type AppConfigurationDocumentType = AppConfiguration & Document;

export type AppTopUsersDocumentType = AppTopUsers & Document;

export type AppBotDocumentType = AppBot & Document;

export type AppCommissionsDocumentType = AppCommissions & Document;

export type ReferralTimersDocumentType = ReferralTimers & Document;

export type AppTagsDataDocumentType = AppTagsData & Document;

export type AppDocumentType = App & Document;
