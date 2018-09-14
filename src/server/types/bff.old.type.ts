export enum SVC_GR {
  A = 'A',
  B = 'Y',
  C = 'R',
  D = 'D',
  E = 'E',
  P = 'P',
  W = 'W',
  S1 = 'I',
  S2 = 'T',
  S3 = 'U',
  O = 'O'
}

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

export const SVC_CDNAME = {
  M1: 'cellphone',
  M2: 'pps',
  M3: 't-series',
  M4: 't-series',
  M5: 't-series',
  S1: 'skbroadband',
  S2: 'skbroadband',
  S3: 'skbroadband',
  O1: 'pointcam'
};

export const SVC_CDGROUP = {
  WIRELESS: ['M1', 'M2', 'M3', 'M4', 'M5'],
  WIRE: ['S1', 'S2', 'S3']
};

export const UNIT = {
  '110': '원',
  '140': 'KB',
  '240': '초',
  '910': '초',
  '310': '건',
  '320': '건'
};

export enum UNIT_E {
  FEE = '110',
  DATA = '140',
  VOICE = '240',
  VOICE_2 = '910',
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
  CARD_NUM = '카드번호',
  ZERO = '0'
}

export enum AUTO_CHARGE_CODE {
  USE = 'U',
  UNUSE = 'D'
}

export enum PREPAY_TITLE {
  MICRO = '소액결제',
  CONTENTS = '콘텐츠이용료',
  PREPAY = '선결제하기',
  AUTO_PREPAY = '자동 선결제 신청',
  AUTO_PREPAY_HISTORY = '자동 선결제 상세보기'
}

export enum MYT_PAY_HISTORY_TITL {
  MICRO = '소액결제 이용내역',
  CONTENTS = '콘텐츠 이용료 이용내역'
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

export const TDATA_SHARE_SVC_ST_CD = {
  AC: 'AC', // 분실신고
  SP: 'SP'  // 분실
};

export const VOICE_UNIT = {
  HOURS: '시간',
  MIN: '분',
  SEC: '초'
};

export enum REQUEST_TYPE {
  R = '신규',
  C = '변경',
  F = '해지'
}

export enum PROMOTION_TYPE {
  N = '일반형',
  E = '응모형'
}

export const COMBINATION_PRODUCT_TYPE = {
  'NA00005055': 'share-data',  // 가족나눔데이터
  'NA00004211': 'share-data',  // T가족결합(착한가족)
  'NH00000084': 'family-free',
  'TW20000008': 'family-free',  // TB끼리 온가족프리
  'NH00000059': 'family-nocharge',
  'TW20000007': 'family-nocharge',  // TB끼리 온가족무료
  'NH00000037': 'tb-internet',
  'NH00000039': 'tb-internet',
  'TW00000062': 'tb-internet',  // T+B인터넷
  'NH00000040': 'tb-internet',
  'NH00000041': 'tb-internet',
  'TW00000063': 'tb-internet',  // T+B전화/인터넷전화
  'NA00002040': 'tfamily-discount',
  'TW20000010': 'tfamily-discount', // T끼리 온가족할인
  'NA00004728': 'happy-plan',
  'TW20000011': 'happy-plan',  // 온가족행복플랜
};

export const COMBINATION_PRODUCT_OTHER_TYPE = ['NH00000103', 'TW00000009', 'NH00000105', 'TW00000016']; // 한가족 할인, TB끼리 TV플러스

export enum RAINBOW_POINT_REL_CD {
  C = 'C',
  P = 'P'
}

export enum LOGIN_TYPE {
  TID = 'T',
  EASY = 'S'
}

export enum AUTH_CERTIFICATION_TYPE {
  PREV = 'P',
  AFTER = 'A',
  FAIL = 'F',
  NOT_USED = 'D'

}

export enum AUTH_CERTIFICATION_METHOD {
  SK_SMS = 'S',
  OTHER_SMS = 'T',
  SMS_PASSWORD = 'Z',
  SMS_KEYIN = 'J',
  PUBLIC_AUTH = 'P',
  FINANCE_AUTH = 'B',
  IPIN = 'I',
  EMAIL = 'E',
  PASSWORD = 'W',
  BIO = 'F',
  SAVE = 'A',
  SK_MOTP = 'M'
}

export enum AUTH_CERTIFICATION_SCOPE {
  REQUEST = 'R',
  PAGE = 'P',
  GROUP = 'G',
  SESSION = 'S',
  CHILD = 'C'
}

