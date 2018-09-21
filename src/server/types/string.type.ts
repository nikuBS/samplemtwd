export enum DATA_UNIT {
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
  TB = 'TB',
  PB = 'PB'
}

export enum SKIP_NAME {
  UNLIMIT = '무제한',
  DEFAULT = '기본제공량',
  EXCEED = 'LT', // 초과
  DAILY = 'PA' // 일별사용량
}
// 요금 안내서 설정 > 안내서 유형(복합은 컨트롤러에서 만들고 단수만 표현한다)
export const MYT_FARE_BILL_TYPE = {
  'P': 'T world 확인',
  'H': 'Bill Letter', // 무선 case
  'J': 'Bill Letter', // 유선 case
  'B': '문자',
  '2': '이메일',
  '1': '기타(우편)',
  'X': '선택안함'
};

export enum UNIT {
  WON = '원',
  GB = 'GB',
  MB = 'MB'
}

export const MYT_FARE_BILL_GUIDE = {
  DATE_FORMAT: {
    YYYYMM_TYPE: 'YYYY년 MM월'
  },
  FIRST_SVCTYPE: '서비스 전체',
  PHONE_SVCTYPE: '휴대폰'
};

export enum MYT_FARE_PAYMENT_NAME {
  BANK = '은행'
}

export const MYT_FEEPLAN_BENEFIT = {
  PEN_Y: '위약금 대상',
  PEN_N: '위약금 비대상',
  ENDLESS: '서비스 해지시 종료'
};

export const MYT_T_DATA_GIFT_TYPE = {
  G1: '일반',
  GC: '자동',
  GD: '1+1'
};

export enum CURRENCY_UNIT {
  WON = '원',
  TEN_THOUSAND = '만원'
}

export enum PRODUCT_DETAIL_SUMMARY_TYPE {
  PLM_0 = '상세참조',
  PLM_1 = '기본제공금액 조절사용',
  PLM_2 = '없음',
  PLM_3 = '기본제공',
  PLM_4 = '무제한',
  PLM_5 = 'SKT 지정회선 무제한',
  PLM_6 = 'SKT 고객간 무제한',
  PLM_7 = '이동전화 무제한',
  PLM_8 = '집전화·이동전화 무제한',
  PLM_9 = '무료'
}

export enum MYT_DATA_CHARGE_TYPES {
  GIFT = '선물',
  CHARGE = '충전'
}

export enum MYT_DATA_CHARGE_TYPE_NAMES {
  DATA_GIFT = 'T끼리 데이터 선물',
  LIMIT_CHARGE = '데이터 한도 요금',
  TING_CHARGE = '팅 쿠키즈 안심요금',
  TING_GIFT = '팅 요금 선물',
  REFILL_USAGE = '리필 쿠폰 사용',
  REFILL_GIFT = '리필 쿠폰 선물',
}
