export const T_O_PLAN_BASE_DATA = [
  'DD3EA', // T플랜 기본 제공 데이터 인피니티
  'DD3DZ', // 패밀리
  'DD3DO', // 라지
  'DD3DG', // 미디엄
  'DD3D8', // 스몰
  'DD4D1' // O플랜 기본 제공 데이터 라지
];

export const T_O_PLAN_SHARE_DATA = [
  'DD3CX', // T플랜 통합공유 데이터 인피니티
  'DD3CV', // 패밀리
  'DD3CU', // 라지
  'DD4D5' // O플랜 통합공유 데이터 라지
];

export enum SVC_ATTR_NAME {
  'M1' = '휴대폰',
  'M2' = '선불폰',
  'M3' = 'T pocket Wifi',
  'M4' = 'T Login',
  'M5' = 'T Wibro',
  'S1' = '인터넷',
  'S2' = 'IPTV',
  'S3' = '집전화',
  'O1' = '포인트캠'
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

export enum MYT_FARE_PAYMENT_TYPE {
  BANK = '01',
  CARD = '02',
  GIRO = '03',
  VIRTUAL = '04'
}

export const UNIT = {
  '110': '원',
  '140': 'KB',
  '240': '초',
  '910': '초',
  '310': '건',
  '320': '건'
};

export const VOICE_UNIT = {
  HOURS: '시간',
  MIN: '분',
  SEC: '초'
};

export enum MYT_FARE_PAYMENT_TITLE {
  ACCOUNT = '계좌이체',
  CARD = '체크/신용카드',
  OKCASHBAG = 'OK캐쉬백',
  TPOINT = 'T포인트'
}
