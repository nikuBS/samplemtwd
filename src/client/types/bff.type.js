Tw.MYT_FARE_AUTO = {
  Y: '신청',
  N: '미신청'
};

Tw.TING_TITLE = {
  HA: '통화 가능 금액',
  CH: '충전 금액',
  PR: '선물충전 금액'
};

Tw.MYT_FARE_SUB_MAIN = {
  NO_BILL_REQUEST_EXIST: 'ZINVN8888'
};

Tw.PAYMENT_POINT_VALUE = {
  OK_CASHBAG: '10',
  T_POINT: '11'
};

Tw.LINE_NAME = {
  ALL: 'a',
  MOBILE: 'm',
  INTERNET_PHONE_IPTV: 's',
  SECURITY: 'o'
};

Tw.HOME_SMART_CARD_E = {
  // CHILD: 'H01',
  BILL: '00001',
  // NON_PAYMENT: 'H03',
  // SUSPENSION: 'H04',
  // MEMBERSHIP: 'H05',
  CONTENT: '00005',
  MICRO_PAY: '00004',
  // COLORING: 'H08',
  // DEVICE: 'H09',
  GIFT: '00002',
  RECHARGE: '00003'
  // AUTO: 'H12',
  // DIRECT: 'H13',
  // ROAMING: 'H14',
  // PRODUCT: 'H15',
  // ADDITIONAL: 'H16'
};

Tw.SVC_STATE = {
  AC: 'AC',      // 사용중
  FB: 'FB',      // 직권해지
  PB: 'PB',      // 직권해지신청
  SP: 'SP',      // 정지
  TG: 'TG',      // 일반해지
  X1: 'X1'       // CIS PB 상태자료 이전
};

Tw.MYT_FARE_BILL_CO_TYPE = {
  TWORLD: 'T',
  BROADBAND: 'B'
};

Tw.MYT_FARE_HISTORY_MICRO_METHOD = {
  '01': '일반결제',
  '02': '묶음결제',
  '03': '자동결제'
};

Tw.MYT_PAYMENT_HISTORY_TYPE = ['', 'direct', 'auto', 'auto-all', 'micro-prepay', 'content-prepay', 'point-reserve', 'point-auto'];

Tw.AUTH_LOGIN_TYPE = {
  NONE: 'N',
  TID: 'T',
  EASY: 'S'
};

Tw.AUTH_CERTIFICATION_METHOD = {
  SK_SMS: 'S',
  SK_SMS_RE: 'R',
  OTHER_SMS: 'T',
  SAVE: 'A',
  PUBLIC_AUTH: 'P',
  IPIN: 'I',
  BIO: 'O',
  FINANCE_AUTH: 'B',
  SMS_KEYIN: 'K',
  PASSWORD: 'W',
  SMS_SECURITY: 'Y',
  SMS_REFUND: 'SF',
  IPIN_REFUND: 'IF',
  OTHER_REFUND: 'TF'
};

Tw.AUTH_CERTIFICATION_NICE = {
  KT: 'K',
  LG: 'L',
  SAVE: 'M'
};

Tw.AUTH_CERTIFICATION_KIND = {
  P: 'P', // 업무 인증
  A: 'A', // 마스킹
  O: 'O', // 업무 & 마스킹
  R: 'R', // 상품
  F: 'F'  // 미환급금
};

Tw.NICE_TYPE = {
  NICE: 'nice',
  IPIN: 'ipin'
};

Tw.PRODUCT_RESERVATION_VALUE = {
  cellphone: '19',
  internet: '07',
  phone: '08',
  tv: '09',
  combine: '10'
};

Tw.EMAIL_CERT_CODE = {
  ID: 'ID',
  PWD: 'PWD',
  UPCERT: 'UPCERT',
  UPCERTMULTI: 'UPCERTMULTI',
  SLEEP_USER: 'SLEEP_USER',
  SLEEP_IUSER_ENG: 'SLEEP_USER_ENG',
  PWD_CHG: 'PWD_CHG',
  PWD_CHG_ENG: 'PWD_CHG_ENG',
  SECOND_AUTH: 'SECOND_AUTH'
};

