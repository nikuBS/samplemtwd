export enum DATA_UNIT {
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
  TB = 'TB',
  PB = 'PB'
}

export enum VOICE_UNIT {
  HOURS = '시간',
  MIN = '분',
  SEC = '초'
}

export enum SKIP_NAME {
  UNLIMIT = '무제한',
  DEFAULT = '기본제공량',
  EXCEED = 'LT' // 초과
}

export const USER_CNT = ['한 분', '두 분', '세 분', '네 분', '다섯 분'];

export enum MSG_STR {
  TEST = '안녕하세요',
  CUSTOMER_CENTER_TEL = '1599-0011'
}

export enum MYT_VIEW {
  ERROR = 'error/myt.usage.error.html'
}

export enum PAYMENT_VIEW {
  ERROR = 'error/payment.realtime.error.html'
}

export const MYT_REISSUE_TYPE = {
  '05': 'Bill Letter',
  '10': '문자',
  '02': '이메일',
  '04': '기타'
};

export enum BILL_GUIDE_TYPE_NAME {
  TWORLD = 'T world 확인',
  BILL_LETTER = 'Bill Letter',
  SMS = '문자',
  EMAIL = '이메일',
  BILL_LETTER_EMAIL = 'Bill letter + 이메일',
  SMS_EMAIL = '문자 + 이메일',
  BILL_LETTER_SMS = 'Bill letter + 문자',
  ETC = '기타(우편)'
}

export enum BILL_GUIDE_SELECTOR_LABEL {
  TWORLD = 'T world 확인 추천!',
  BILL_LETTER = 'Bill Letter',
  SMS = '문자 요금안내서',
  EMAIL = '이메일 요금안내서',
  BILL_LETTER_EMAIL = 'Bill Letter + 이메일 요금안내서',
  SMS_EMAIL = '문자 + 이메일 요금안내서',
  BILL_LETTER_SMS = 'Bill Letter + 문자 요금안내서',
  ETC = '기타(우편) 요금안내서'
}
