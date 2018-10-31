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
  P: 'T world 확인',
  H: 'Bill Letter', // 무선 case
  J: 'Bill Letter', // 유선 case
  B: '문자',
  '2': '이메일',
  '1': '기타(우편)',
  X: '선택안함'
};

export enum UNIT {
  WON = '원',
  GB = 'GB',
  MB = 'MB',
  SMS = '건'
}

export const MYT_DATA_USAGE = {
  T_O_PLAN_BASE_DATA: {
    DD3EA: '인피니티',
    DD3DZ: '패밀리',
    DD3DO: '라지',
    DD3DG: '미디엄',
    DD3D8: '스몰',
    DD4D1: '라지'
  },
  T_O_PLAN_SHARE_DATA: {
    DD3CX: '인피니티',
    DD3CV: '패밀리',
    DD3CU: '라지',
    DD4D5: '라지'
  }
};

export const MYT_DATA_USAGE_TOTAL_SHARING_DATA = {
  TITLE: '통합공유 데이터'
};

export const MYT_FARE_BILL_GUIDE = {
  DATE_FORMAT: {
    YYYYMM_TYPE: 'YYYY년 MM월'
  },
  FIRST_SVCTYPE: '서비스 전체',
  PHONE_SVCTYPE: '휴대폰',
  PHONE_TYPE_0: '이동전화',
  PHONE_TYPE_1: '휴대폰'
};

