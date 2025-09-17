export const AGENTS = {
  UserTools: 'UserTools',
  // ObjectSearch: 'ObjectSearch',
  CampaignManagement: 'CampaignManagement',
  EarnCampaign: 'EarnCampaign',
  ObjectImport: 'ObjectImport',
  SitesManagement: 'SitesManagement',
  WaivioObjects: 'WaivioObjects',
  WaivioGeneral: 'WaivioGeneral',
};

export const QA_COLLECTION = 'WaivioQnA';

export const AGENTS_DESCRIPTION = {
  UserTools:
    'questions related to user tools, including account settings, notifications, profile management, wallet, WAIV token, drafts, bookmarks, user affiliate codes, new accounts (VIP tickets), inviting other users, managing user shops, and favorites - UserTools',
  // ObjectSearch:
  //   'search of specific product, book, person, recipe, business, restaurant, or user account, customer support contacts, contact with owner - ObjectSearch',
  CampaignManagement:
    'questions related to the creation and management of campaigns - CampaignManagement',
  EarnCampaign:
    'questions related to how create review post and earn crypto - EarnCampaign',
  ObjectImport:
    'questions related to how import objects to waivio - ObjectImport',
  SitesManagement:
    'questions about how to create and manage sites, including basic information about social site views, features, peculiarities, and structure - SitesManagement, also some info about existing sites',
  WaivioObjects:
    'questions related to how objects works, how create objects, how to fill objects with info, object types - WaivioObjects',
  WaivioGeneral:
    'general questions related to waivio how it works, what it is, about posts, newsfeeds, shops, hive account - WaivioGeneral',
} as const;