Tw.PAYMENT_REQUEST_TYPE = {
  R: '신규',
  C: '변경',
  F: '해지'
};

Tw.CUSTOMER_NOTICE_CTG_CD = {
  A01: '안내',
  A02: '개인정보보호',
  A04: '이벤트',
  A05: '시스템'
};

Tw.SVC_CATEGORY = {
  m: '모바일',
  s: '인터넷/집전화/IPTV',
  o: '보안솔루션'
};

Tw.SVC_ATTR = {
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

Tw.SVC_ATTR_E = {
  MOBILE_PHONE: 'M1',
  PPS: 'M2',
  T_POCKET_FI: 'M3',
  T_LOGIN: 'M4',
  T_WIBRO: 'M5',
  INTERNET: 'S1',
  IPTV: 'S2',
  TELEPHONE: 'S3',
  POINT_CAM: 'O1'
};

Tw.POINT_NM = {
  OK: 'OK캐쉬백',
  T: 'T포인트',
  RAINBOW: '레인보우 포인트'
};

Tw.UNIT = {
  '110': '원',
  '140': 'KB',
  '240': '초',
  '910': '초',
  '310': '건',
  '320': '건'
};

Tw.UNIT_E = {
  FEE: '110',
  DATA: '140',
  VOICE: '240',
  VOICE_2: '910',
  SMS: '310',
  SMS_2: '320'
};

Tw.PREPAID_RECHARGE_TYPE = {
  '1': '1회충전',
  '2': '자동충전',
  '4': '잔액승계'
};

Tw.PREPAID_PAYMENT_TYPE = {
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

Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TYPE = {
  A0: '차단중',
  A1: '다음 달 차단예정',
  C0: '', // 해제상태
  C1: '다음 달 해제예정',
  N: '' // 신청내역 없음
};

Tw.LOGIN_NOTICE_TYPE = {
  NEW_CUSTOMER: '01',
  EXIST_CUSTOMER: '02',
  NEW_LINE: '03',
  // BIZ_DELETE: '04',
  CUSTOMER_PASSWORD: '05'
};

Tw.MYT_DATA_ERROR_CODE = {
  // BLN0001: 잔여기본통화 조회횟수 초과
  // BLN0002: 조회불가대상
  // BLN0003: 정지이력
  // BLN0004: 조회가능항목없음
  // BLN0005: 자녀회선아님
  // BLN0006: 조회실
  // BLN0007: 조회가능항목없음
  DEFAULT: '조회불가'
};

Tw.UNLIMIT_CODE = [
  '1',  // 무제한	무제한 (SMS 항목인 경우) 기본제공/기본제공/기본제공
  'B',  // 기본제공	기본제공
  'M'  // 실사용량	무제한(SMS 항목인 경우) 기본제공/실사용량/기본제공
];

Tw.IGNORE_JOINTERM = ['NA00004430', 'NA00004778', 'NA00005381', 'NA00002246', 'NA00002079', 'NA00002080', 'NA00002081', 'NA00002082', 'NA00005872'];

Tw.PRODUCT_REPLACED_RULE = {
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

Tw.CUSTOMER_RESEARCH_NEXT_TYPE = {
  END: 99,
  NEXT: 0
};

Tw.MYT_DATA_FAMILYDATA_CHANGE_DATA_CODE = {
  RCG0066: 'NOT_COMPLETE',  // 공유 완료되지 않음
  RCG0067: 'NOT_THIS_MONTH',  // 이번 달 공유 내역 아님
  RCG0068: 'NOT_MINE',  // 내 공유 내역 아님
  RCG0069: 'NOT_SAME_PLAN' , // 공유 당시와 동일한 요금제가 아님
  RCG0070: 'GREATER_THAN_CHANGABLE' // 변경하려는 데이터 양이 공유 데이터 양보다 큼 
}