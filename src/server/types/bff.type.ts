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

export const PLM_PARSING_CASE = {
  DATA_CASE_0: ['NA00004098', 'NA00004099', 'NA00004100', 'NA00004101', 'NA00004145', 'NA00004102', 'NA00004705', 'NA00004704'],
  DATA_CASE_1: ['NA00002591', 'NA00002591', 'NA00002592', 'NA00002593', 'NA00002594', 'NA00002669', 'NA00002670', 'NA00002671',
    'NA00002520', 'NA00002521', 'NA00002518', 'NA00003806', 'NA00003386', 'NA00003387', 'NA00002519'],
  SMS_CASE_0: ['NA00004098', 'NA00004099', 'NA00004100', 'NA00004101', 'NA00004145', 'NA00004102', 'NA00004705', 'NA00004704'],
  SMS_CASE_1: ['999999999', '999,999,999', '무제한', '기본제공'],
  VOICE_CASE_0: ['NA00004098', 'NA00004099', 'NA00004100', 'NA00004101', 'NA00004145', 'NA00004102', 'NA00004705', 'NA00004704', 'NA00004461'],
  VOICE_CASE_1: ['999999999', '999,999,999', '무제한'],
  VOICE_CASE_2: ['999,999,995', '999999995'],
  VOICE_CASE_3: ['999,999,996', '999999996'],
  VOICE_CASE_4: ['999,999,997', '999999997'],
  VOICE_CASE_5: ['999,999,998', '999999998'],
  PRICE_0: ['NA00002521', 'NA00002519', 'NA00002520', 'NA00002518', 'NA00003386', 'NA00003387']
};
