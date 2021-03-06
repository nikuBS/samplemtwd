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

export const UNLIMIT_NAME = {
  '1': '무제한',
  B: '기본제공',
  M: '무제한',
  REMAIN: '남음',
  WIDGET_UNLIMIT: '무제한', // 위젯 내 '무제한' 표기
  WIDGET_UNLIMIT_DEFAULT: '기본제공' // 위젯 내 '기본제공' 표기 (무제한 표기 방식의 일종)
};

// 요금 안내서 설정 > 안내서 유형(복합은 컨트롤러에서 만들고 단수만 표현한다)
export const MYT_FARE_BILL_TYPE = {
  P: 'T world 확인',
  H: 'Bill Letter', // 무선 case
  J: 'Bill Letter', // 유선 case
  B: '문자',
  '2': '이메일',
  '1': '기타(우편)',
  '4': '기타(우편)',
  '5': '기타(우편)',
  '8': '기타(우편)',
  'C': '기타(우편)',
  D: '모바일퀵',
  E: '모바일퀵+이메일',
  ADD: '기타(우편) (전자추가발송)',
  X: '선택 안 함'
};

export enum UNIT {
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
  },
  DATA_TYPE: {
    DATA: 'data',
    VOICE: 'voice',
    SMS: 'sms',
    ETC: 'etc'
  },
  ERROR: {
    DEFAULT_TITLE: '잔여량 조회 서비스를 이용하실 수 없습니다.',
    BLN0001: {
      title: '잠시 후 다시 이용해주세요',
      contents: '안정적으로 실시간 조회하실 수 있도록 조회 횟수를 제한합니다.'
    },
    BLN0002: {
      contents: '당월 혹은 전월에 기존요금제로 재 변경한 이력이 있어 잔여량 조회 서비스 이용할 수 없습니다.\n자세한 사항은 고객센터로 문의해주세요.'
    },
    BLN0003: {
      contents: '당월 혹은 전월에 정지 이력이 있어 잔여량 조회 서비스를 이용할 수 없습니다.\n자세한 사항은 고객센터로 문의해주세요.'
    },
    BLN0004: {
      contents: '잔여량 조회 가능 항목이 없습니다.\n자세한 사항은 고객센터로 문의해주세요.'
    },
    BLN0005: {
      contents: '본인이 법정대리인으로 등록된 자녀 회선이 아닙니다.\n자세한 사항은 고객센터로 문의해주세요.'
    },
    BLN0006: {
      contents: '잔여량 조회에 실패하였습니다.\n자세한 사항은 고객센터로 문의해주세요.'
    },
    BLN0007: {
      contents: '잔여량 조회 가능 항목이 없습니다.\n자세한 사항은 고객센터로 문의해주세요.'
    },
    BLN0004_S: {
      contents: '잔여량 조회 가능 항목이 없습니다.\n전화/인터넷전화의 정액요금제 고객님만 조회 가능합니다.\n자세한 사항은 고객센터로 문의해주세요.'
    },
  }
};

export const MYT_DATA_USAGE_TOTAL_SHARING_DATA = {
  TITLE: '통합공유 데이터'
};

export const MYT_DATA_USAGE_CANCEL_TSHARE = {
  TITLE: 'T데이터 셰어링 USIM 해지'
};

// [OP002-4379]
export const MYT_DATA_USAGE_PATTERN = {
    TITLE: '최근 사용량'
};

// [OP002-4379]
export const MYT_DATA_USAGE_PATTERN_DETAIL = {
    TITLE: '사용패턴'
};

export const MYT_DATA_CHILD_USAGE = {
  TITLE: '자녀 실시간 잔여량'
};

export const MYT_FARE_BILL_GUIDE = {
  DATE_FORMAT: {
    YYYYMM_TYPE: 'YYYY년 M월'
  },
  FIRST_SVCTYPE: '전체',
  PHONE_SVCTYPE: '휴대폰',
  PHONE_TYPE_0: '이동전화',
  PHONE_TYPE_1: '휴대폰',
  TEL_TYPE_0: '집전화',
  TEL_TYPE_1: '유선전화'
};

export enum MYT_FARE_PAYMENT_NAME {
  BANK = '은행',
  BANK2 = '뱅크',
  BANK3 = 'bank',
  CARD = '카드',
  CARD2 = 'card'
}

export enum MYT_FARE_PAYMENT_TYPE {
  DIRECT = 'DI',
  AUTO = 'AT',
  AUTOALL = 'AU',
  MICRO = 'MP',
  CONTENT = 'CP',
  PRESERVE = 'PR',
  PAUTO = 'PN'
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
  MONTH = '개월',
  HOURS = '시간',
  MINUTE = '분',
  SECOND = '초'
}

export enum MYT_DATA_CHARGE_TYPE_NAMES {
  DATA_GIFT = 'T끼리 데이터 선물',
  LIMIT_CHARGE = '데이터 한도 요금',
  TING_CHARGE = '팅 ZEM 플랜 안심요금',
  TING_GIFT = '팅 요금 선물',
  REFILL_USAGE = '리필쿠폰 사용',
  REFILL_GIFT = '리필쿠폰 선물',
  ALL = '전체'
}

export enum MYT_DATA_REFILL_TYPES {
  DATA = '데이터리필',
  VOICE = '음성리필'
}

export enum MYT_DATA_CHARGE_TYPES {
  GIFT = '선물',
  CHARGE = '충전',
  FIXED = '자동',
  CANCEL = '취소'
}

export enum MYT_DATA_RECHARGE_MSG {
  SELECT_DATA = '데이터 선택',
  REGISTER = '충전 신청하기',
  CHANGE = '변경하기'
}

export enum MYT_DATA_RECHARGE_COUPON {
  A10 = '장기가입 쿠폰',
  A14 = '10년주기 리필쿠폰',
  A20 = '선물받은 리필쿠폰'
}

export const MYT_DATA_HISTORY = {
  send: '보냄',
  recieve: '받음',
  once: '1회',
  auto: '자동',
  recharge: '충전'
};

export enum PRODUCT_INFINITY_BENEFIT {
  NA00006114 = 'T로밍 OnePass 1개월에 1개,<br>마티나 라운지 이용권 3개월에 1회 제공',
  NA00006115_OLD = '영화예매권 2장/1개월',
  NA00006116 = '스마트워치 요금지원',
  NA00006117 = '\'인피니티 클럽\'가입 및 만6개월 사용 후 휴대폰 교체 시 남은 할부금(출고가의 최대 70%까지)을 면제',
  NA00006115 = 'FLO 모바일 스트리밍 이용권 발급 가능, wavve 콘텐츠 팩 이용 시 월정액 무료'
}

export enum PRODUCT_INFINITY_BENEFIT_NM {
  NA00006114 = '인피니티_여행',
  NA00006115_OLD = '인피니티_영화',
  NA00006116 = '인피니티_스마트워치',
  NA00006117 = '인피니티_클럽',
  NA00006115 = '인피니티_콘텐츠'
}