export enum MYT_FARE_PAYMENT_NAME {
  BANK = '은행',
  BANK2 = '뱅크',
  BANK3 = 'bank',
  CARD = '카드',
  CARD2 = 'card'
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

export enum TIME_UNIT {
  TIME = '시간',
  MINUTE = '분',
  SECOND = '초'
}

export enum MYT_DATA_CHARGE_TYPE_NAMES {
  DATA_GIFT = 'T끼리 데이터 선물',
  LIMIT_CHARGE = '데이터 한도 요금',
  TING_CHARGE = '팅 쿠키즈 안심요금',
  TING_GIFT = '팅 요금 선물',
  REFILL_USAGE = '리필 쿠폰 사용',
  REFILL_GIFT = '리필 쿠폰 선물',
  ALL = '전체'
}

export enum MYT_DATA_CHARGE_TYPES {
  GIFT = '선물',
  CHARGE = '충전',
  FIXED = '자동',
  CANCLE = '취소'
}

export enum PRODUCT_INFINITY_BENEFIT {
  NA00006114 = 'T 로밍 Onepass 월 1회/ 1개월 + 마티나 라운지 이용권 1회/ 3개월',
  NA00006115 = '무료영화예매 2회 / 1개월',
  NA00006116 = '스마트 워치 월정액 100% 할인',
  NA00006117 = '인피니티 클럽 이용료 100%할인'
}

export enum PRODUCT_INFINITY_BENEFIT_NM {
  NA00006114 = '인피니티_여행',
  NA00006115 = '인피니티_영화',
  NA00006116 = '인피니티_스마트워치',
  NA00006117 = '인피니티_클럽'
}

export enum PRODUCT_INFINITY_BENEFIT_PROD_NM {
  NA00006116 = '지원요금제명',
  NA00006117 = '대상'
}

export enum PRODUCT_RESERVATION_TYPE_NM {
  cellphone = '휴대폰',
  internet = '인터넷',
  phone = '전화',
  tv = 'TV',
  combine = '결합상품'
}

export enum PRODUCT_RESERVATION_COMBINE_NM {
  NH00000103 = 'TB끼리 한가족할인',
  NA00002040 = '온가족할인',
  NH00000133 = 'New온가족플랜',
  NH00000084 = 'TB끼리 온가족프리',
  NONE = '결합상품을 선택해 주세요',
  ETC = '그 외 결합상품'
}

export const MYT_FARE_BILL_REISSUE_TYPE = {
  P: 'T world',
  H: 'Bill Letter',
  B: '문자',
  '2': '이메일',
  I: 'Bill Letter+이메일',
  A: '문자+이메일',
  '1': '우편',
  Q: 'Bill Letter+문자',
  // 유선
  J: 'Bill Letter',
  K: 'Bill Letter+이메일'
};

export const MYT_INFO_DISCOUNT_MONTH = {
  TITLE: '월별 상세 할인 내역'
};

export enum PRODUCT_TYPE {
  FEE_INFO_ETC = '상세참조'
}

export enum PRODUCT_CTG_NAME {
  F01100 = '요금제',
  F01200 = '부가서비스',
  F01300 = '인터넷/전화/IPTV',
  F01400 = '혜택ㆍ할인',
  F01500 = 'T로밍 요금제',
  F01600 = 'T로밍 부가서비스',
  F01700 = 'T apps'
}

export const MYT_FARE_PAYMENT_HISTORY_TYPE = {
  all: '전체',
  direct: '즉시 납부',
  auto: '자동 납부',
  autoAll: '자동 납부 통합 인출',
  microPrepay: '소액결제 선결제',
  contentPrepay: '콘텐츠 이용료 선결제',
  PAY_KOR_TITLE: '납부',
  CANCEL_KOR_TITLE: '취소',
  AUTO_KOR_TITLE: '자동'
};

export const MYT_STRING_KOR_TERM = {
  year: '년',
  month: '월',
  day: '일'
};

export const MYT_FARE_HISTORY_MICRO_TYPE = {
  NORMAL: '일반결제',
  PACK: '묶음결제',
  AUTO: '자동결제'
};

export const MYT_JOIN_CONTRACT_TERMINAL = {
  FEE_TYPE_A: {
    TIT_NM: '요금약정할인24 (730일)'
  },
  FEE_TYPE_B: {
    TIT_NM: '테블릿 약정할인 12'
  },
  FEE_TYPE_C: {
    TIT_NM: '테블릿 약정'
  },
  FEE_TYPE_D: {
    TIT_NM: 'wibro 약정'
  },
  FEE_TYPE_E: {
    TIT_NM: '선택 약정 할인 제도'
  },
  FEE_NOTYPE: {
    TIT_NM: '정보 없음'
  },
  JOIN_TYPE_A: {
    TITNM: '가입 / T 기본약정',
    AGREE_NM: 'T 기본약정'
  },
  JOIN_TYPE_B: {
    TITNM: '가입 / T 지원금약정',
    AGREE_NM: 'T 지원금약정'
  },
  JOIN_TYPE_C: {
    TITNM: '가입 / T 약정 할부지원',
    AGREE_NM: 'T 약정 할부지원'
  },
  JOIN_TYPE_D: {
    TITNM: '가입 / 약정 위약금2',
    AGREE_NM: '약정 위약금2'
  },
  JOIN_NOTYPE: {
    TITNM: '가입 / 정보없음',
    AGREE_NM: '정보없음'
  },
  SUC_TYPE_A: {
    TITNM: '승계 / ',
    AGREE_NM: ''
  },
  SUC_TYPE_B: {
    TITNM: '승계 / ',
    AGREE_NM: ''
  },
  SUC_TYPE_C: {
    TITNM: '승계 / ',
    AGREE_NM: ''
  },
  SUC_TYPE_D: {
    TITNM: '승계 / ',
    AGREE_NM: ''
  },
  SUC_NOTYPE: {
    TITNM: '승계 / 정보없음',
    AGREE_NM: '정보없음'
  }
};

export const MYT_PAYMENT_DETAIL_TITLE = {
  DI: '납부 상세 내역',
  TPOINT: 'T포인트 납부 상세 내역',
  OCB: 'OK캐쉬백 납부 상세 내역',
  BANK: '계좌이체 납부 상세 내역',
  CARD: '신용카드 납부 상세 내역',
  AT: '자동납부 상세 내역',
  AU: '자동납부 상세 내역',
  MP: '소액 결제 선결제 상세 내역',
  CP: '콘텐츠 이용료 선결제 상세 내역'

};

export const MYT_FARE_PAYMENT_ERROR = {
  DEFAULT: '청구된 요금이 없습니다.',
  REP_SVC_N: '대표청구번호가 아닙니다.',
  COM_CODE_B: '사업자가 브로드밴드 입니다.'
};

export const MYT_JOIN_WIRE_SVCATTRCD = {
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

export const MYT_JOIN_WIRE_GUIDE_CHANGE_OWNERSHIP = {
  TITLE: '명의 변경 신청 방법 안내',
};

export const MYT_JOIN_WIRE_MODIFY_PERIOD = {
  TITLE: '약정 기간 변경',
};

export const MYT_JOIN_WIRE_SET_PAUSE = {
  TITLE: '일시 정지/해제',
  MONTH: '개월 ',
  DAY: '일',
};

export enum CUSTOMER_NOTICE_CATEGORY {
  TWORLD = 'T world',
  DIRECTSHOP = '다이렉트샵',
  MEMBERSHIP = '멤버십',
  ROAMING = '로밍'
}

export enum CUSTOMER_PROTECT_GUIDE {
  VIDEO = '동영상으로 보는 피해예방법',
  WEBTOON = '웹툰으로 보는 피해예방법',
  LATEST = '최신 이용자 피해예방 정보'
}

export const MY_BENEFIT_RAINBOW_POINT = {
  TITLE: {
    MAIN: '레인보우 포인트'
  },
  OLCLCD: {
    E: '적립',
    U: '사용',
    X: '소멸'
  }
};

export const MY_BENEFIT_RAINBOW_POINT_ADJUSTMENT = {
  TITLE: '포인트 합산',
  ERROR: '레인보우 포인트가 복수회선인 경우만 포인트 조정이 가능합니다.'
};

export const MY_BENEFIT_RAINBOW_POINT_TRANSFER = {
  TITLE: '포인트 양도',
  ERROR: '법정대리인 정보가 존재하지 않습니다.',
  REL_NM: {
    C: '청소년',
    P: '법정대리인'
  }
};
