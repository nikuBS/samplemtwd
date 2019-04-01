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
  m: '모바일',
  s: '인터넷/집전화/IPTV',
  o: '보안솔루션'
};

export enum LINE_NAME {
  ALL = 'a',
  MOBILE = 'm',
  INTERNET_PHONE_IPTV = 's',
  SECURITY = 'o'
}

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

export const DAY_BTN_STANDARD_SKIP_ID = [
  'DDZ25', // BTV 모바일팩
  'DDZ23', // T스포츠팩
  'DD0PB' // band 타임 프리
];

export const T0_PLAN_SKIP_ID = [
  'DD3CX',  // NA00005959	인피니티	통합공유 데이터 40GB
  'DD3CV',  // NA00005958	패밀리	통합공유 데이터 20GB
  'DD3CU',  // NA00005957	라지	통합공유 데이터 15GB
  'DD4D5'   // NA00006157	0플랜 라지	통합공유 데이터 20GB
];

export const UNLIMIT_CODE = [
  '1',  // 무제한	무제한 (SMS 항목인 경우) 기본제공/기본제공/기본제공
  'B',  // 기본제공	기본제공
  'M',  // 실사용량	무제한(SMS 항목인 경우) 기본제공/실사용량/기본제공
];

export const VOICE_UNIT = {
  HOURS: '시간',
  MIN: '분',
  SEC: '초'
};

export enum MYT_FARE_PAYMENT_TYPE {
  BANK = '01',
  CARD = '02',
  GIRO = '03',
  VIRTUAL = '04'
}

export enum MYT_FARE_PAYMENT_CODE {
  BANK = '41',
  BANK2 = '40',
  CARD = '02',
  POINT = '11'
}

export enum MYT_FARE_POINT_PAYMENT_STATUS {
  CLOSE = '납부해지',
  CLOSE2 = '해지',
  OPEN = '납부신청',
  OPEN2 = '신청',
  CHANGE = '납부변경',
  CHANGE2 = '변경',
  COMPLETE = '납부완료',
  COMPLETE2 = '완료'
}

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

export enum MYT_FARE_PAYMENT_PROCESS_DATE {
  S = '청구일자',
  R = '인출요청일자',
  D = '납부일자'
}

export enum MYT_FARE_PAYMENT_PROCESS_ATM {
  S = '청구금액',
  R = '인출요청금액',
  D = '납부금액'
}

export enum MYT_FARE_PAYMENT_NAME {
  NEW = '신청하기',
  CHANGE = '변경하기',
  IS_AUTO = '신청'
}

export enum MYT_FARE_MICRO_NAME {
  NC = '신청',
  AC = '변경',
  LC = '잠김',
  IC = '초기화'
}

export enum MYT_FARE_BILL_CO_TYPE {
  TWORLD = 'T',
  BROADBAND = 'B'
}

export enum MYT_FARE_PREPAY_NAME {
  R = '신규',
  F = '해지',
  C = '변경'
}

export enum MYT_FARE_PREPAY_AUTO_CHARGE_CODE {
  USE = 'U',
  UNUSE = 'D'
}

export enum MYT_FARE_HISTORY_MICRO_TYPE_NAME {
  '01' = '일반결제',
  '02' = '묶음결제',
  '03' = '자동결제'
}

export enum HOME_SMART_CARD {
  // H01 = '자녀 사용량 조회',
  '00001' = '요금 안내서',
  // H03 = '미납요금',
  // H04 = '이용정지',
  // H05 = 'T멤버십 혜택',
  '00005' = '콘텐츠 이용내역',
  '00004' = '소액결제 내역',
  // H08 = '컬러링 설정',
  // H09 = '단말 분할 상환 정보',
  '00002' = '선물하기',
  '00003' = '충전하기'
  // H12 = '자동 업무처리',
  // H13 = '다이렉트샵',
  // H14 = 'T로밍',
  // H15 = '요금제 변경',
  // H16 = '부가 서비스 신청/변경'
}

