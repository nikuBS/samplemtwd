export const CHANNEL_TYPE = {
  MOBILE_APP: 'mobile-app',
  MOBILE_WEB: 'mobile-web'
};
export const COOKIE_KEY = {
  DEVICE: 'TWM_DEVICE',
  CHANNEL: 'TWM_CHANNEL',
  TWM_LOGIN: 'TWM_LOGIN',
  TWM: 'TWM',
  TID_SSO: 'SKTSSO',
  SESSION: 'SESSION',
  LAYER_CHECK: 'LAYER_CHECK',
  APP_API: 'APP_API',
  XTLID: 'XTLID',
  XTLOGINID: 'XTLOGINID',
  XTUID: 'XTUID',
  XTLOGINTYPE: 'XTLOGINTYPE',
  XTSVCGR: 'XTSVCGR',
  XT_LOGIN_LOG: 'XT_LOGIN_LOG'
};

export enum FIDO_TYPE {
  FINGER = 'finger',
  FACE = 'face'
}

export enum BUILD_TYPE {
  BLUE = 'b',
  GREEN = 'g'
}

export const UPLOAD_TYPE = {
  EMAIL: 'email',
  RESERVATION: 'reservation',
  SUSPEND: 'suspend'
};

export const TID_LOGOUT = {
  DEFAULT: 0,
  LOGIN_FAIL: 1,
  EXCEED_FAIL: 2
};
