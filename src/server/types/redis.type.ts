export enum REDIS_KEY {
  URL_META = 'UrlMetaNode:',
  MASKING_METHOD = 'MaskAuthMethods',
  APP_VERSION = 'AppVersion:appLoad',

  PRODUCT_INFO = 'ProductLedger:',
  PRODUCT_CONTETNS = 'ProductLedgerContents:',
  PRODUCT_PLM_CONTENTS = 'ProductPLMLedgerContents:',
  PRODUCT_FILTER = 'ProductFilter:',
  PRODUCT_COMPARISON = 'ProductComparison:',

  SC_URL = 'ScuturlApi:',
  QUICK_MENU = 'UserQuickMenuByUser:',
  QUICK_DEFAULT = 'UserQuickMenuByMbrGr:',
  TOOLTIP = 'TooltipInfo:',
  MENU = 'FrontMenuList:',
  RCM_MENU = 'FrontRcmndMenu:',
  BANNER_ADMIN = 'Banner:',
  BANNER_TOS_LINK = 'BannerTosLnkgInfo:',
  BANNER_TOS_INFO = 'BannerTosInfo:',
  HOME_NOTI = 'WelcomeMsg:WelcomeMsgList',
  HOME_NOTICE = 'HomeNotice:',
  HOME_HELP = 'HomeCicntsList',
  MENU_URL = 'MenuUrl:',
  SUBMAIN_BANNER = 'SubmainBanner:',
  AUTH_METHOD_BLOCK = 'AuthMethodBlock',
  EX_USER = 'ExUser:'
}

export enum REDIS_TOS_KEY {
  SMART_CARD = 'SmartCardSorting:',
  SMART_CARD_DEFAULT = 'SmartCardSorting:9999999999',
  BANNER_TOS_KEY = 'BannerTosKey:',
  QUICK_MENU = 'UserQuickMenuByUser:'
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
