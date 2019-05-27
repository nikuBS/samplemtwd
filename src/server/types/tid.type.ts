export enum TID_SVC_TYPE {
  SSO_LOGIN = 9,
  LOGIN = 14,
  ID_LOGIN = 16,
  SSO_LOGOUT = 19,
  SIGN_UP = 20,
  GET_ACCOUNT = 21,
  FIND_ID = 22,
  /*
   * 23은 비밀번호 찾기가 아닌, 비로그인 시 비밀번호 재설정이며, 
   * FIND_PW 삭제 시 오류 발생 가능성으로 인하여 삭제하지 않는다.
   */
  FIND_PW = 23,
  // CHANGE_PW = 24,
  CHANGE_PW = 23,
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
