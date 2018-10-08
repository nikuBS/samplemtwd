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
  M1 = '휴대폰',
  M2 = '선불폰',
  M3 = 'T pocket Wifi',
  M4 = 'T Login',
  M5 = 'T Wibro',
  S1 = '인터넷',
  S2 = 'IPTV',
  S3 = '집전화',
  O1 = '포인트캠'
}

export enum SVC_ATTR_E {
  MOBILE_PHONE = 'M1',
  PPS = 'M2',
  T_POCKET_FI = 'M3',
  T_LOGIN = 'M4',
  T_WIBRO = 'M5',
  INTERNET = 'S1',
  IPTV = 'S2',
  TELEPHONE = 'S3',
  POINT_CAM = 'O1'
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

export enum UNIT_E {
  FEE = '110',
  DATA = '140',
  VOICE = '240',
  VOICE_2 = '910',
  SMS = '310',
  SMS_2 = '320'
}

export const VOICE_UNIT = {
  HOURS: '시간',
  MIN: '분',
  SEC: '초'
};

export enum MYT_FARE_PAYMENT_TITLE {
  ACCOUNT = '계좌이체',
  CARD = '체크/신용카드',
  OKCASHBAG = 'OK캐쉬백',
  TPOINT = 'T포인트',
  SMS = '입금전용계좌 SMS 신청',
  AUTO_NEW = '자동납부 신청',
  AUTO_CHANGE = '자동납부 변경',
  AUTO_CANCEL = '자동납부 해지'
}

export enum MYT_FARE_PAYMENT_NAME {
  NEW = '신청하기',
  CHANGE = '변경하기'
}

export enum MYT_FARE_MICRO_NAME {
  NC = '신청',
  AC = '변경'
}

export enum MYT_FARE_BILL_CO_TYPE {
  TWORLD = 'T',
  BROADBAND = 'B'
}

export enum HOME_SMART_CARD {
  H01 = '자녀 사용량 조회',
  H02 = '요금 안내서',
  H03 = '미납요금',
  H04 = '이용정지',
  H05 = 'T멤버십 혜택',
  H06 = '콘텐츠 이용내역',
  H07 = '소액결제 내역',
  H08 = '컬러링 설정',
  H09 = '단말 분할 상환 정보',
  H10 = '선물하기',
  H11 = '충전하기',
  H12 = '자동 업무처리',
  H13 = '다이렉트샵',
  H14 = 'T로밍',
  H15 = '요금제 변경',
  H16 = '부가 서비스 신청/변경'
}

export enum HOME_SMART_CARD_E {
  CHILD = 'H01',
  BILL = 'H02',
  NON_PAYMENT = 'H03',
  SUSPENSION = 'H04',
  MEMBERSHIP = 'H05',
  CONTENT = 'H06',
  MICRO_PAY = 'H07',
  COLORING = 'H08',
  DEVICE = 'H09',
  GIFT = 'H10',
  RECHARGE = 'H11',
  AUTO = 'H12',
  DIRECT = 'H13',
  ROAMING = 'H14',
  PRODUCT = 'H15',
  ADDITIONAL = 'H16'
}

export const HOME_SEGMENT = [
  'default', 'refill', 'gift', 'inquiry', 'payment', 'membership'
];

export const HOME_SEGMENT_ORDER = {
  default: ['H02', 'H06', 'H07', 'H10', 'H11'],
  refill: ['H11', 'H10', 'H02', 'H07', 'H06'],
  gift: ['H10', 'H11', 'H02', 'H07', '06'],
  inquiry: ['H02', 'H11', 'H10', 'H07', 'H06'],
  payment: ['H02', 'H07', 'H11', 'H10', 'H06'],
  membership: ['H11', 'H10', 'H02', 'H07', 'H06']
};

export enum MEMBERSHIP_GROUP {
  V = 'VIP',
  G = 'Gold',
  S = 'Silver',
  O = '일반'
}