export enum PRODUCT_INFINITY_BENEFIT_PROD_NM {
  NA00006116 = '지원요금제명',
  NA00006117 = '대상'
}

export enum PRODUCT_RESERVATION_TYPE_NM {
  title = '가입 상담 예약',
  cellphone = '휴대폰',
  internet = '인터넷',
  phone = '전화',
  tv = 'TV',
  combine = '결합상품'
}

export enum PRODUCT_RESERVATION_COMBINE_NM {
  NH00000103 = 'TB끼리 한가족할인',
  NA00005055 = '가족나눔데이터',
  NH00000133 = 'New온가족플랜',
  NH00000083 = 'TB끼리 온가족프리',
  NONE = '결합상품을 선택해 주세요.',
  ETC = '그 외 결합상품'
}

export enum PRODUCT_REQUIRE_DOCUMENT_TYPE_NM {
  apply = '필요서류 제출',
  history = '가입신청 내역 조회'
}

export enum PRODUCT_REQUIRE_DOCUMENT {
  NORMAL = '정상',
  ABNORMAL = '비정상',
  APPLY = '제출',
  HISTORY = '조회'
}

export enum PRODUCT_REQUIRE_DOCUMENT_RS {
  R000 = '필요서류 제출기한이 지났습니다.\n(제출기한 : YYYYMDD)',
  R059 = '본인 이외 타인의 서류는 제출이 불가능합니다.',
  R173 = '가족간 명의변경 및 주민(인,외국인)등록번호 정정내용 확인이 가능한 서류(행정기관 발급용)를 제출해주세요.',
  R174 = '가족관계 입증이 가능한 서류를 제출해주세요.',
  R175 = '서류에서 신청하신 가족 정보를 식별할 수 없습니다.\n가족관계 식별이 가능한 서류를 제출해주세요.',
  R176 = '서류에서 신청하신 가족 정보를 확인할 수 없습니다.\n가족관계 입증이 가능한 서류를 제출해주세요.',
  R177 = '개명(개칭) 확인이 가능한 서류를 제출해주세요.',
  R999 = '상세 신청결과는 SK텔레콤 전문 상담원(114)에게 문의해주세요.'
}

export enum PRODUCT_REQUIRE_DOCUMENT_APPLY_RESULT {
  WORKING = '신청하신 내용을 검토 중입니다.',
  NEED_DOCUMENT = '필요서류를 첨부해주세요.',
  NEED_DOCUMENT_RETRY = '필요서류를 다시 첨부해주세요.',
  EXPIRE_DOCUMENT = '필요서류 제출기한이 지났습니다',
  COMPLETE = '검토가 완료 되었습니다.\nSK텔레콤 전문상담원을 통해서 상품 가입이 가능합니다.',
  COMPLETE_ADDITIONAL = '검토가 완료 되었습니다.'
}

export enum PRODUCT_REQUIRE_DOCUMENT_CALLPLAN_RESULT {
  WORKING = '신청하신 내용을 검토 중입니다.',
  NEED_DOCUMENT = '현재 서류 미비 상태입니다.',
  EXPIRE_DOCUMENT = '필요서류 제출기한이 지났습니다',
  COMPLETE = '검토가 완료 되었습니다.'
}

export enum PRODUCT_REQUIRE_DOCUMENT_RESERVATION_RESULT {
  APPLY = '가입서류를 제출',
  HISTORY = '진행결과를 조회'
}

export const MYT_FARE_BILL_REISSUE = {
  TITLE: '요금안내서 재발행',
  REASON: {
    '06': '요금안내서 부달'
  }
};

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
  K: 'Bill Letter+이메일',
  U: '기타(우편)+문자',
  W: '기타(우편)+Bill Letter',
  T: '기타(우편)+문자+Bill Letter',
  Y: '기타(우편)+이메일+Bill Letter',
  X: '기타(우편)+이메일+문자'
};

export const MYT_INFO_DISCOUNT_MONTH = {
  TITLE: '월별 상세 할인 내역'
};

export const MYT_INFO_MIRI = {
  NOT_FOUND_LINE: '회선정보 조회 불가'
};

export const MYT_FARE_PAYMENT_HISTORY_TYPE = {
  all: '전체',
  lastAll: '최근 납부 내역',
  direct: '즉시납부',
  auto: '자동납부',
  autoAll: '자동 납부 통합 인출',
  microPrepay: '휴대폰 결제 선결제',
  contentPrepay: '콘텐츠 이용료 선결제',
  pointReserve: '포인트 납부 예약',
  pointAuto: '포인트 자동납부',
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
    TIT_NM: '요금약정할인제도'
  },
  FEE_TYPE_B: {
    TIT_NM: '테블릿 약정할인 12'
  },
  FEE_TYPE_C: {
    TIT_NM: '테블릿약정할인'
  },
  FEE_TYPE_D: {
    TIT_NM: '와이브로약정할인'
  },
  FEE_TYPE_E: {
    TIT_NM: '선택약정할인제도'
  },
  FEE_TYPE_F: {
    TIT_NM: '2G전환요금할인(70%)'
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
    AGREE_NM: 'T 약정 할부지원',
    TITNM2: '가입 / T 약정할부지원프로그램',
    AGREE_NM2: 'T 약정할부지원프로그램'
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
  DI: '납부 상세내역',
  TPOINT: 'T포인트 납부 상세내역',
  OCB: 'OK캐쉬백 납부 상세 내역',
  BANK: '계좌이체 납부 상세 내역',
  CARD: '신용카드 납부 상세 내역',
  AT: '자동납부 상세 내역',
  AU: '자동납부 상세 내역',
  MP: '휴대폰 결제 선결제 상세 내역',
  CP: '콘텐츠 이용료 선결제 상세 내역'
};

export const MYT_PAYMENT_SKPAY_MANAGE = {
  DI: 'SK pay 설정'
};

export const MYT_PAYMENT_DETAIL_ERROR = {
  MSG: '상세내역을 조회할 수 없습니다.'
};

export const MYT_FARE_PAYMENT_ERROR = {
  DEFAULT: '청구된 요금이 없습니다.',
  REP_SVC_N: '대표청구번호가 아닙니다.',
  COM_CODE_B: ' SK브로드밴드 서비스는 사용이 불가능한 메뉴입니다. <br> 전화 106 또는 SK브로드밴드 웹사이트를 이용해 주시기 바랍니다.'
};

export const MYT_FARE_POINT_MSG = {
  CASHBAG: 'OK캐쉬백포인트',
  TPOINT: 'T포인트',
  RAINBOW: '레인보우포인트',
  RESERVATION: '납부 예약 완료',
  AUTO: '자동납부 신청 완료',
  CHANGE: '자동납부 변경 완료',
  CANCEL: '자동납부 해지 완료',
  REGISTER_POINT: '납부신청 포인트',
  RESERVATION_POINT: '납부 예약 포인트',
  RAINBOW_MSG: '1,000점 이상 보유 시 매월 자동 차감'
};

