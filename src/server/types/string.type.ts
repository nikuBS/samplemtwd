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
  TEST = '안녕하세요'
}

export enum MYT_VIEW {
  ERROR = 'error/myt.usage.error.html'
}

export enum PAYMENT_VIEW {
  ERROR = 'error/payment.realtime.error.html'
}

export enum MYT_REISSUE_TYPE {
  '01' = 'Bill Letter',
  '02' = '문자',
  '03' = '이메일',
  '04' = '기타'
}
