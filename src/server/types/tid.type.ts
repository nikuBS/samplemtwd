/**
 * @file tid.type.ts
 * @author
 * @since 2018.05
 */

export enum TID_SVC_TYPE {
  SSO_LOGIN = 9,
  LOGIN = 14,
  ID_LOGIN = 16,
  SSO_LOGOUT = 19,
  SIGN_UP = 20,
  GET_ACCOUNT = 21,
  FIND_ID = 22,
  FIND_PW = 23,
  CHANGE_PW = 24,
  TERM = 25,
  SECURITY = 26,
  CERT = 40,
  GUIDE = 50
}

export enum TID {
  CLIENT_TYPE = 'MWEB',
  SCOPE = 'openid',
  RESP_TYPE = 'id_token%20token'
}