export enum HOME_SMART_CARD_E {
  // CHILD = 'H01',
  BILL = '00001',
  // NON_PAYMENT = 'H03',
  // SUSPENSION = 'H04',
  // MEMBERSHIP = 'H05',
  CONTENT = '00005',
  MICRO_PAY = '00004',
  // COLORING = 'H08',
  // DEVICE = 'H09',
  GIFT = '00002',
  RECHARGE = '00003'
  // AUTO = 'H12',
  // DIRECT = 'H13',
  // ROAMING = 'H14',
  // PRODUCT = 'H15',
  // ADDITIONAL = 'H16'
}

export enum MEMBERSHIP_GROUP {
  V = 'vip',
  G = 'gold',
  S = 'silver',
  O = 'default'
}

export enum T_NOTIFY_TYPE {
  GIFT = 'GIFT',
  PROD = 'PROD',
  ADD = 'ADD',
  OPTION = 'OPTION'
}

export enum PROD_CODE_E {
  DEFAULT = '1',
  OPTION = '2',
  ADD = '3'
}

export enum PROD_SCRB_CODE {
  A = '가입',
  I = '해지'
}

export enum PROD_SCRB_E {
  REGISTER = 'A',
  TERMINATE = 'I'
}

export enum PROD_TTAB_BASIC_DATA_PLUS {
  NA00005069 = '600MB',
  NA00005058 = '600MB',
  NA00005070 = '1GB',
  NA00005060 = '1GB',
  NA00005071 = '2GB',
  NA00005059 = '2GB'
}

export const MYT_FARE_HISTORY_MICRO_TYPE = {
  '01': '일반결제',
  '02': '묶음결제',
  '03': '자동결제',
  '04': '간편결제',
  '05': '복합결제'
};

export const MYT_FARE_HISTORY_MICRO_PAY_TYPE = {
  'Y': '무선',
  'N': 'Web'
};

export const MYT_FARE_HISTORY_MICRO_BLOCK_TYPE = {
  A0: '차단중',
  A1: '다음 달 차단예정',
  C0: '', // 해제상태
  C1: '다음 달 해제예정',
  N: '' // 신청내역 없음
};

export const MYT_PAYMENT_HISTORY_REFUND_TYPE = {
  ING: '처리중',
  COMPLETE: '송금완료',
  ERROR: '송금오류'
};

export const MYT_PAYMENT_HISTORY_AUTO_UNITED_TYPE = {
  S: '청구금액',
  R: '인출요청금액',
  D: '인출금액'
};

export const MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE = {
  '02': '신용카드',
  '10': 'OK캐쉬백 포인트',
  '11': 'T포인트',
  '40': '페이톡 계좌이체',
  '41': '계좌이체',
  Y: '납부 완료',
  N: '납부 취소',
  A: '납부 완료'
};

export const MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE_TO_STRING = {
  '02': 'CARD',
  '10': 'POINT',
  '11': 'POINT',
  '41': 'BANK'
};

export const MYT_PAYMENT_HISTORY_AUTO_TYPE = {
  '0': '당월',
  '1': '미납',
  '9': '당월+미납'
};

export const COMBINATION_PRODUCT = {
  NA00005055: 'data-share',
  TW20000012: 'data-share', // 가족나눔데이터
  TW20000009: 'data-share',
  NA00004211: 'data-share', // T가족결합(착한가족)
  NH00000084: 'tb-free',
  TW20000008: 'tb-free', // TB끼리 온가족프리
  NH00000059: 'tb-family',
  TW20000007: 'tb-family', // TB끼리 온가족무료
  NH00000037: 'tb-wire', // T+B인터넷(개인형)
  NH00000039: 'tb-wire', // T+B인터넷(패밀리형)
  TW00000062: 'tb-wire', // T+B인터넷
  NH00000040: 'tb-wire', // T+B전화/인터넷전화(개인형)
  NH00000041: 'tb-wire', // T+B전화/인터넷전화(패밀리형)
  TW00000063: 'tb-wire', // T+B전화/인터넷전화
  NA00002040: 't-family',
  TW20000010: 't-family', // T끼리 온가족할인
  NA00004728: 'happy-plan',
  TW20000011: 'happy-plan', // 온가족행복플랜
  NH00000114: 'family-plan',
  TW20000013: 'family-plan', // 온가족플랜
  NH00000133: 'family-plan' // NEW 온가족플랜
};

export enum CUSTOMER_NOTICE_CTG_CD {
  A01 = '안내',
  A02 = '개인정보보호',
  A04 = '이벤트',
  A05 = '시스템'
}

