export const SVC_CD = {
  C: '휴대폰',
  S: 'PPS',
  F: 'TPocket-FI',
  L: 'Tlogin',
  W: 'WiBro',
  P: '집전화',
  T: 'IPTV',
  I: '인터넷'
};

export const UNIT = {
  '110': '원',
  '140': 'KB',
  '240': '초',
  '310': '건',
  '320': '건'
};

export enum UNIT_E {
  FEE = '110',
  DATA = '140',
  VOICE = '240',
  SMS = '310',
  SMS_2 = '320'
}

export enum LINE_NAME {
  MOBILE = 'M',
  INTERNET_PHONE_IPTV = 'W',
  SECURITY = 'S'
}

export enum REFILL_CODE {
  DATA = 'D',
  VOICE = 'V'
}

export const REFILL_TXT = {
  'D': '데이터',
  'V': '음성'
};

export const REFILL_CLASS_NAME = {
  'D': 'data',
  'V': 'ngt'
};

export const DAY_BTN_STANDARD_SKIP_ID = [
  'DDZ25', // BTV 모바일팩
  'DDZ23', // T스포츠팩
  'DD0PB' // band 타임 프리
];

export const TING_TITLE = {
  'HA': '통화가능금액',
  'CH': '충전금액',
  'PR': '선물충전금액'
};