export const MYT_FARE_COMPLETE_MSG = {
  PAYMENT: '납부 완료',
  HISTORY: '납부내역 보기',
  PREPAY: '선결제 완료',
  PREPAY_HISTORY: '선결제내역 보기',
  REGISTER: '신청 완료',
  CHANGE: '변경 완료',
  CANCEL: '해지 완료',
  CHANGE_HISTORY: '변경내역 보기',
  CANCEL_HISTORY: '해지내역 보기',
  NUMBER: '번호로',
  SMS: '문자 전송 완료',
  SMS_DESCRIPTION: '전송된 입금전용계좌로 입금하시면<br />즉시 입금이 확인됩니다.',
  CARD: '카드 자동납부',
  ONLY_ACCOUNT: '입금전용계좌',
  JIRO: '지로납부'
};

export const MYT_FARE_ERROR_MSG = {
  TITLE: '결제/납부처리가 완료되지 않았습니다.',
  USEREXIT: 'SK pay 납부가 종료되었습니다.',
  MSG_SYSTEM: '시스템 오류입니다. 고객센터에 문의하세요.',
  MSG_TIME: '요청 시간초과 입니다. 고객센터에 문의하세요.',
  MSG_TEMP: '시스템의 비정상 동작으로 요금납부가 일시적으로 불가능합니다. 잠시 후 이용해 주시기 바랍니다.',
  MSG_CODE: '에러코드'
};

export const MYT_DATA_HISTORY_BADGE_NAMES = {
  CHARGE: '충전',
  RECEIVE: '받음',
  SEND: '보냄'
};

export const MYT_DATA_COMPLETE_MSG = {
  DATA_RECHARGE: '데이터 충전 완료',
  DATA_RECHARGE_AUTO: '데이터 자동 충전 신청 완료',
  DATA_RECHARGE_CHANGE: '데이터 자동 충전 변경 완료',
  DATA_RECHARGE_CANCEL: '데이터 자동 충전 해지 완료',
  VOICE_RECHARGE: '음성 충전 완료',
  VOICE_RECHARGE_AUTO: '음성 자동 충전 신청 완료',
  VOICE_RECHARGE_CHANGE: '음성 자동 충전 변경 완료',
  VOICE_RECHARGE_CANCEL: '음성 자동 충전 해지 완료',
  DESCRIPTION: '데이터 1MB 이하 또는<br />사용기간 만료 1일 전일 때 자동 충전됩니다.',
  HISTORY: '충전내역 보기'
};

export const MYT_JOIN_WIRE_SVCATTRCD = {
  M1: '휴대폰',
  M2: '선불폰',
  M3: 'T pocket Fi',
  M4: 'T Login',
  M5: 'T Wibro',
  S1: '인터넷',
  S2: 'TV',
  S3: '집전화',
  O1: '포인트캠'
};

export const MYT_JOIN_WIRE = {
  TITLE: '신청내역',
  AS: { TITLE: '장애 A/S 신청현황' },
  AS_DETAIL: { TITLE: '장애 A/S 상세내역' },
  DISC_REFUND: { TITLE: '할인 반환금 조회' },
  FREECALL_CHECK: { TITLE: 'B끼리 무료 통화 대상자 조회' },
  GIFTS: { TITLE: '사은품 조회' },
  HISTORY: { TITLE: '신청현황' },
  HISTORY_DETAIL: { TITLE: '신청현황 상세' },
  MODIFY_ADDRESS: { TITLE: '설치 장소 변경' },
  MODIFY_PERIOD: { TITLE: '약정 기간 변경' },
  MODIFY_PRODUCT: { TITLE: '상품 변경' },
  NETPHONE_CHANGE: { TITLE: '신청내역' },
  SET_WIRE_CANCEL: { TITLE: '할인 반환금 정보' }
};

export const MYT_JOIN_WIRE_GUIDE_CHANGE_OWNERSHIP = {
  TITLE: '명의 변경 신청 방법 안내'
};

export const MYT_JOIN_WIRE_HIST_DTL_TIT_MAP = {
  '143': '약정기간 변경 상세내역',
  '153': '요금상품 변경 상세내역',
  '162': '설치장소 변경 상세내역',
  '167': '신규가입 상세내역',
  '168': '가입상품 변경 상세내역'
};

export const MYT_JOIN_WIRE_MODIFY_PERIOD = {
  TITLE: '약정 기간 변경'
};

export const MYT_JOIN_WIRE_SET_PAUSE = {
  TITLE: '일시 정지/해제',
  MONTH: '개월 ',
  DAY: '일',
  AC: '일시 정지 신청',
  SP: '일시 정지 해제'
};

export const MYT_JOIN_THIGH5_PREFERENTIAL = {
  DGB: {
    '01': '우대금리 2%',   // NC00000074 : 우대금리
    '02': 'T high5 캐시백 1%',   // NC00000075 : 우대금리 + 캐시백
    '03': '우대금리 2%',   // NC00000076 : 우대금리
    '04': 'T high5 캐시백 1%',   // NC00000077 : 우대금리 + 캐시백
    NC00000080: 'T high5 0히어로 캐시백 1%'   // NC00000080 : ?값이 어떻게 올지 확인필요
  },
  KDB: {
    '01': '우대금리 I 2%',  // NC00000083:
    '02': '조건 충족 시 우대금리 II 1%',  // NC00000082:
    '03': '우대금리 I 2%',  // NC00000085:
    '04': '조건 충족 시 우대금리 II 1%',  // NC00000084:
  }
};

export enum CUSTOMER_NOTICE_CATEGORY {
  TWORLD = 'T world',
  DIRECTSHOP = 'T다이렉트샵',
  MEMBERSHIP = 'T멤버십',
  ROAMING = 'T로밍',
  VIEW = '공지사항'
}

export enum CUSTOMER_PROTECT_GUIDE {
  VIDEO = '동영상으로 보는 피해예방법',
  WEBTOON = '웹툰으로 보는 피해예방법',
  LATEST = '최신 이용자 피해예방 정보'
}