export enum RAINBOW_POINT_REL_CD {
  C = 'C',
  P = 'P'
}

export enum RAINBOW_FARE {
  CCBBAE0 = '국내 음성 통화료',
  CCBCOE0 = '부가서비스(컬러링)',
  CCRMRBE = '로밍사용요금',
  CCPCRBE = '부가서비스(퍼펙트콜)',
  CCPLRBE = '부가서비스(퍼펙트콜 라이트)',
  CCRPDDC = '국내 데이터 통화료',
  CCRPGDC = '기본료 및 월정액'
}

export enum RAINBOW_FARE_CODE {
  U13 = 'CCBBAE0',
  U15 = 'CCBCOE0',
  U46 = 'CCRMRBE',
  U47 = 'CCPCRBE',
  U48 = 'CCPLRBE',
  U51 = 'CCRPDDC',
  U18 = 'CCRPGDC'
}

export enum RAINBOW_FARE_NAME {
  U13 = '국내 음성 통화료',
  U15 = '부가서비스(컬러링)',
  U46 = '로밍사용요금',
  U47 = '부가서비스(퍼펙트콜)',
  U48 = '부가서비스(퍼펙트콜 라이트)',
  U51 = '국내 데이터 통화료',
  U18 = '기본료 및 월정액'
}

export enum PROMOTION_TYPE {
  N = '일반형',
  E = '응모형'
}

export enum RECHARGE_DATA_CODE {
  '005G12S' = '5GB (33,000원)',
  '002G12S' = '2GB (19,000원)',
  '001G12S' = '1GB (15,000원)',
  '500M12S' = '500MB (10,000원)',
  '100M12S' = '100MB (2,000원)',
  '004G090' = '4GB / 90일 (33,000원)',
  '002G090' = '2GB / 90일 (27,500원)',
  '002G030' = '2GB / 30일 (24,200원)',
  '001G090' = '1GB / 90일 (22,000원)',
  '001G030' = '1GB / 30일 (18,700원)',
  '300M030' = '300MB / 30일 (8,800원)'
}

export enum NICE_TYPE {
  NICE = 'nice',
  IPIN = 'ipin'
}

export enum AUTH_CERTIFICATION_KIND {
  P = 'P', // 업무 인증
  A = 'A', // 마스킹
  O = 'O', // 업무 & 마스킹
  R = 'R', // 상품
  F = 'F' // 미환급금
}

export const PREPAID_PAYMENT_TYPE = {
  '01': '현금',
  '02': '신용카드',
  '03': '카드상품권',
  '08': '통화상품권',
  '10': 'OCB포인트',
  '11': 'T-POINT',
  '41': '은행이체',
  '51': '후납',
  '99': '선불카드(PPS카드)'
};

export const PREPAID_PAYMENT_PAY_CD = {
  '1': '수납',
  '5': '당일취소',
  '9': '당일취소'
};

export const PRODUCT_TYP_CD_LIST = {
  AB: 'product/mobileplan/list',
  C: 'product/mobileplan-add/list',
  D_I: 'product/wireplan/internet',
  D_P: 'product/wireplan/phone',
  D_T: 'product/wireplan/tv',
  E_I: 'product/wireplan/internet',
  E_P: 'product/wireplan/phone',
  E_T: 'product/wireplan/tv',
  H_P: 'product/roaming/fee',
  H_A: 'product/roaming/planadd',
  G: 'benefit/submain',
  H: 'benefit/submain',
  F: 'benefit/submain'
};

export const PRODUCT_CALLPLAN = {
  CIA_INSPT_RSLT: '비정상',
  SEE_CONTENTS: '상세참조',
  JOIN_TERMINATE_CHANNEL: '가입해지채널'
};

export const PRODUCT_CALLPLAN_BENEFIT_REDIRECT = {
  TW20000014: 'http://www.skt0.co.kr/mobile/comm/1924MainView',
  TW20000018: 'http://www.thonorsclub.com/',
  TW20000019: 'BPCP:0000105150'
};

