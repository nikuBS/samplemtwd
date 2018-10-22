Tw.NTV_CMD = {
  TOAST: 'toast',
  GET_CONTACT: 'getContact',
  GET_DEVICE: 'getDevice',
  GET_LOCATION: 'currentLocation',
  OPEN_URL: 'openUrl',
  CLOSE_INAPP: 'closeInApp',
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
  LOG: 'log'
};

Tw.NTV_CODE = {
  CODE_00: 0,    // success (FIDO_TYPE: fingerprint)
  CODE_01: 1,    // (FIDO_TUYPE: face)
  CODE_ERROR: -1
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