export const MY_BENEFIT_RAINBOW_POINT = {
  TITLE: '레인보우 포인트',
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

export const T_MEMBERSHIP_BENEFIT_BRAND = {
  TITLE: '제휴 브랜드'
};

export enum SELECT_POINT {
  DEFAULT = '납부할 포인트 선택'
}

export const PRODUCT_WIRE_CATEGORIES = {
  INTERNET: '인터넷',
  PHONE: '전화',
  TV: 'TV'
};

export enum DEFAULT_SELECT {
  SELECT = '선택'
}

export const BRANCH_SEARCH_OPTIONS = {
  0: '전체',
  1: '지점',
  2: '대리점',
  premium: 'T프리미엄스토어',
  direct: '바로 픽업',
  rent: '임대폰',
  skb: 'SK브로드밴드',
  apple: '애플취급점',
  authAgnYn: '공식인증 대리점',
  etc: ' 외 ',
  count: '건'
};

export const CUSTOMER_FAQ_SEARCH_FILTER = {
  1100000: '요금제',
  1101000: '모바일',
  1102000: '결합상품',
  1103000: '휴대용 와이파이',
  1104000: '인터넷/집전화 상품',
  1200000: '가입/변경/해지',
  1201000: '가입/변경/해지',
  1202000: '휴대폰 분실/습득',
  1203000: '일시정지',
  1300000: '요금조회/납부',
  1301000: '모바일',
  1302000: '인터넷 요금',
  1303000: '전화요금',
  1400000: 'T로밍',
  1401000: '데이터 로밍',
  1402000: '요금/로밍 쿠폰',
  1403000: '이용방법/장애',
  1500000: 'T멤버십',
  1501000: '카드발급',
  1502000: '신청/변경/해지',
  1503000: 'T멤버십 활용/혜택',
  1504000: '포인트/활용/혜택',
  1505000: 'T멤버십 기타',
  1600000: '앱/부가서비스',
  1601000: '부가서비스',
  1602000: '앱 이용안내',
  1700000: '통화품질개선',
  1701000: '통화품질',
  1702000: '인터넷 기술장애/품질',
  1703000: '휴대폰 안내',
  1800000: 'T다이렉트샵',
  1801000: '휴대폰 구매/혜택',
  1802000: 'T다이렉트샵 구매/이동',
  1803000: 'T다이렉트샵 배송',
  1804000: 'T다이렉트샵 교환/반품',
  1805000: '휴대폰가격공시 기타',
  1900000: 'T월드 이용안내',
  1901000: '모바일 T World',
  1902000: '회원/계정',
};


export const PRODUCT_TYPE_NM = {
  CALLPLAN: '상품 상세 정보',
  JOIN: '가입',
  CHANGE: '변경',
  TERMINATE: '해지',
  SETTING: '설정',
  LOOKUP: {
    TPLAN: '혜택이용내역'
  },
  LINE_PROCESS: {
    SELECT: {
      TITLE: '회선 선택',
      BUTTON: '진행하기',
      DESCRIPTION: '변경할 회선을 선택해 주세요.'
    },
    CHANGE: {
      TITLE: '회선 변경',
      BUTTON: '변경하기',
      DESCRIPTION: '현재 회선으로는 이용이 불가능 합니다.<br>다른 회선으로 변경해 주세요.'
    }
  },
  RESERVATION_CANCEL: {
    JOIN: '가입예약 취소',
    TERMINATE: '해지예약 취소',
    CHANGE: '변경예약 취소'
  }
};

export const PRODUCT_CALLPLAN_FEEPLAN = '부가세포함';

export const PRODUCT_CTG_NM = {
  PLANS: '요금제',
  ADDITIONS: '부가서비스',
  DISCOUNT_PROGRAM: '할인프로그램',
  COMBINATIONS: '결합상품'
};

export const PRODUCT_SIMILAR_PRODUCT = {
  PRODUCT: '상품을',
  PLANS: '요금제를',
  ADDITIONS: '부가서비스를'
};

export const MYT_SUSPEND_STATE = {
  R: '접수중',
  D: '서류확인 중',
  E: '재첨부서류확인중',
  A: '서류재첨부필요',
  F: '처리불가',
  C: '처리완료'
};
export const MYT_SUSPEND_STATE_EXCLUDE = '(사유)';
export const FEE_PLAN_TIP_TXT = {
  MS_05_tip_01: '요금제 안내',
  MS_05_tip_02: '선불 휴대폰 요금제 변경',
  MS_05_tip_03: 'SK텔레콤을 통해 가입한 상품',
  MS_05_tip_04: '요금제 안내'
};

export const MAIN_MENU_REFUND_STATE = {
  ORIGIN_MSG_ING: '송금중',
  ORIGIN_MSG_COMPLETE: '송금완료',
  ORIGIN_MSG_BRANCH_COMPLETE: '영업점환불',
  ORIGIN_MSG_ERROR: '송금오류',
  APPLY: '신청',
  COMPLTE: '완료',
  COMPLTE_B: '영업점 환불',
  ERROR: '송금오류'
};

export const MAIN_MENU_REFUND_SVC_TYPE = {
  PHONE_TYPE_0: '이동전화',
  PHONE_TYPE_1: '휴대폰'
};

export const NEW_NUMBER_MSG = {
  MOD0030: '번호변경안내서비스 신청 가능한 번호변경 이력이 없습니다.',
  MOD0031: '번호변경전 번호가 타사번호인 경우는 지점/대리점/고객센터를 통해 신청 가능합니다.'
};

export const MYT_SUSPEND_ERROR_MSG = {
  NOT_SUSPENDED: '일시정지 상태가 아닙니다.'
};

export const TERM_STRING = {
  RESELL: '재판매 이용약관',
  MEMBERSHIP: '멤버십 회원약관',
  ACTION_TITLE: {
    102: '이용약관'
  },
  MEMBERSHIP_PER: '멤버십 개인정보처리방침'
};

export const ETC_CENTER = '기타';

export const PRODUCT_MOBILEPLAN_COMPARE_PLANS = {
  MY_DATA_TXT: '나의 데이터',
  USAGE_TXT: '사용량',
  MONTH_TXT: '{0}개월',
  RECENT_AVG_TXT: '최근 {0} 평균',
  RECENT_MAX_TXT: '최근 {0} 최대'
};

export const CUSTOMER_DAMAGEINFO_CONTENTS_TITLE = {
  page001: '스미싱 피해예방 안내',
  page002: '메모리 해킹 주의보',
  page003: '파밍 피해 예방법',
  page004: '클라우드 보안 방법',
  page005: '스마트폰 보안 수칙',
  page006: '스팸 문자 대응 방법',
  page007: '로그인 제한 제도',
  page008: '휴면 고객 제도',
  page009: 'T world 비밀번호 관리',
  page010: '개인정보 유효기간',
  page011: '가려진 정보보기(마스킹)',
  page012: '꼭 지켜야 할 정보보호 실천수칙 10가지',
  page013: '명의도용 피해예방법',
  page014: '결합상품 피해예방법',
  page015: '휴대폰 결제 피해예방법',
  page016: '해외 로밍 피해예방법',
  page017: 'SNS 개인정보 보호 꿀팁! (2단계 인증설정)',
  page018: 'SNS 개인정보 보호 꿀팁! (사진 속 개인정보 확인)'
};

// 지점/대리점 찾기
export const CUSTOMER_AGENT_SEARCH = {
  POSSIBLE_TASK: {
    TITLE: '처리 가능 업무',
    BODY: {
      dvcChange: '기기변경',
      nmChange: '명의변경',
      feeAcceptance: '요금수납',
      rbpAsYn: 'A/S',
      hanaroCode: '유선/인터넷TV', // SK브로드밴드 -> 유선/인터넷TV
      secuConsulting: 'ADT캡스보안', // 보안상담 -> ADT캡스보안
      appleYn: '애플취급',
      pickupYn: '바로픽업',
      nameTheft: '명의도용접수',
      callHistSearch: '통화내역조회',
      rentYn: '임대폰',
      safeDealKiosk: '안심거래 키오스크',
      skMagicRent: 'SK매직'
    }
  },

  PRO_COUNSEL: {
    TITLE: '예약상담업무', // 명칭변경. 전문 상담 -> 예약상담업무
    BODY: {
      tSharpYn: '휴대폰일반,유선/인터넷/TV,ADT캡스보안'
    }
  },

  // PROGRAM: {
  //   TITLE: '프로그램',
  //   BODY: {
  //     speedYn: '스마트폰 기초 과정',
  //     applEduYn: '스마트폰 응용 과정',
  //     codingEduYn: '코딩 교실'
  //   }
  // },

  EXP_ZONE: {
    TITLE: '체험존',
    BODY: {
      fiveGxYn: '5GX 체험존',
      vrYn: 'VR 체험존',
      dvcExprZone: '단말체험존'
    }
  },

  ETC: {
    TITLE: '기타',
    BODY: {
      prkPsblCnt: '주차가능',
      disSlopeYn: '장애인경사로설치'
    }
  }
};

export const ROAMING_RECEIVE_CENTER = {
  '0': '인천공항 1터미널 3층 로밍 센터(F 카운터)',
  '1': '인천공항 1터미널 3층 로밍 센터(H 카운터)',
  '2': '인천공항 2터미널 3층 로밍 센터(D-E 카운터)',
  '3': '김포공항 1층 로밍 센터',
  '4': '제주공항 국제선 1층 로밍 센터',
  '5': '김해공항 3층 로밍 센터',
  '6': '대구공항 2층 로밍 센터',
  '7': '부산항 국제여객터미널 2층 로밍센터',
  '8': '대구 SKT 황금점 매장'
};

export const NODE_API_ERROR = {
  '1001': '로그인이 필요합니다.',
  '1002': '인증 오류 입니다.',
  '1003': '이미 처리 되었습니다.',
  '1004': '세션이 만료 되었습니다.',
  '01': '해당 값이 없습니다.',
  '02': '잘못된 형식입니다.'
};

export const MEMBERSHIP_DELIVERY_CODE = {
  '1': '신청완료',
  '2': '발송',
  '3': '배송중',
  '4': '발송완료',
  '5': '즉시발급완료',
  '6': '2년내 카드신청이력 없음',
  '8': '정보오류',
  '9': '반송'
};

/**
 * @author Lee Kirim
 * @since 2018-12-13
 * @desc 고객센터 > 사이트 이용방법 온리안 T world 제목과 컨텐츠 아이디 번호
 * @prop {string} cat 카테고리 이름
 * @prop {string} title 제목
 * @prop {string} code 상세조회 API 에서 사용될 코드 값
 * @prop {string} className 클래스이름 css 로 아이콘 모양(카테고리 종류에 따라 달라짐)
 * @prop {number} listIndex 리스트 순서
 */
export const CUSTOMER_SITE_OPTION_TYPE = [
  {
    cat: '기타',
    title: '가려진 정보 확인 방법',
    code: 'D00007',
    className: 'ico-etc',
    listIndex: 0
  },
  {
    cat: 'myT',
    title: '휴대폰 결제 현명하게 관리하기',
    code: 'D00002',
    className: 'ico-myt',
    listIndex: 1
  },
  {
    cat: '회선',
    title: '다회선 설정하기',
    code: 'D00001',
    className: 'ico-member',
    listIndex: 2
  },
  // {
  //   cat: '회선',
  //   title: 'T world에 등록된 법인명의 휴대폰번호 삭제 방법',
  //   code: 'D00006',
  //   className: 'ico-member',
  //   listIndex: 3
  // },
  // {
  //   cat: '회선',
  //   title: '[법인명의 태블릿] 다회선 등록하기',
  //   code: 'D00005',
  //   className: 'ico-member',
  //   listIndex: 4
  // },
  {
    cat: '기타',
    title: '모두에게 평등한 T world의 웹접근성 안내',
    code: 'D00008',
    className: 'ico-etc',
    listIndex: 5
  }
  // {
  //   cat: '기타',
  //   title: 'T world의 모든 메뉴 꼼꼼히 살펴보기',
  //   code: 'D00009',
  //   className: 'ico-etc',
  //   listIndex: 6
  // }
];

export const CUSTOMER_RESEARCH_ERROR = {
  MSG: '진행중인 설문/투표/퀴즈가 아닙니다.',
  MSG2: '존재하는 설문/투표/퀴즈가 아닙니다.'
};

export const DIRECTSHOP_LINK = {
  common: 'https://m.shop.tworld.co.kr/shopguide',
  benefit: '/submain',
  buy: '/inqr/#qna_tab1',
  delivery: '/inqr/#qna_tab2',
  exchangeReturn: '/inqr/#qna_tab3'
};

/**
 * @author Lee Kirim
 * @since 2018-12-18
 * @desc [이용안내-서비스_이용안내] 리스트에서 사용되는 목록
 * @prop {string} title 카테고리 이름
 * @prop {string} unitedTitle? 다른 카테고리와 합쳐져 노출되야 하는 경우 사용되는 이름
 * @prop {string} united? 다른 카테고리와 합쳐져 노출되야 하는 경우 합쳐질 카테고리 (해당 이름이 같은 것끼리 합친다)
 * @prop {string} text? 다른 카테고리와 합쳐져 노출되야 하는 경우 설명글 필요
 * @prop {boolean} upperCat sub_list 의 내용을 dep_list 로 변경해 노출해야 할지 여부
 * @prop {array} sub_list 카테고리내 하위 목록
 *  *@prop {string} sub_title 하위 카테고리 제목
 *  *@prop {string} sub_text 하위카테고리 설명
 *  *@prop {string} type? dep_list가 없을 때는 해당 셀렉트 박스 없이 클릭시 이동되도록 하기위해 dep_list의 하위 항목과 같은 형태가 있음 상세 콘텐츠 타입
 *  *@prop {string} code? dep_list가 없을 때 상세조회에서 사용될 코드 상세 API 조회가 아니고 url 이동일 경우 string에 url: 을 붙임
 *  *@prop {array} dep_list? 카테고리의 하위 카테고리 (해당 리스트는 front에서 셀렉트 박스로 선택하는 목록이 됨)
 *    *@prop {string} dep_title 옵션제목
 *    *@prop {string} type 상세페이지 타입
 *    *@prop {string} code 상세페이지 코드 url 이동일 경우 string에 url: 을 붙임
 */
export const CUSTOMER_SERVICE_OPTION_TYPE = [
  {
    title: '휴대폰 가입/변경 안내',
    sub_list: [
      {
        sub_title: '휴대폰 가입',
        sub_text: '가입/번호이동/기기 안내를 원한다면',
        dep_list: [
          {
            dep_title: '휴대폰 가입',
            type: 'A1',
            code: 'C00014'
          },
          {
            dep_title: '기기 자급제도',
            type: 'A1',
            code: 'C00023'
          },
          {
            dep_title: '번호이동',
            type: 'A1',
            code: 'C00013'
          },
          {
            dep_title: '번호관리제도',
            type: 'A1',
            code: 'C00018'
          }
        ]
      },
      {
        sub_title: '미성년자 가입',
        sub_text: '가입방법/부모동의 절차가 궁금하다면',
        dep_list: [
          {
            dep_title: '미성년자 가입',
            type: 'A1',
            code: 'C00015'
          },
          {
            dep_title: '미성년자 보호 서비스',
            type: 'A1',
            code: 'C00017'
          }
        ]
      },
      {
        sub_title: '유심 변경',
        sub_text: '유심을 변경하여 사용하고 싶다면',
        dep_list: [
          {
            dep_title: '유심 잠금해제',
            type: 'A1',
            code: 'C00019'
          },
          {
            dep_title: '내 유심으로 SK텔레콤 기기 사용',
            type: 'A1',
            code: 'C00016'
          },
          {
            dep_title: '내 유심으로 타사 기기 사용',
            type: 'A1',
            code: 'C00012'
          } // ,
          /* {
            dep_title: '타사 유심으로 SK텔레콤 기기 사용',
            type: 'A2',
            code: 'C00025'
          } */
        ]
      }
    ]
  },
  {
    title: '휴대폰 요금 기준 안내',
    sub_list: [
      {
        sub_title: '요금 기준',
        sub_text: '일반/스마트폰 요금 기준이 궁금하다면',
        type: 'B1',
        code: 'C00031'
      },
      {
        sub_title: 'LTE데이터 사용요금',
        sub_text: 'LTE 요금 기준이 궁금하다면',
        type: 'B1',
        code: 'C00029'
      },
      {
        sub_title: 'band LTE',
        sub_text: 'band LTE 요금 기준이 궁금하다면',
        type: 'B2',
        code: 'C00027'
      },
      {
        sub_title: '데이터 사용요금',
        sub_text: '데이터 사용요금 부과 기준이 궁금하다면',
        dep_list: [
          {
            dep_title: '데이터 사용요금 안내',
            type: 'A1',
            code: 'C00032'
          },
          {
            dep_title: '데이터 사용 유의사항',
            type: 'A1',
            code: 'C00034'
          }
        ]
      },
      {
        sub_title: '부가세 포함',
        sub_text: '부가세 포함 요금정책이 궁금하다면',
        type: 'B1',
        code: 'C00030'
      },
      {
        sub_title: '영상통화 요금',
        sub_text: '영상통화 요금정책이 궁금하다면',
        type: 'B1',
        code: 'C00033'
      }
    ]
  },
  {
    unitedTitle: 'T다이렉트샵/T멤버십/T로밍 안내',
    united: '_3T',
    title: 'T다이렉트샵 이용안내',
    text: 'T다이렉트샵에서 구매를 원한다면',
    upperCat: true,
    sub_list: [
      {
        // sub_title: '할인/혜택',
        sub_title: '차원이 다른 혜택',
        sub_text: '',
        dep_list: [
          {
            dep_title: '혜택',
            type: 'A1',
            code: `url:${DIRECTSHOP_LINK.common}${DIRECTSHOP_LINK.benefit}`
            // code: 'C00001'
          }
          // 다이렉트 관련 내용은 더이상 사용하지 않기 때문에 삭제 해도 된다고 함 - 기획(김린아 선임님)
          // type에 대한 정확한 내용은 확인 불가(A1,A2,B1... 기타등등)
          // {
          //   dep_title: '결합할인',
          //   type: 'A1',
          //   code: 'C00007'
          // },
          // {
          //   dep_title: 'T world 다이렉트 혜택',
          //   type: 'A2',
          //   code: 'C00009'
          // }
        ]
      },
      {
        // sub_title: '구매',
        sub_title: '구매/배송',
        sub_text: '',
        dep_list: [
          {
            dep_title: '구매배송',
            type: 'A2',
            code: `url:${DIRECTSHOP_LINK.common}${DIRECTSHOP_LINK.buy}`
            // code: 'C00011'
          }
          // {
          //   dep_title: '다이렉트샵구매가이드',
          //   type: 'A2',
          //   code: 'C00010'
          // },
          // {
          //   dep_title: '가입유형',
          //   type: 'A1',
          //   code: 'C00005'
          // },
          // {
          //   dep_title: '휴대폰분할상환수수료',
          //   type: 'A2',
          //   code: 'C00006'
          // },
          // {
          //   dep_title: '구매유의사항',
          //   type: 'A2',
          //   code: 'C00008'
          // }
        ]
      },
      {
        // sub_title: '배송/개통',
        sub_title: '개통/세팅',
        sub_text: '',
        dep_list: [
          {
            dep_title: '개통세팅',
            type: 'A2',
            code: `url:${DIRECTSHOP_LINK.common}${DIRECTSHOP_LINK.delivery}`
            // code: 'C00002'
          }
          // {
          //   dep_title: '개통방법',
          //   type: 'A1',
          //   code: 'C00003'
          // },
          // {
          //   dep_title: '반품교환',
          //   type: 'A1',
          //   code: 'C00004'
          // }
        ]
      },
      {
        sub_title: '교환/반품',
        sub_text: '',
        dep_list: [
          {
            dep_title: '교환반품',
            type: 'A2',
            code: `url:${DIRECTSHOP_LINK.common}${DIRECTSHOP_LINK.exchangeReturn}`
            // code: 'C00002'
          }
          // {
          //   dep_title: '개통방법',
          //   type: 'A1',
          //   code: 'C00003'
          // },
          // {
          //   dep_title: '반품교환',
          //   type: 'A1',
          //   code: 'C00004'
          // }
        ]
      }
    ]
  },
  {
    unitedTitle: 'T다이렉트샵/T멤버십/T로밍 안내',
    united: '_3T',
    title: 'T멤버십/T로밍 안내',
    text: '',
    upperCat: false,
    sub_list: [
      {
        sub_title: 'T멤버십 이용안내',
        sub_text: 'T멤버십 이용이 궁금하다면',
        dep_list: [
          {
            dep_title: 'T멤버십 이용',
            type: 'A2',
            code: 'C00037'
          },
          // {
          //   dep_title: '초콜릿 이용',
          //   type: 'A1',
          //   code: 'C00035'
          // },
          {
            dep_title: '모바일 T멤버십',
            type: 'A2',
            code: 'C00036'
          }
        ]
      },
      {
        sub_title: 'T로밍 이용안내',
        sub_text: '해외여행을 준비하고 계신다면',
        type: 'B1',
        code: 'C00020'
      }
    ]
  },
  {
    title: '서비스 정책/제도 안내',
    sub_list: [
      {
        sub_title: '데이터 리필하기',
        sub_text: '데이터 리필하기 정책과 제도가 궁금하다면',
        type: 'B1',
        code: 'C00040'
      },
      {
        sub_title: 'T끼리 데이터 선물하기',
        sub_text: '데이터 선물하기 정책과 제도가 궁금하다면',
        dep_list: [
          {
            dep_title: 'T끼리 데이터 선물하기',
            type: 'A1',
            code: 'C00041'
          },
          {
            dep_title: 'T끼리 자동선물 신청',
            type: 'A1',
            code: 'C00042'
          }
        ]
      },
      {
        sub_title: 'T기본약정 요금정책',
        sub_text: 'T기본약정 요금정책과 제도가 궁금하다면',
        type: 'B1',
        code: 'C00039'
      }
    ]
  },
  {
    title: '목소리 인증/ARS상담 안내',
    sub_list: [
      {
        sub_title: 'ARS상담 이용안내',
        sub_text: 'ARS로 직접 상담받고 싶다면',
        dep_list: [
          {
            dep_title: '버튼식 ARS',
            type: 'A3',
            code: 'C00038'
          },
          {
            dep_title: '보이는 ARS',
            type: 'A2',
            code: 'C00021'
          },
          {
            dep_title: '음성인식 ARS',
            type: 'A2',
            code: 'C00022'
          }
        ]
      },
      {
        sub_title: '목소리 인증 이용안내',
        sub_text: '더 안전한 ARS이용을 원하신다면',
        dep_list: [
          {
            dep_title: '목소리 인증',
            type: 'A2',
            code: 'C00024'
          },
          {
            dep_title: '목소리 등록 문자받기',
            type: 'A2',
            code: 'url:/customer/svc-info/voice'
          }
        ]
      }
    ]
  }
];

export const PRODUCT_COMBINE_FAMILY_TYPE = {
  leader: '가족대표',
  parents: '부모',
  grandparents: '(증)조부모',
  grandchildren: '손자녀',
  spouse: '배우자',
  children: '자녀',
  brother: '형제자매',
  me: '본인'
};

export const MYT_JOIN_PERSONAL = '개인';
export const MYT_JOIN_FAMILY = '패밀리';
export const MYT_SUSPEND_REASON = {
  1000000: '고객요청',
  5000341: '군입대(현역)',
  5000342: '군입대(현역)',
  5000343: '해외체류',
  5000344: '해외체류',
  5000349: '군입대(현역 외)',
  5000350: '군입대(현역 외)'
};

export const MYT_SUSPEND_COMPLETE_MSG = {
  SUCCESS_LONG_TERM_SUSPEND_MESSAGE_MILITARY: '회선번호: {SVC_INFO}<br />장기일시정지 기간: {DURATION}',
  SUCCESS_LONG_TERM_SUSPEND_MESSAGE_ABROAD: '회선번호: {SVC_INFO}<br />장기일시정지 시작일: {DURATION}',
  SUCCESS_SUSPEND_MESSAGE: '일시정지 기간: {DURATION}<br />일시정지 설정: {SUSPEND_TYPE}',
  SUCCESS_RESUSPEND_MESSAGE: '회선번호: {SVC_NUMBER}<br />재시작 기간: {DURATION}',
  GO_TO_STATUS: '일시정지 신청현황',
  RESUSPEND: '재신청',
  CANCEL_RESUSPEND: '재신청 취소',
  RESET: '해제',
  APPLY: '신청',
  APPLY_LONGTERM: '접수',
  TYPE: {
    ALL: '걸기/받기 모두 정지',
    CALL: '걸기만 정지'
  },
  LONG_TERM_SUSPEND_WARNING: '접수하신 장기 일시정지 시작일자는 입증서류 확인 후<br>처리 시점에 따라 변경될 수 있습니다.'
};

export const BENEFIT_TBCOMBINATION_JOIN_STATUS = {
  IS_COMBINED: '결합가능',
  DIS_COMBINED: '결합완료'
};

export const PREMTERM_MSG = {
  LESS_180: '프리미엄패스1 가입일 포함 181일 이전 요금제 하향 시 서비스가 자동해지 되며, 서비스 가입기간에 따라 차액정산금 및 해지위약금이 부과됩니다.<br>단, 프리미엄패스1 가입자의 경우 6개월 유지 시 차액 정산금은 청구되지 않으니, 참고하시기 바랍니다.<br>	&#39;19. 12. 2(월) ~ 	&#39;20. 6. 30(화) 기간 내 가입자의 경우 요금이 0원인 요금제 및 세대 간 요금제 변경 시 프리미엄패스1 자동해지되며 유지기간 무관하게 차액정산금이 발생될 수 있습니다.',
  LESS_365: '프리미엄패스2 가입 후 365일 이전에 낮은 요금제로 변경하시면 서비스가 자동 해지되며, 서비스 가입기간에 따라 해지 위약금이 청구됩니다. ' +
    '요금제를 변경한 날 다시 처음 가입하신 요금제로 변경하셔도 프리미엄패스2에 다시 가입하실 수 있습니다. 해지하신 경우 해지 위약금이 이중으로 발생하지 않습니다.'
};

export const TID_MSG = {
  LOGIN_FAIL: '로그인 실패',
  LOGIN_EXCEED: '1일 로그인 허용횟수 초과',
  LOGIN_EXCEED_MSG: '30회 초과하여 금일 24시까지 이용 불가합니다.'
};

export const PREPAY_ERR_MSG = {
  FAIL: '이번 달 잔여한도가 정상적으로 조회되지 않았습니다. 잠시 후 다시 시도해 주세요.'
};

export const MOBILEPLAN_ADD_ERROR_MSG = {
  WATCHTAB: {
    NON_USER: '5GX 프라임, 5GX 플래티넘 이용중인 고객들 대상으로 가입 가능한 부가서비스입니다.'
  }
};

export const HAPPYCOM_SEARCH_OPTIONS = {
  all: '전체',
  speedYn: '스마트폰 기초 과정',
  applEduYn: '스마트폰 응용 과정',
  codingEduYn: '코딩교실'
};

export const MYT_JOIN_WIRE_NUMBER_CHANGE = {
  TITLE: '전화 번호변경'
};

export const SMART_CALL_PICK = [
  {
    prodNum: '1',
    prodNm: '콜키퍼',
    descri: '미처 못 받은 전화 연락을 문자로 받아볼 수 있어요',
    amount: '550',
    value: 'NA00004343',
    checked: false
  },
  {
    prodNum: '2',
    prodNm: '컬러링',
    descri: '나만의 통화 연결음을 설정할 수 있어요',
    amount: '990',
    value: 'NA00000282',
    checked: false
  },
  {
    prodNum: '3',
    prodNm: '통화가능통보플러스',
    descri: '상대방 통화가 끝나면 알려드리니 걱정 없어요',
    amount: '770',
    value: 'NA00000288',
    checked: false
  },
  {
    prodNum: '4',
    prodNm: '안심문자',
    descri: '내가 보낸 문자가 잘 도착했는지 확인할 수 있어요',
    amount: '990',
    value: 'NA00001509',
    checked: false
  },
  {
    prodNum: '5',
    prodNm: 'T안심콜',
    descri: '050 안심번호 3개로 개인정보를 철저히 보호하세요',
    amount: '2,200',
    value: 'NA00004689',
    checked: false
  },
  {
    prodNum: '6',
    prodNm: '개별통화수신거부',
    descri: '원치 않는 전화나 문자는 차단하세요',
    amount: '2,200',
    value: 'NA00000273',
    checked: false
  },
  {
    prodNum: '7',
    prodNm: 'T ARS',
    descri: '나만의 자동 응답 사서함을 직접 만들어보세요',
    amount: '1,650',
    value: 'NA00005172',
    checked: false
  },
  {
    prodNum: '8',
    prodNm: '자동연결(유료)',
    descri: '전화를 못 받는 상황에 다른 번호로 연결해드려요',
    amount: '990',
    value: 'NA00000278',
    checked: false
  },
  {
    prodNum: '9',
    prodNm: '친구찾기_앱정액제',
    descri: '친구나 가족의 위치가 궁금할 때 사용하세요',
    amount: '1,650',
    value: 'NA00003708',
    checked: false
  },
  {
    prodNum: '10',
    prodNm: '착신전환일반',
    descri: '전화가 오면 다른 번호로 돌려 받을 수 있어요',
    amount: '1,650',
    value: 'NA00001350',
    checked: false
  },
  {
    prodNum: '11',
    prodNm: 'T메모링',
    descri: '중요한 일정과 메모를 들려 드려요',
    amount: '990',
    value: 'NA00004195',
    checked: false
  }
];

export const ROAMING_CUSTOMIZED_MESSAGE = {

  SIXTY_DAY: '60일 안의 날짜를 선택하세요.'
};

export const ROAMING_PRODUCT_CUSTOMIZE_DATA = {
  NA00006487: { // baro OnePass VIP 기간형
    selectableStartDateRange: 60,
    selectableStartDate: ROAMING_CUSTOMIZED_MESSAGE.SIXTY_DAY
  },
  NA00006745: { // baro OnePass Data VIP 기간형
    selectableStartDateRange: 60,
    selectableStartDate: ROAMING_CUSTOMIZED_MESSAGE.SIXTY_DAY
  }
};

export const NODE_ERROR_MSG = {
  '1006': '잘못된 접근 경로 입니다.',
  '1007': '가입된 모바일 회선이 존재하지 않습니다.',
  '1008' : '만 14세 미만 미성년자는<br>이용하실 수 없는 메뉴입니다.',
  '1009' : '고객센터를 통해 예약 가능합니다.',
  '1010' : '이용에 불편을 드려서 죄송합니다.'
};

// 개인화 진입 아이콘의 노출 user line type list(설명서비스등급(svcGr))
export const TARGET_LINE_LIST = [
  'A',  // 통화내역조회가능이동전화 시스템
  'Y'   // 일반개인이동전화 시스템
];

// 개인화 진입 아이콘의 노출 user agent list
export const TARGET_AGENT_LIST = [
  'iPhone12_3', // 아이폰 11 PRO
  'SM-G988N',   // 갤럭시S20울트라 5G
  'SM-G986N',   // 갤럭시S20 플러스 5G
  'SM-G981N',   // 갤럭시S20 5G
  'SM-F907N',   // 갤럭시폴드 5G
  'SM-G977N',   // 갤럭시S10 5G (2차)
  'SM-N971N',   // 갤럭시노트10 5G (2차)
  'SM-N976N',    // 갤럭시노트10 플러스 5G (2차)
  'SM-A716S',   // 갤럭시A퀀텀 (3차)
  'LM-G900N',   // LG 벨벳 (3차)
  'SM-A516N',   // 갤럭시 A51 5G (3차)
  'LM-V500N',   // V50 ThinQ (3차)
  'LM-V510N',   // V50S ThinQ (3차)
  'SM-A908N',   // 갤럭시 A90 5G (3차)
  'OMD XIAOMI REDMI NOTE 5',   // REDMI NOTE 5 (3차)
  'SM-F700N',   // 갤럭시Z플립 (3차)
  'SM-G970N',   // 갤럭시S10E (3차)
  'SM-G975N',   // 갤럭시S10+ (3차)
  'SM-G973N',   // 갤럭시S10 (3차)
  'SM-J415N',   // 갤럭시J4+ (3차)
  'SM-A920N',   // 갤럭시A9(2018) (3차)
  'SM-G887N',   // 갤럭시A9 PRO(2018) (3차)
  'SM-A805N',   // 갤럭시A80 (3차)
  'SM-A750N',   // 갤럭시A7(2019) (3차)
  'SM-A505N',   // 갤럭시A50 (3차)
  'SM-A405S',   // 갤럭시A40 (3차)
  'SM-A305N',   // 갤럭시A30 (3차)
  'SM-A102N',   // 갤럭시A10E (3차)
  'SM-A205S_VIVA',   // 갤럭시 WIDE4 VIVA edition (3차)
  'SM-A205S',   // 갤럭시 WIDE4 (3차)
  'SM-A315N',   // 갤럭시 A31 (3차)
  'XPERIA_XZ3',   // XZ3 (3차)
  'LM-X625N',   // X6 (3차)
  'LM-X420N',   // X4(2019) (3차)
  'LM-X220N',   // X2(2019) (3차)
  'LM-V409N',   // V40 (3차)
  'LM-Q925S',   // Q9 (3차)
  'LM-Q730N',   // Q70 (3차)
  'LM-Q630N',   // Q61 (3차)
  'LM-Q510N',   // Q51 (3차)
  'LM-G820N',   // G8 (3차)
  'iPhone12_5',   // 아이폰11PRO MAX (3차)
  'iPhone12_1',   // 아이폰11  (3차)
  'iPhone11_2',   // 아이폰XS  (3차)
  'iPhone11_6',   // 아이폰XS MAX (3차) 
  'iPhone11_8',   // 아이폰XR  (3차)
  // 'iPhone8_4'   // 아이폰 SE 2020 (3차)
  'iPhone12_8'   // 아이폰 SE 2020 (3차)
];
// '나의 데이터/통화' UI 고도화 진입 user agent list
export const TARGET_ADV_AGENT_LIST = [
  // 'SM-G970N',   // 갤럭시S10E (1차)
  // 'SM-G975N',   // 갤럭시S10+ (1차)
  // 'SM-G973N',   // 갤럭시S10 (1차)
  // 'SM-G977N',   // 갤럭시S10 5G (1차)
  // 'SM-N971N',   // 갤럭시노트10 5G (1차)
  // 'SM-N976N',   // 갤럭시노트10 플러스 5G (1차),
  // 'SM-F907N',   // 갤럭시폴드 5G
  // 'SM-F700N',   // 갤럭시Z플립? Z 플립 5G?
  'LM-V500N',   // V50 (1차)
  // 'LM-V510N',   // V50S (1차)
  // 'SM-G781N',   // 갤럭시 s20 FE (1차)
  // 'LM-G900N',   // 벨렛(1차) ???
  // 'iPhone12_1',   // 아이폰11  (3차)
  // 'iPhone11_2',   // 아이폰XS  (3차)
  // // iphone 11 pro
  // 'iPhone12_5',   // 아이폰11PRO MAX (3차)
  // 'iPhone11_6',   // 아이폰XS MAX (3차) 
  // 'iPhone11_8',   // 아이폰XR  (3차)
];
export const WIDGET_REMAINS_CODE = {
  DATA_SUM: 'DATA_SUM'
};