export const PRODUCT_REPLACED_RULE = {
  CHAR: [{
    TARGET: ['999999999', '999,999,999', '무제한', '기본제공'],
    RESULT: '기본제공'
  }],
  VCALL: [{
    TARGET: ['999999999', '999,999,999', '무제한'],
    RESULT: '무제한'
  }, {
    TARGET: ['999999995', '999,999,995'],
    RESULT: 'SKT 지정회선 무제한'
  }, {
    TARGET: ['999999996', '999,999,996'],
    RESULT: 'SKT 고객간 무제한'
  }, {
    TARGET: ['999999997', '999,999,997'],
    RESULT: '이동전화 무제한'
  }, {
    TARGET: ['999999998', '999,999,998'],
    RESULT: '집·이동전화 무제한'
  }]
};

export enum SVC_STATE {
  AC = 'AC',      // 사용중
  FB = 'FB',      // 직권해지
  PB = 'PB',      // 직권해지신청
  SP = 'SP',      // 정지
  TG = 'TG',      // 일반해지
  X1 = 'X1'       // CIS PB 상태자료 이전
}


export enum AUTH_CERTIFICATION_METHOD {
  SK_SMS = 'S',
  SK_SMS_RE = 'R',
  OTHER_SMS = 'T',
  SAVE = 'A',
  PUBLIC_AUTH = 'P',
  IPIN = 'I',
  BIO = 'O',
  FINANCE_AUTH = 'B',
  SMS_KEYIN = 'K',
  PASSWORD = 'W',
  SMS_SECURITY = 'Y',
  SMS_REFUND = 'SF',
  IPIN_REFUND = 'IF',
  OTHER_REFUND = 'TF'
}

export const TPLAN_SHARE_LIST = ['POT10', 'POT20'];
export const TPLAN_SHARE_ID = ['NA00005959', 'NA00005958', 'NA00006404', 'NA00006405'];
export const TPLAN_PROD_ID = ['NA00005959', 'NA00005958', 'NA00005957', 'NA00005956', 'NA00005955', 'NA00006157', 'NA00006156',
  'NA00006155', 'NA00005627', 'NA00005628', 'NA00005629', 'NA00004891', 'NA00004769', 'NA00004770', 'NA00004771', 'NA00004772', 'NA00004773',
  'NA00004792', 'NA00004793', 'NA00004794', 'NA00004796', 'NA00004808', 'NA00004809', 'NA00004810', 'NA00004811', 'NA00004812', 'NA00004813',
  'NA00005012', 'NA00005013', 'NA00005014', 'NA00005016', 'NA00005017', 'NA00005134', 'NA00005292', 'NA00005293', 'NA00004825', 'NA00004826',
  'NA00004827', 'NA00004828', 'NA00004829', 'NA00004830', 'NA00004775', 'NA00004790', 'NA00004791',  'NA00006404', 'NA00006405'];

export enum LOGIN_TYPE {
  NONE = 'N',
  TID = 'T',
  EASY = 'S'
}

export enum SHORTCUT_LOGIN_TYPE {
  M = 'T',
  S = 'S',
  U = 'N'
}

export const MEMBERSHIP_TYPE = {
  '0': 'Leaders Club',
  '1': 'ting junior',
  '2': 'Leaders Club',
  '3': 'T`PLE',
  '4': 'COUPLE',
  '5': 'SK Family',
  '6': 'Leaders Club',
  '7': 'Leaders Club',
  '8': 'TTL',
  '9': 'Ting'
};

export const REFILL_USAGE_DATA_CODES = ['AAA10', 'AAA30'];

export enum BENEFIT_SUBMAIN_CATEGORY {
  F01421 = 'discount',
  F01422 = 'combinations',
  F01423 = 'long-term',
  F01424 = 'participation'
}

export enum PREPAID_AMT_CD {
  '01' = '15일',
  '02' = '26일',
  '03' = '1,000원',
  '04' = '2,000원',
  '05' = '3,000원',
  '06' = '5,000원'
}

export const PREPAID_ALARM_TYPE = {
  '1': '발신기간',
  '2': '수신기간',
  '3': '번호유지기간'
};

export const PREPAID_ALARM_AMT = {
  '1': '1,000원',
  '2': '2,000원',
  '3': '3,000원',
  '5': '5,000원'
};

export const HOME_SEGMENT = {};
export const HOME_SEGMENT_ORDER = {};
