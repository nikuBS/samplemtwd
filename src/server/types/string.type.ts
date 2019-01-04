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
  M: '무제한'
};

// 요금 안내서 설정 > 안내서 유형(복합은 컨트롤러에서 만들고 단수만 표현한다)
export const MYT_FARE_BILL_TYPE = {
  P: 'T월드 확인',
  H: 'Bill Letter', // 무선 case
  J: 'Bill Letter', // 유선 case
  B: '문자',
  '2': '이메일',
  '1': '기타(우편)',
  X: '선택 안 함',
  NO: '받지 않음',
  YES: '받음'
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

export const MYT_DATA_USAGE_CANCEL_TSHARE = {
  TITLE: 'T데이터 셰어링 USIM 해지'
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
  PHONE_TYPE_1: '휴대폰'
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
  TING_CHARGE = '팅 쿠키즈 안심요금',
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
  A10 = '장기가입 리필쿠폰',
  A14 = '10년주기 리필쿠폰',
  A20 = '선물받은 리필쿠폰'
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
  title = '가입 상담 예약',
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

export enum PRODUCT_REQUIRE_DOCUMENT_TYPE_NM {
  apply = '구비서류 제출/조회',
  history = '가입신청 내역 조회'
}

export const MYT_FARE_BILL_REISSUE = {
  TITLE: '요금안내서 재발행',
  REASON: {
    '06': '요금안내서부달'
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
  K: 'Bill Letter+이메일'
};

export const MYT_INFO_DISCOUNT_MONTH = {
  TITLE: '월별 상세 할인 내역'
};

export const MYT_FARE_PAYMENT_HISTORY_TYPE = {
  all: '전체',
  direct: '즉시납부',
  auto: '자동납부',
  autoAll: '자동 납부 통합 인출',
  microPrepay: '소액 선결제',
  contentPrepay: '콘텐츠 선결제',
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
  DI: '납부 상세내역',
  TPOINT: 'T포인트 납부 상세내역',
  OCB: 'OK캐쉬백 납부 상세 내역',
  BANK: '계좌이체 납부 상세 내역',
  CARD: '신용카드 납부 상세 내역',
  AT: '자동납부 상세 내역',
  AU: '자동납부 상세 내역',
  MP: '소액 결제 선결제 상세 내역',
  CP: '콘텐츠 이용료 선결제 상세 내역'
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
  REGISTER: '신청완료',
  CHANGE: '변경완료',
  CHANGE_HISTORY: '변경내역 보기',
  NUMBER: '번호로',
  SMS: 'SMS 전송 완료',
  SMS_DESCRIPTION: '전송된 입금전용계좌로 입금하시면\n즉시 수납이 반영됩니다.'
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
  S2: 'IPTV',
  S3: '집전화',
  O1: '포인트캠'
};

export const MYT_JOIN_WIRE = {
  TITLE: '신청내역',
  AS: { TITLE: '장애 A/S신청 현황' },
  AS_DETAIL: { TITLE: '장애 A/S 상세 내역' },
  DISC_REFUND: { TITLE: '할인 반환금 조회' },
  FREECALL_CHECK: { TITLE: 'B끼리 무료 통화 대상자 조회' },
  GIFTS: { TITLE: '사은품 조회' },
  HISTORY: { TITLE: '신청 현황' },
  HISTORY_DETAIL: { TITLE: '신청 현황 상세' },
  MODIFY_ADDRESS: { TITLE: '설치 장소 변경' },
  MODIFY_PERIOD: { TITLE: '약정 기간 변경' },
  MODIFY_PRODUCT: { TITLE: '상품 변경' },
  NETPHONE_CHANGE: { TITLE: '신청내역' },
  SET_WIRE_CANCEL: { TITLE: '할인 반환금 정보' }
};

export const MYT_JOIN_WIRE_GUIDE_CHANGE_OWNERSHIP = {
  TITLE: '명의 변경 신청 방법 안내'
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
  internet: '인터넷',
  phone: '전화',
  tv: 'TV'
};

export enum DEFAULT_SELECT {
  SELECT = '선택'
}

export const BRANCH_SEARCH_OPTIONS = {
  0: '전체',
  1: '지점',
  2: '대리점',
  premium: 'T Premium  Store',
  direct: '바로픽업',
  rent: '임대폰',
  skb: 'SK브로드밴드',
  apple: '애플취급점',
  authAgnYn: '공식인증대리점',
  etc: ' 외 ',
  count: '건'
};

export const PRODUCT_TYPE_NM = {
  CALLPLAN: '상품 상세 정보',
  JOIN: '가입',
  CHANGE: '변경',
  TERMINATE: '해지',
  SETTING: '설정',
  LOOKUP: {
    TPLAN: '혜택이용내역'
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

export const FEE_PLAN_TIP_TXT = {
  MS_05_tip_01: '요금제 안내',
  MS_05_tip_02: '선불 휴대폰 요금제 변경',
  MS_05_tip_03: 'SK텔레콤을 통해 가입한 상품',
  MS_05_tip_04: '요금제 변경',
  MS_05_tip_05: '2009년 11월 2일 이후 신규가입 중단',
  MS_05_tip_06: '2009년 11월 2일 이후 신규가입 중단',
  MS_05_tip_07: '2009년 11월 2일 이후 신규가입 중단'
};

export const MAIN_MENU_REFUND_STATE = {
  ORIGIN_MSG_ING: '송금중',
  ORIGIN_MSG_COMPLETE: '송금완료',
  ORIGIN_MSG_ERROR: '송금오류',
  APPLY: '신청',
  COMPLTE: '완료',
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
  }
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
  page006: '스팸 메시지 대응 방법',
  page007: '로그인 제한 제도',
  page008: '휴면 고객 제도',
  page009: 'Tworld 비밀번호 관리',
  page010: '개인정보 유효기간',
  page011: '가려진 정보보기(마스킹)',
  page012: '꼭 지켜야 할 정보보호 실천수칙 10가지',
  page013: '명의도용 피해예방법',
  page014: '결합상품 피해예방법',
  page015: '소액결제 피해예방법',
  page016: '해외 로밍 피해예방법',
  page017: 'SNS 개인정보 보호 꿀팁! (2단계 인증설정)',
  page018: 'SNS 개인정보 보호 꿀팁! (사진 속 개인정보 확인)'
};

export const ROAMING_RECEIVE_CENTER = {
  '0': '인천공항 1터미널 3층 로밍 센터(E-F 카운터)',
  '1': '인천공항 2터미널 3층 로밍 센터(D-E 카운터)',
  '2': '인천공항 1터미널 3층 로밍 센터(G-H 카운터)',
  '3': '김포공항 1층 로밍 센터',
  '4': '제주공항 국제선 1층 로밍 센터',
  '5': '김해공항 3층 로밍 센터',
  '6': '대구공항 2층 로밍 센터',
  '7': '대구 SKT 황금점 매장'
};

export const NODE_API_ERROR = {
  '1001': '로그인이 필요합니다.',
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

export const CUSTOMER_SERVICE_OPTION_TYPE = [
  {
    title: '휴대폰 가입·변경에 대한 안내',
    sub_list: [
      {
        sub_title: '휴대폰 가입',
        sub_text: '가입·번호이동·기기 안내를 원한다면',
        dep_list: [
          {
            dep_title: '휴대폰 가입',
            type: 'A1',
            code: 'C00014'
          },
          {
            dep_title: '기기 자급제도',
            type: 'A1',
            code: '3305'
          },
          {
            dep_title: '번호 이동',
            type: 'A1',
            code: '3304'
          },
          {
            dep_title: '번호관리제도',
            type: 'A1',
            code: '3308'
          }
        ]
      },
      {
        sub_title: '미성년자 가입',
        sub_text: '가입방법·부모동의 절차가 궁금하다면',
        dep_list: [
          {
            dep_title: '미성년자 가입',
            type: 'A1',
            code: '3306'
          },
          {
            dep_title: '미성년자 보호 서비스',
            type: 'A1',
            code: '3307'
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
            code: '-'
          },
          {
            dep_title: '내 유심으로 SK텔레콤 기기 사용',
            type: 'A1',
            code: '-'
          },
          {
            dep_title: '내 유심으로 타사 기기 사용',
            type: 'A1',
            code: '-'
          },
          {
            dep_title: '타사 유심으로 SK텔레콤 기기 사용',
            type: 'A2',
            code: '-'
          }
        ]
      }
    ]
  },
  {
    title: '휴대폰 요금 기준에 대한 안내',
    sub_list: [
      {
        sub_title: '요금 기준',
        sub_text: '일반∙스마트폰 요금 기준이 궁금하다면',
        type: 'B1',
        code: '3315'
      },
      {
        sub_title: 'LTE데이터 사용요금',
        sub_text: 'LTE 요금 기준이 궁금하다면',
        type: 'B1',
        code: '3316'
      },
      {
        sub_title: 'band LTE',
        sub_text: 'band LTE 요금 기준이 궁금하다면',
        type: 'B2',
        code: '-'
      },
      {
        sub_title: '데이터 사용요금',
        sub_text: '데이터 사용요금 부과 기준이 궁금하다면',
        dep_list: [
          {
            dep_title: '데이터 사용요금 안내',
            type: 'A1',
            code: '231'
          },
          {
            dep_title: '데이터 사용 유의사항',
            type: 'A1',
            code: '3319'
          }
        ]
      },
      {
        sub_title: '부가세 포함',
        sub_text: '부가세 포함 요금정책이 궁금하다면',
        type: 'B1',
        code: '3320'
      },
      {
        sub_title: '영상통화 요금',
        sub_text: '영상통화 요금정책이 궁금하다면',
        type: 'B1',
        code: '3321'
      },
    ]
  },
  {
    unitedTitle: 'T월드 다이렉트∙T멤버십∙T로밍에 대한 안내',
    united: '_3T',
    title: 'T월드 다이렉트 이용안내',
    text: '',
    upperCat: true, 
    sub_list: [
      {
        sub_title: '할인∙혜택',
        sub_text: '',
        dep_list: [
          {
            dep_title: '요금약정할인',
            type: 'A1',
            code: '212'
          },
          {
            dep_title: '결합할인',
            type: 'A1',
            code: '222'
          },
          {
            dep_title: 'T월드 다이렉트 혜택',
            type: 'A2',
            code: '224'
          }
        ]
      },
      {
        sub_title: '구매',
        sub_text: '',
        dep_list: [
          {
            dep_title: '구매 전 꿀팁',
            type: 'A2',
            code: '224'
          },
          {
            dep_title: '다이렉트샵구매가이드',
            type: 'A2',
            code: '219'
          },
          {
            dep_title: '가입유형',
            type: 'A1',
            code: '220'
          },
          {
            dep_title: '휴대폰분할상환수수료',
            type: 'A2',
            code: '221'
          },
          {
            dep_title: '구매유의사항',
            type: 'A2',
            code: '223'
          }
        ]
      },
      {
        sub_title: '배송∙개통',
        sub_text: '',
        dep_list: [
          {
            dep_title: '배송방법',
            type: 'A2',
            code: '216'
          },
          {
            dep_title: '개통방법',
            type: 'A1',
            code: '217'
          },
          {
            dep_title: '반품교환',
            type: 'A1',
            code: '218'
          }
        ]
      },
      
    ]
  },
  {
    unitedTitle: 'T월드 다이렉트∙T멤버십∙T로밍에 대한 안내',
    united: '_3T',
    title: 'T멤버십∙T로밍에 대한 안내',
    text: '',
    upperCat: false, 
    sub_list: [
      {
        sub_title: 'T멤버십 이용안내',
        sub_text: '',
        dep_list: [
          {
            dep_title: 'T멤버십 이용',
            type: 'A2',
            code: '3719'
          },
          {
            dep_title: '초콜릿 이용',
            type: 'A1',
            code: '3720'
          },
          {
            dep_title: '모바일 T멤버십',
            type: 'A2',
            code: '3721'
          }
        ]
      },
      {
        sub_title: 'T로밍 이용안내',
        sub_text: '',
        type: 'B1',
        code: '3727'
      }
    ]
  },
  {
    title: '서비스 정책∙제도에 대한 안내',
    sub_list: [
      { 
        sub_title: '데이터 리필하기',
        sub_text: '',
        type: 'B1',
        code: '3722'
      },
      { 
        sub_title: 'T끼리 데이터 선물하기',
        sub_text: '',
        dep_list: [
          {
            dep_title: 'T끼리 데이터 선물하기',
            type: 'A1',
            code: '3723'
          },
          {
            dep_title: 'T끼리 자동선물 신청',
            type: 'A1',
            code: '3724'
          }
        ]
      },
      { 
        sub_title: 'T 기본약정 요금정책',
        sub_text: '',
        type: 'B1',
        code: '215'
      }
    ]
  },
  {
    title: '목소리 인증∙ARS상담에 대한 안내',
    sub_list: [
      { 
        sub_title: 'ARS상담 이용안내',
        sub_text: '',
        dep_list: [
          {
            dep_title: '버튼식 ARS',
            type: 'A3',
            code: ''
          },
          {
            dep_title: '보이는 ARS',
            type: 'A2',
            code: ''
          },
          {
            dep_title: '음성인식 ARS',
            type: 'A2',
            code: ''
          }
        ]
      },
      { 
        sub_title: '목소리 인증 이용안내',
        sub_text: '',
        dep_list: [
          {
            dep_title: '목소리 인증',
            type: 'A2',
            code: ''
          },
          {
            dep_title: '목소리 등록 문자받기',
            type: 'A2',
            code: ''
          }
        ]
      }
    ]
  }
];
