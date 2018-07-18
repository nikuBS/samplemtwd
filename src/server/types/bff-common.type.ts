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

export const SVC_ATTR = {
  M1: '휴대폰',
  M2: '선불폰',
  M3: 'T pocket Fi',
  M4: 'T Login',
  M5: 'T Wibro',
  S1: '인터넷',
  S2: 'IPTV',
  S3: '집전화',
  O1: '포인트캠'
};

export const SVC_CATEGORY = {
  M: '모바일',
  S: '인터넷/집전화/IPTV',
  O: '보안솔루션'
};

export enum LINE_NAME {
  MOBILE = 'M',
  INTERNET_PHONE_IPTV = 'S',
  SECURITY = 'O'
}

export enum COUPON_STATUS_CODE {
  LONG = 'A10',
  DECADE = 'A14',
  RECEIVED = 'A20'
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

export enum REQUEST_VALUE {
  Y = '신청',
  N = '미신청'
}

export enum PAYMENT_OPTION {
  BANK = '01',
  CARD = '02',
  GIRO = '03',
  VIRTUAL = '04'
}

export enum PAYMENT_OPTION_TEXT {
  BANK = '은행계좌이체',
  CARD = '체크/신용카드',
  GIRO = '지로납부',
  VIRTUAL = '입금전용계좌납부',
  BANK_NAME = '은행명',
  CARD_NAME = '카드사',
  ACCOUNT = '계좌번호',
  CARD_NUM = '카드번호'
}

export const BILL_GUIDE_TYPE = {
  'TWORLD': 'P',
  'BILL_LETTER': 'H',
  'SMS': 'B',
  'EMAIL': '2',
  'BILL_LETTER_EMAIL': 'I',
  'SMS_EMAIL': 'A',
  'BILL_LETTER_SMS': 'Q',
  'ETC': '1'
};

export const WIRE_BILL_GUIDE_TYPE = {
  'TWORLD': 'P',
  'BILL_LETTER': 'J',
  'SMS': 'B',
  'EMAIL': '2',
  'BILL_LETTER_EMAIL': 'K',
  'SMS_EMAIL': 'A',
  'BILL_LETTER_SMS': 'Q',
  'ETC': '1'
};

export const BILL_GUIDE_TYPE_WITH_WIRE = {
  'P': BILL_GUIDE_TYPE.TWORLD,
  'J': BILL_GUIDE_TYPE.BILL_LETTER,
  'B': BILL_GUIDE_TYPE.SMS,
  '2': BILL_GUIDE_TYPE.EMAIL,
  'K': BILL_GUIDE_TYPE.BILL_LETTER_EMAIL,
  'A': BILL_GUIDE_TYPE.SMS_EMAIL,
  'Q': BILL_GUIDE_TYPE.BILL_LETTER_SMS,
  '1': BILL_GUIDE_TYPE.ETC
};

export const LOGIN_NOTICE_TYPE = {
  NEW_CUSTOMER: '01',
  EXIST_CUSTOMER: '02',
  NEW_LINE: '03',
  BIZ_DELETE: '04'
};