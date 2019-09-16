
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
  VOICE_3 = '210',
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
  SKPAY = 'SK pay 납부',
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
  '22' : 'SK PAY 카드',
  '23' : 'SK PAY 카드 + OCB',
  '30' : 'SK PAY OCB',
  '31' : 'SK PAY 계좌이체',
  '32' : 'SK PAY 계좌이체 + OCB',
  Y: '납부 완료',
  N: '납부 취소',
  A: '납부 완료'
};

export const MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE_TO_STRING = {
  '02': 'CARD',
  '10': 'POINT',
  '11': 'POINT',
  '41': 'BANK',
  '22' : 'SKPAY',
  '23' : 'SKPAY',
  '30' : 'SKPAY',
  '31' : 'SKPAY',
  '32' : 'SKPAY'
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
  SEE_CONTENTS: '상세참조'
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
export const TPLAN_SHARE_ID = ['NA00005959', 'NA00005958', 'NA00006404', 'NA00006405',
  'NA00006539', // T플랜 맥스
  'NA00006538'  // T플랜 스페셜
];
export const TPLAN_PROD_ID = ['NA00005959', 'NA00005958', 'NA00005957', 'NA00005956', 'NA00005955', 'NA00006157', 'NA00006156',
  'NA00006155', 'NA00005627', 'NA00005628', 'NA00005629', 'NA00004891', 'NA00004769', 'NA00004770', 'NA00004771', 'NA00004772', 'NA00004773',
  'NA00004792', 'NA00004793', 'NA00004794', 'NA00004796', 'NA00004808', 'NA00004809', 'NA00004810', 'NA00004811', 'NA00004812', 'NA00004813',
  'NA00005012', 'NA00005013', 'NA00005014', 'NA00005016', 'NA00005017', 'NA00005134', 'NA00005292', 'NA00005293', 'NA00004825', 'NA00004826',
  'NA00004827', 'NA00004828', 'NA00004829', 'NA00004830', 'NA00004775', 'NA00004790', 'NA00004791', 'NA00006404', 'NA00006405',
  'NA00006539', // T플랜 맥스
  'NA00006538', // T플랜 스페셜
  'NA00006535', // T플랜 안심2.5G
  'NA00006536', // T플랜 안심4G
  'NA00006537', // T플랜 베이직
];

export const TOTAL_SHARE_DATA_SKIP_ID = [
  // 통합공유 데이터 표시 상품 리스트
  'DD3CX',  // NA00005959	인피니티	통합공유 데이터 40GB
  'DD3CV',  // NA00005958	패밀리	통합공유 데이터 20GB
  'DD3CU',  // NA00005957	라지	통합공유 데이터 15GB
  'DD4D5',   // NA00006157	0플랜 라지	통합공유 데이터 20GB
  // 5G 대응
  'DD3H8',   // NA00006405	5G XL(미정) 통합공유 데이터 50GB
  'DD3GV',   // NA00006404	5G L(미정) 통합공유 데이터 30GB
  'DD3GC',   // NA00006403	5G M(미정) 통합공유 데이터 15GB
  // New T플랜 요금제 대응
  'DD3IU',   // NA00006537	에센스 통합공유 데이터 15GB
  'DD3J6',   // NA00006538	스페셜 통합공유 데이터 15GB
  'DD3JI'    // NA00006539	맥스 통합공유 데이터 15GB
];

export const INFINITY_DATA_PROD_ID = [
  // 기본 데이터제공량이 무제한인 요금상품 리스트
  'NA00002500', 'NA00002501', 'NA00002502', 'NA00002708', 'NA00002997',
  'NA00002998', 'NA00003125', 'NA00003126', 'NA00003127', 'NA00003128'
];

// 집전화 정액제 상품
export const S_FLAT_RATE_PROD_ID = [
  'NP00000620', 'NP00000020', 'NP00000021', 'NP00000022', 'NP00000023', 'NP00000024',
  'NP00000794', 'NP00000795', 'NP00000863', 'NP00000870', 'NP00000681', 'NP00000189',
  'NP00000775'
];

// 실시간 채팅 상담 추가 상품
export const LIVE_CHAT_CHECK_PROD_ID = [
  'NI00000282', 'NI00000569', 'NI00000567', 'NI00000895', 'NI00000687', 'NI00000911',
  'NI00000912', 'NI00000914', 'NI00000924', 'NI00000938', 'TW11100103', 'TW11100221',
  'TW11100210', 'TW11100059'
];

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
  F01424 = 'participation',
  F01714 = 'purchase'
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

export const PRODUCT_CODE = {
  PLAN: 'F01331',
  ADDITION: 'F01332',
  WIRE_PLAN: 'F01300',
  MOBILE_PLAN: 'F01100',
  MOBILE_ADDITION: 'F01200',
};

export const PRODUCT_WIRE_PLAN_CATEGORIES = {
  INTERNET: 'F01321',
  PHONE: 'F01322',
  TV: 'F01323'
};

export const MYT_SUSPEND_REASON_CODE = {
  MILITARY: '21', // 군입대(현역)
  OVERSEAS: '22', // 해외체류
  SEMI_MILITARY: '27' // 군입대(현역외)
};

export const MYT_SUSPEND_MILITARY_RECEIVE_CD = ['5000341', '5000342', '5000349', '5000350' ];

export const EXPERIMENT_EXPS_SCRN_ID = {
  RECOMMEND_PRODS: 'MTW_M000184_01'
};

export const MLS_PRODUCT_BENEFIT = {
  // T플랜 맥스
  NA00006539: {
    data: {
      desc: 0,
      img: '/img/t_myPlan/plan_bene_ico05.png'
    },
    membership: {
      desc: 72000,
      img: ''
    },
    flo: {desc: '연 94,800원 상당의 FLO 월정액<span class=\\\"bene-desc-sub\\\">FLO 음악콘텐츠, FLO 전용 데이터 3GB</span>'},
    pooq: {desc: 118000},
    insurance: {desc: 67200},
    safe: {desc: 0},
    total: {desc: 352000}
  },
  // T플랜 스페셜
  NA00006538: {
    data: {
      desc: 0,
      img: '/img/t_myPlan/plan_bene_ico05.png'
    },
    membership: {desc: 72000},
    flo: {desc: 0},
    pooq: {desc: 118000},
    insurance: {desc: 33600},
    safe: {desc: 0},
    total: {desc: 223600}
  },
  // T플랜 에센스
  NA00006537: {
    data: {
      desc: '월 데이터 100GB 제공',
      img: '/img/t_myPlan/plan_bene_ico05.png'
    },
    membership: {desc: 0},
    flo: {desc: '연 47,400원 상당의 FLO 월정액'},
    pooq: {desc: 0},
    insurance: {desc: 0},
    safe: {desc: 0},
    total: {desc: 47400}
  },
  // T플랜 안심4G
  NA00006536: {
    data: {
      desc: '월 180,000원 상당의 심야 데이터 제공<span class=\\\"bene-desc-sub\\\">00~07시 데이터 4배</span>',
      img: '/img/t_myPlan/plan_bene_ico06.png'
    },
    membership: {desc: 0},
    flo: {desc: 0},
    pooq: {desc: 0},
    insurance: {desc: 0},
    safe: {desc: 0},
    total: {desc: 2160000}
  },
  // T플랜 안심2.5G
  NA00006535: {
    data: {
      desc: '월 112,500원 상당의 심야 데이터 제공<span class=\\\"bene-desc-sub\\\">00~07시 데이터 4배</span>',
      img: '/img/t_myPlan/plan_bene_ico06.png'
    },
    membership: {desc: 0},
    flo: {desc: 0},
    pooq: {desc: 0},
    insurance: {desc: 0},
    safe: {desc: 66600},
    total: {desc: 1416000}
  },
  // T플랜 세이브
  NA00006534: {
    data: {
      desc: '월 67,500원 상당의 심야 데이터 제공<span class=\\\"bene-desc-sub\\\">00~07시 데이터 4배</span>',
      img: '/img/t_myPlan/plan_bene_ico06.png'
    },
    membership: {desc: 0},
    flo: {desc: 0},
    pooq: {desc: 0},
    insurance: {desc: 0},
    safe: {desc: 0},
    total: {desc: 810000}
  }
};

export const MLS_DETAIL_MAPPING = {
  prcpln_01: {
    type: 'data',
    tooltip: '추천요금제는 <strong>데이터 걱정없이</strong> 편하게 이용할 수 있어요',
    profile_key: {
      bas_ofr_data_gb_qty_val : {type: 'GB', name: '고객 기본제공 데이터', required: false},
      data_use_ratio_max : {type: 'ratio', name: '데이터 최대 사용 비율', required: true},
      data_use_ratio_bf_m0 : {type: 'ratio', name: '1개월 전 데이터 사용 비율', required: true},
      data_use_ratio_bf_m1 : {type: 'ratio', name: '2개월 전 데이터 사용 비율', required: true},
      data_use_ratio_bf_m2 : {type: 'ratio', name: '3개월 전 데이터 사용 비율', required: true},
      bf_m0_ym : {type: 'YYYYMM', name: '전월의 연월', required: true}
    }
  },
  prcpln_02: {
    type: 'data',
    tooltip: '추천요금제는 <strong>심야시간에 기본 데이터를 4배 더</strong> 드려요',
    profile_key: {
      data_use_night_ratio : {type: 'ratio', name: '심야시간 데이터 사용 비율', required: true},
      data_use_night_ratio_median : {type: 'ratio', name: '심야시간 데이터 사용 비율 중간값', required: true},
      data_use_night_ratio_median_yn : {type: 'Y/N', name: '심야시간 데이터 사용 비율 중간값 이상 여부', required: true},
    }
  },
  prcpln_03: {
    type: 'data',
    tooltip: '추천요금제는 <strong>데이터 걱정없이</strong> 편하게 이용할 수 있어요.',
    profile_key: {
      additional_svc_ansim_option_scrb_type : {type: 'P/F', name: '안심옵션 가입 형태', required: false}
    }
  },
  prcpln_04: {
    type: 'video',
    tooltip: '추천요금제는 <strong>POOQ을 무료로</strong> 즐길 수 있어요',
    profile_key: {
      additional_svc_oksusu_scrb_type : {type: 'P/F', name: 'OKSUSU 가입 형태', required: false},
      additional_svc_pooq_scrb_type : {type: 'P/F', name: 'POOQ 가입 형태', required: false}
    }
  },
  prcpln_05: {
    type: 'video',
    tooltip: '추천요금제는 <strong>데이터 걱정없이 POOQ을 무료로</strong> 이용할 수 있어요',
    profile_key: {
      app_use_traffic_video_ratio : {type: 'ratio', name: '전체 데이터 대비 동영상 데이터 사용비율', required: true},
      app_use_traffic_video_ratio_median : {type: 'ratio', name: '전체 데이터 대비 동영상 데이터 사용비율 중간값', required: true},
      app_use_traffic_video_ratio_median_yn : {type: 'Y/N', name: '전체 데이터 대비 동영상 데이터 사용비율 중간값 이상 여부', required: false}
    }
  },
  prcpln_06: {
    type: 'video',
    tooltip: '추천요금제로 <strong>스포츠 생중계를 무료로</strong> 즐겨보세요',
    profile_key: {
      additional_svc_oksusu_scrb_type : {type: 'P/F', name: 'OKSUSU 가입 형태', required: false},
      additional_svc_pooq_scrb_type : {type: 'P/F', name: 'POOQ 가입 형태', required: false},
    }
  },
  prcpln_07: {
    type: 'music',
    tooltip: '추천요금제는 <strong>FLO를 무료로</strong> 즐길 수 있어요',
    profile_key: {
      additional_svc_flo_scrb_type : {type: 'ratio', name: 'FLO 가입 형태', required: false},
      additional_svc_melon_scrb_type : {type: 'ratio', name: 'Melon 가입 형태', required: false},
      additional_svc_bugs_scrb_type : {type: 'ratio', name: 'Bugs 가입 형태', required: false}
    }
  },
  prcpln_08: {
    type: 'music',
    tooltip: '추천요금제는 <strong>FLO를 데이터 걱정없이</strong> 이용할 수 있어요',
    profile_key: {
      app_use_traffic_music_ratio : {type: 'ratio', name: '전체 데이터 대비 음악 데이터 사용량 비율', required: true},
      app_use_traffic_music_ratio_median : {type: 'ratio', name: '전체 데이터 대비 음악 데이터 사용비율 중간값', required: true},
      app_use_traffic_music_ratio_median_yn : {type: 'Y/N', name: '전체 데이터 대비 음악 데이터 사용비율 중간값 이상 여부', required: false}
    }
  },
  prcpln_09: {
    type: 'music',
    tooltip: '추천요금제로 <strong>FLO 할인 받고</strong>, 새로운 음악을 찾아보세요',
    profile_key: {
      additional_svc_flo_scrb_type : {type: 'P/F', name: 'FLO 가입 형태', required: false},
      additional_svc_melon_scrb_type : {type: 'P/F', name: 'Melon 가입 형태', required: false},
      additional_svc_bugs_scrb_type : {type: 'P/F', name: 'Bugs 가입 형태', required: false}
    }
  },
  prcpln_10: {
    type: 'insurance',
    tooltip: {
      paid: '스페셜에 가입하면 휴대폰 분실/파손 보험을 반값에 이용할 수 있어요',
      free: '맥스에 가입하면 휴대폰 분실/파손 보험이 무료에요'
    },
    profile_key: {
      additional_svc_allcare_scrb_type : {
        type: 'P/F', 
        name: 'T All 케어 가입 형태', 
        required: true,
      }
    }
  },
  prcpln_12: {
    type: 'insurance',
    tooltip: {
      paid: '스페셜에 가입하면 휴대폰 분실/파손 보험을 반값에 이용할 수 있어요',
      free: '맥스에 가입하면 휴대폰 분실/파손 보험이 무료에요'
    },
    profile_key: {
      additional_svc_allcare_scrb_type : {
        type: 'P/F', 
        name: 'T All 케어 가입 형태', 
        required: true,
        paid_tooltip: '스페셜에 가입하면 휴대폰 분실/파손 보험을 반값에 이용할 수 있어요',
        free_tooltip: '맥스에 가입하면 휴대폰 분실/파손 보험이 무료에요'
      }
    }
  },
  prcpln_14: {
    type: 'membership',
    tooltip: '1년에 영화 6회 무료! T멤버십 VIP 혜택을 드리는추천요금제 어떠세요?',
    profile_key: {
      membership_vip_yn : {type: 'Y/N', name: '멤버십VIP여부', required: false},
      membership_cnt_ratio_median_yn : {type: 'Y/N', name: '멤버십 사용건수 중간값 이상 여부', required: false},
      membership_amt_ratio_median_yn : {type: 'Y/N', name: '멤버십 사용금액 중간값 이상 여부', required: false},
      mbr_use_discount_amt_cum : {type: 'amt', name: '연간 누적 멤버십 할인금액', title: '총계', required: true},
      mbr_discount_amt_cum_chocolate : {type: 'amt', name: '멤버십- T멤버십 초콜릿 카테고리 연간 누적 할인금액', title: '초콜릿', required: false},
      mbr_discount_amt_cum_bakery : {type: 'amt', name: '멤버십-베이커리 카테고리 연간 누적 할인금액', title: '베이커리', required: false},
      mbr_discount_amt_cum_sports : {type: 'amt', name: '멤버십-스포츠 카테고리 연간 누적 할인금액', title: '스포츠', required: false},
      mbr_discount_amt_cum_jeju : {type: 'amt', name: '멤버십-제주도 카테고리 연간 누적 할인금액', title: '제주도', required: false},
      mbr_discount_amt_cum_food_and_beverage : {type: 'amt', name: '멤버십- F&B카테고리 연간 누적 할인금액', title: 'F&B', required: false},
      mbr_discount_amt_cum_education : {type: 'amt', name: '멤버십-교육 카테고리 연간 누적 할인금액', title: '교육', required: false},
      mbr_discount_amt_cum_transportation : {type: 'amt', name: '멤버십-교통 카테고리 연간 누적 할인금액', title: '교통', required: false},
      mbr_discount_amt_cum_mobile_and_media : {type: 'amt', name: '멤버십-모바일&미디어 카테고리 연간 누적 할인금액', title: '모바일&미디어', required: false},
      mbr_discount_amt_cum_beauty_and_fashion : {type: 'amt', name: '멤버십-뷰티&패션 카테고리 연간 누적 할인금액', title: '뷰티&패션', required: false},
      mbr_discount_amt_cum_shopping : {type: 'amt', name: '멤버십-쇼핑 카테고리 연간 누적 할인금액', title: '쇼핑', required: false},
      mbr_discount_amt_cum_movie : {type: 'amt', name: '멤버십-영화관 카테고리 연간 누적 할인금액', title: '영화관', required: false},
      mbr_discount_amt_cum_coffee : {type: 'amt', name: '멤버십-커피 카테고리 연간 누적 할인금액', title: '커피', required: false},
      mbr_discount_amt_cum_family_restaurant : {type: 'amt', name: '멤버십-패밀리레스토랑 카테고리 연간 누적 할인금액', title: '패밀리레스토랑', required: false},
      mbr_discount_amt_cum_pizza : {type: 'amt', name: '멤버십-피자 카테고리 연간 누적 할인금액', title: '피자', required: false},
      mbr_discount_amt_cum_convenience_store : {type: 'amt', name: '멤버십-편의점 카테고리 연간 누적 할인금액', title: '편의점', required: false},
      mbr_discount_amt_cum_theme_park : {type: 'amt', name: '멤버십-테마파크 카테고리 연간 누적 할인금액', title: '테마파크', required: false}
    }
  }
};

// Exceptional MLS Return Values
export const MLS_EMPTY_CASE = [null, 'N/A'];

export const MLS_PRCPLN_RC_TYP = 'GNRL';

export const MLS_ERROR = {
  MLS0001: {code: 'MLS0001', msg: '나에게 꼭 맞는 추천 요금제가 없습니다.'}
};
