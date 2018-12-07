export const REDIS_URL_META = 'UrlMetaNode:';
export const REDIS_MASKING_METHOD = 'MaskAuthMethods';
export const REDIS_APP_VERSION = 'AppVersion:appLoad';

export const REDIS_PRODUCT_INFO = 'ProductLedger:';
export const REDIS_PRODUCT_FILTER = 'ProductFilter:';
export const REDIS_PRODUCT_COMPARISON = 'ProductComparison:';

export const REDIS_SC_URL = 'Scuturl:';
export const REDIS_QUICK_MENU = 'UserQuickMenuByUser:';
export const REDIS_QUICK_DEFAULT = 'UserQuickMenuByMbrGr:';
export const REDIS_TOOLTIP = 'ToolTip:';
export const REDIS_MENU = 'FrontMenuList:';
export const REDIS_SMART_CARD = 'SmartCardSorting:';
export const REDIS_RCM_MENU = 'FrontRcmndMenu:';
export const REDIS_BANNER_ADMIN = 'Banner:';
export const REDIS_BANNER_TOS_LINK = 'BannerTosLnkgInfo:';
export const REDIS_BANNER_TOS_KEY = 'BannerTosKey:';
export const REDIS_BANNER_TOS_META = 'BannerTosInfo:';
export const REDIS_HOME_NOTI = 'HomeNotiList';
export const REDIS_HOME_NOTICE = 'HomeNotice:';
export const REDIS_HOME_HELP = 'HomeCicntsList';

export enum REDIS_CODE {
  CODE_SUCCESS = '00',
  CODE_EMPTY = '01',
  CODE_ERROR = '02'
}

export enum CHANNEL_CODE {
  PC = 'O',
  MWEB = 'M',
  IOS = 'I',
  ANDROID = 'A'
}

export enum MENU_CODE {
  MWEB = '01',
  ONWEB = '04',
  MAPP = '05'
}
