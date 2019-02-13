Tw.NTV_CMD = {
  TOAST: 'toast',
  GET_CONTACT: 'getContact',
  GET_DEVICE: 'getDevice',
  GET_LOCATION: 'currentLocation',
  OPEN_URL: 'openUrl',
  CLOSE_INAPP: 'closeInApp',
  SIGN_UP: 'signUp',
  LOGIN: 'login',
  LOGOUT: 'logout',
  FIND_ID: 'findId',
  FIND_PW: 'findPw',
  CHANGE_PW: 'changePw',
  ACCOUNT: 'account',
  CERT_PW: 'certPw',
  GET_MDN: 'getMdn',
  CLEAR_HISTORY: 'clearHistory',
  GET_NETWORK: 'getNetwork',
  GET_IP: 'getIp',
  GET_CERT_NUMBER: 'getCertNumber',
  IMPORT_CERT: 'importCert',
  MANAGE_CERT: 'manageCert',
  GO_CERT: 'goCert',
  AUTH_CERT: 'authCert',
  FIDO_CHECK: 'fidoCheck',
  FIDO_REGISTER: 'fidoRegister',
  FIDO_AUTH: 'fidoAuth',
  FIDO_DEREGISTER: 'fidoDeregister',
  FIDO_TYPE: 'fidoType',
  SERVER_SESSION: 'serverSession',
  SESSION: 'session',
  EXIT: 'exit',
  LOG: 'log',
  SHARE: 'share',
  IS_INSTALLED: 'isAppInstall',
  FREE_SMS: 'freeSMS',
  SET_XTVID: 'setXtvId',
  SET_XTSVCINFO: 'setXtSvcInfo',
  OPEN_APP: 'openApp',
  SAVE: 'save',
  LOAD: 'load',
  IS_APP_CREATED: 'isAppCreated',
  OPEN_NETWORK_ERROR_POP: 'openNetworkErrorPop',
  OPEN_FILE_CHOOSER: 'openFileChooser',
  CAN_GO_HISTORY: 'canGoHistory',
  SET_SWIPE_GESTURE_ENABLED: 'setSwipeGestureEnabled'
};

Tw.NTV_CODE = {
  CODE_00: 0, // success (FIDO_TYPE: fingerprint)
  CODE_01: 1, // (FIDO_TUYPE: face)
  CODE_02: 2,
  CODE_1500: 1500,
  CODE_ERROR: -1,

  CODE_A80: 'A80'
};

Tw.NTV_ERROR_MSG = {
  A80: '무료문자 서비스는 SK텔레콤 휴대폰 번호를 등록하셔야 사용하실 수 있습니다. 지금 \'회선등록\' 버튼을 클릭하여 T world에서 이용하실 회선을 등록해 주세요.'
};

Tw.IOS_URL = 'tworld://';

Tw.NTV_BROWSER = {
  INAPP: 0,
  EXTERNAL: 1
};

Tw.NTV_LOG_T = {
  ERROR: 0,
  DEBUG: 1
};

Tw.NTV_LOGINTYPE = {
  DEFAULT: 0,
  ACTION_SHEET: 1
};

Tw.NTV_STORAGE = {
  MOST_RECENT_PUSH_SEQ: 'mostRecentPushSeq',
  LAST_READ_PUSH_SEQ: 'lastReadPushSeq',
  HOME_WELCOME: 'homeWelcome',
  FIDO_USE: 'fidoUse',
  COACH_LINE: 'coachLine',
  COACH_DATA: 'coachData',
  COACH_MASKING: 'coachMasking',
  COACH_QUICK: 'coachQuick'
};

Tw.NTV_PAGE_KEY = {
  T_NOTI: 'tNotify',
  HOME_WELCOME: 'homeWelcome'
};

