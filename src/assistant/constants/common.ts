export const REDIS_KEYS = {
  API_RES_CACHE: 'api_res_cache',
  ASSISTANT: 'assistant',
};

export const TTL_TIME = {
  ONE_MINUTE: 60,
  TEN_MINUTES: 60 * 10,
  THIRTY_MINUTES: 1800,
  ONE_DAY: 86400,
  SEVEN_DAYS: 86400 * 7,
  THIRTY_DAYS: 86400 * 30,
};

export const OBJECT_TYPES = {
  HASHTAG: 'hashtag',
  LIST: 'list',
  PAGE: 'page',
  RESTAURANT: 'restaurant',
  DISH: 'dish',
  DRINK: 'drink',
  BUSINESS: 'business',
  PRODUCT: 'product',
  SERVICE: 'service',
  COMPANY: 'company',
  PERSON: 'person',
  PLACE: 'place',
  CRYPTO: 'crypto',
  HOTEL: 'hotel',
  INDICES: 'indices',
  STOCKS: 'stocks',
  CURRENCIES: 'currencies',
  COMMODITY: 'commodity',
  CAR: 'car',
  TEST: 'test',
  ORGANIZATION: 'organization',
  MOTEL: 'motel',
  RESORT: 'resort',
  BnB: 'b&b',
  BOOK: 'book',
  WIDGET: 'widget',
  NEWS_FEED: 'newsfeed',
  SHOP: 'shop',
  AFFILIATE: 'affiliate',
  WEB_PAGE: 'webpage',
  MAP: 'map',
  LINK: 'link',
  RECIPE: 'recipe',
  GROUP: 'group',
};

export const MAP_OBJECTS = [OBJECT_TYPES.RESTAURANT, OBJECT_TYPES.BUSINESS];
