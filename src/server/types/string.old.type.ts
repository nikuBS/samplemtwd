export enum DATA_UNIT {
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
  TB = 'TB',
  PB = 'PB'
}

export enum VOICE_UNIT {
  HOURS = '시간',
  MIN = '분',
  SEC = '초'
}

export enum SKIP_NAME {
  UNLIMIT = '무제한',
  DEFAULT = '기본제공량',
  EXCEED = 'LT' // 초과
}

export const USER_CNT = ['한 분', '두 분', '세 분', '네 분', '다섯 분'];

export enum MSG_STR {
  TEST = '안녕하세요',
  CUSTOMER_CENTER_TEL = '1599-0011',
  CUSTOMER_CENTER_MOBILE = '114'
}

export enum MYT_VIEW {
  ERROR = 'error/myt.usage.error.html'
}

// 요금 안내서 설정 > 안내서 유형(복합은 컨트롤러에서 만들고 단수만 표현한다)
export const MYT_FARE_BILL_TYPE = {
  'P' : 'T world 확인',
  'H' : 'Bill Letter', // 무선 case
  'J' : 'Bill Letter', // 유선 case
  'B' : '문자',
  '2' : '이메일',
  '1' : '기타(우편)',
  'X' : '선택안함'
};

export const MYT_REISSUE_TYPE = {
  'H': 'Bill Letter',
  'B': '문자',
  '2': '이메일',
  '1': '기타(우편 요금)',
  'I': 'Bill Letter+이메일', // 무선
  'K': 'Bill Letter+이메일', // 유선
  'A': '문자+이메일', // 유선
  'J': 'Bill Letter' // 유선
};

export const MYT_REISSUE_REQ_CODE = {
  '01': '기타',
  '02': '이메일',
  '03': '문자',
  '05': 'Bill Letter'
};

export const MYT_REISSUE_REQ_LOCAL_CODE = {
  'post': '기타',
  '02': '이메일',
  '10': '문자',
  '05': 'Bill Letter'
};

export const MYT_GUIDE_CHANGE_INIT_INFO = {
  // 요금 안내서 설명
  billTypeDesc: {
    'P': 'T world 홈페이지 또는 모바일 T world 에서 요금안내서를 <BR/> 확인할 수 있습니다.', //  T world 확인
    'H': '스마트폰의 Bill Letter 앱으로 요금안내서를 받으실 수 있습니다.', // Bill Letter
    'J': '스마트폰의 Bill Letter 앱으로 요금안내서를 받으실 수 있습니다.', // Bill Letter
    'B': '휴대폰 MMS를 통해 요금안내서를 받으실 <BR/> 수 있습니다.', // 문자요금 안내서
    '2': '설정하신 이메일로 요금안내서를 받으실 수 있습니다.', // 이메일
    'I': '스마트폰의 Bill Letter 앱과 설정하신 이메일로 요금안내서를 받으실 수 있습니다.', // Bill Letter + 이메일
    'K': '스마트폰의 Bill Letter 앱과 설정하신 이메일로 요금안내서를 받으실 수 있습니다.', // Bill Letter + 이메일
    'A': '휴대폰 MMS와 설정하신 이메일로 요금안내서를 받으실 수 있습니다.', // 문자 + 이메일
    'Q': '스마트폰의 Bill Letter 앱과 휴대폰 MMS를 통해 요금안내서를 받으실 수 있습니다.', // Bill Letter + 문자
    '1': '설정하신 기타(우편) 주소로 요금안내서를 받으실 수 있습니다.' // 우편
  },
  // 플리킹 리스트
  billTypeList: [
    {
      'billType': 'P',
      'value': 'T world <BR/>확인',
      'desc': '언제 어디서나 PC와 모바일로 요금을 확인할 수 있는 요금안내서',
      'chgBtnNm': '"T world 확인"으로 변경하기'
    },
    {
      'billType': 'H',
      'value': 'Bill Letter',
      'desc': '이번 달과 저번 달을 비교해서 알려주는 맞춤형 요금안내서 Bill Letter App',
      'chgBtnNm': '"Bill Letter"로 변경하기'
    },
    {
      'billType': 'B',
      'value': '문자요금 안내서',
      'desc': '로그인이나 인증없이 휴대폰 MMS로 요금을 확인할 수 있는 서비스',
      'chgBtnNm': '"문자"로 변경하기'
    },
    {
      'billType': '2',
      'value': '이메일',
      'desc': '설정한 이메일로 편리하게 안내서를 받아 보는 서비스',
      'chgBtnNm': '"이메일"로 변경하기'
    },
    {
      'billType': 'I',
      'value': 'Bill Letter + 이메일',
      'desc': '스마트폰의 Bill Letter 앱과 설정하신 이메일로 요금안내서를 받으실 수 있습니다.',
      'chgBtnNm': '"Bill Letter + 이메일"로 변경하기'
    },
    {
      'billType': 'A',
      'value': '문자 + 이메일',
      'desc': '휴대폰 MMS 안내서와 이메일 안내서를 모두 받아 보는 서비스',
      'chgBtnNm': '"문자 + 이메일"로 변경하기'
    },
    {
      'billType': 'Q',
      'value': 'Bill Letter + 문자',
      'desc': 'Bill Letter 안내서와 휴대폰 MMS 안내서를 함께 받아 보는 서비스',
      'chgBtnNm': '"Bill Letter + 문자"로 변경하기'
    },
    {
      'billType': '1',
      'value': '기타(우편)',
      'desc': '설정한 주소로 종이 안내서를 받아 보는 서비스',
      'chgBtnNm': '"기타(우편)"로 변경하기'
    }
  ]
};

export const MYT_BILL_HISTORY_STR = {
  PAGE_TITLE: {
    MICRO_DETAIL: '소액결제 내역 상세보기',
    AUTOPAY_BLIND_DETAIL: '자동결제 차단내역 상세보기',
    ILLEGIAL_ACCESS: '잘못된 접근입니다'
  }
};

export enum BILL_GUIDE_TYPE_NAME {
  TWORLD = 'T world 확인',
  BILL_LETTER = 'Bill Letter',
  SMS = '문자',
  EMAIL = '이메일',
  BILL_LETTER_EMAIL = 'Bill letter + 이메일',
  SMS_EMAIL = '문자 + 이메일',
  BILL_LETTER_SMS = 'Bill letter + 문자',
  ETC = '기타(우편)'
}

export enum BILL_GUIDE_SELECTOR_LABEL {
  TWORLD = 'T world 확인 추천!',
  BILL_LETTER = 'Bill Letter',
  SMS = '문자 요금안내서',
  EMAIL = '이메일 요금안내서',
  BILL_LETTER_EMAIL = 'Bill Letter + 이메일 요금안내서',
  SMS_EMAIL = '문자 + 이메일 요금안내서',
  BILL_LETTER_SMS = 'Bill Letter + 문자 요금안내서',
  ETC = '기타(우편) 요금안내서'
}

export enum CUSTOMER_NOTICE_CATEGORY {
  TWORLD = 'T world',
  DIRECTSHOP = '다이렉트샵',
  MEMBERSHIP = '멤버십',
  ROAMING = '로밍'
}

export enum CUSTOMER_PREVENTDAMAGE_GUIDE {
  VIDEO = '동영상으로 보는 피해예방법',
  WEBTOON = '웹툰으로 보는 피해예방법',
  LATEST = '최신 이용자 피해예방 정보'
}

export enum CUSTOMER_SEARCH_OPTIONS {
  SHOP_TYPE_0 = '전체',
  SHOP_TYPE_1 = '지점',
  SHOP_TYPE_2 = '대리점',
  OPTION_PREMIUM = 'T Premium Store',
  OPTION_PICKUP = '바로픽업',
  OPTION_RENTAL = '임대폰',
  OPTION_APPLE = '애플',
  OPTION_SKB = 'SKT 브로드밴드',
  OPTION_OFFICIAL = '공식 인증대리점'
}

export enum SELECT_POINT {
  DEFAULT = '포인트 선택'
}

export enum DATE_FORMAT {
  YYYYMM_TYPE_0 = 'YYYY년 MM월',
  YYYYMM_TYPE_1 = 'YYYY년 M월',
  YYYYMMDD_TYPE_0 = 'YYYY년 MM월 DD일',
  YYYYMMDDHHMM_TYPE_0 = 'YYYY.MM.DD HH:MM',
  YYYYMMDDHHMM_TYPE_1 = 'YYYY-MM-DD HH:MM',
  YYYYMMDDHHMMSS_TYPE_0 = 'YYYY.MM.DD HH:MM:SS'
}

export enum RESEARCH_EXAMPLE_TYPE {
  ETC = '기타'
}

export enum CURRENCY_UNIT {
  WON = '원',
  TEN_THOUSAND = '만원'
}

export enum MYT_JOIN_TYPE {
  PAY = '납부',
  UNPAID = '미청구'
}

export enum USAGE_PATTERN_CHART {
  USED = '사용요금',
  MSG = '문자',
  DATA = '데이터',
  VOICE = '음성통화'
}

export const USAGE_PATTERN_NAME = ['데이터', '음성통화', '문자'];

export const MYT_JOIN_CONTRACT_TERMINAL = { // 약정할인 및 단말분할상환정보
  FEE_TYPE_A: {
    TIT_NM: '요금약정할인24 (730일)'
  },
  FEE_TYPE_B: {
    TIT_NM: '테블릿 약정할인 12'
  },
  FEE_TYPE_C: {
    TIT_NM: '테블릿 약정'
  },
  FEE_NOTYPE: {
    TIT_NM: 'wibro 약정'
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
    TITNM: '가입 / 약정 위약금2(NEW)',
    AGREE_NM: '약정 위약금2(NEW)'
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

export const MYT_JOIN = {
  OPENING_DATE_STR: '2007.03.01 이후 신규 가입자에 한하여 확인가능 합니다.'
};

export enum MYT_USAGE_TROAMING_SHARE {
  L_REP = '대표회선',
  L_CHI = '자회선'
}

export const MYT_BENEFIT_RECOMMEND = {
  TPAY: {
    title: 'T 페이',
    typeTextA: 'T멤버십 제휴처 할인 혜택을 받고 있습니다.',
    typeTextB: 'T멤버십 제휴처 할인과 결제까지 손쉽게 이용하세요.'
  },
  REFILL: {
    title: '데이터/음성 리필하기',
    typeTextA: 'SKT 가입기간에 따른 데이터 쿠폰 제공 혜택을 받고 있습니다.',
    typeTextB: 'SKT 가입기간에 따라 데이터 쿠폰을 제공해 드립니다.'
  },
  GIFT: {
    title: 'T끼리 데이터 선물하기',
    typeTextA: '데이터를 선물하고 선물 받을 수 있습니다.',
    typeTextB: 'LTE / 3G 요금제 고객끼리 데이터를 선물하고 선물 받으세요.'
  },
  POINT: {
    title: 'T나는 쇼핑 포인트',
    typeTextA: '약정할인액의 130%를 11번가 포인트로 제공 받고 있습니다.',
    typeTextB: '약정할인액의 130%를 11번가 포인트로 적립 받으세요.'
  },
  PLAN: {
    title: '지켜줘서 고마워_현역플랜',
    typeTextA: '현역 국인을 위한 특화 요금제를 이용 중 입니다.',
    typeTextB: '제공안함'
  },
  OKSP: {
    title: 'oksusu 안심팩',
    typeTextA: 'oksusu 이용 데이터 및 oksusu 포인트 제공 혜택을 받고 있습니다.',
    typeTextB: '제공안함'
  },
  OKASP: {
    title: 'oksusu & 안심팩',
    typeTextA: 'oksusu 이용 데이터 및 oksusu 포인트 제공 혜택을 받고 있습니다.',
    typeTextB: 'oksusu 전용 데이터 및 포인트 제공 혜택을 받으세요.'
  },
  TSIGN: {
    title: 'T 시그니처',
    typeTextA: '통신, 단말, 안심 3대 영역의 프리미엄 혜택을 받고 있습니다.',
    typeTextB: '통신, 단말, 안심 3대 영역의 프리미엄 혜택을 받으세요.'
  }
};

export const MYT_FEEPLAN_BENEFIT = {
  PEN_Y: '위약금 대상',
  PEN_N: '위약금 비대상',
  ENDLESS: '서비스 해지시 종료'
};

export const MYT_COMBINATION_TYPE = {
  MULTI_ONE: '1~4',
  MULTI_TWO: '2~4',
  LINE: '휴대폰',
  INTERNET: '인터넷',
  IPTV: 'IPTV',
  TEL: '전화',
  ITEL: '인터넷 전화',
  FAMILY: 'T끼리 온가족 할인'
};

export const MYT_COMBINATION_FAMILY = '패밀리';

export const MYT_BENEFIT_RAINBOW_POINT = {
  TITLE: {
    ADJUSTMENT: '포인트 합산',
    TRANSFER: '대리인 간 양도',
  },
  REL_NM: {
    C: '청소년',
    P: '법정대리인'
  }
};

export const CUSTOMER_SERVICEINFO_TYPE = {
  3280: 'A', 3308: 'A', 3306: 'A', 231: 'A', 3319: 'A', 212: 'A', 220: 'A', 217: 'A', 3720: 'A', 3721: 'A', 3723: 'A', 3724: 'A',
  3315: 'A-1', 3316: 'A-1', 3321: 'A-1', 3727: 'A-1', 3722: 'A-1',
  218: 'A-2',
  'USIM 잠금해제': 'B', '내 USIM으로 SKT 단말기 사용': 'B', '내 USIM으로 타사 단말기 사용': 'B',
  222: 'B', 215: 'B', 3305: 'B', 3304: 'B', 3307: 'B', 3320: 'B-1',
  224: 'C', 221: 'C', 223: 'C', 216: 'C', 3719: 'C', '보이는 ARS': 'C', '음성인식 ARS': 'C',
  'band LTE': 'C-1', '버튼식 ARS': 'C-2',
  '타사 USIM으로 SKT 단말기 사용': 'D', '목소리 인증': 'D',
  234: 'E', 219: 'E', '목소리 등록 문자받기': 'E'
};

export const CUSTOMER_SERVICEINFO_CATEGORY = [
  {
    title: '휴대폰 가입/변경에 대한 안내',
    subDepth: [
      {title: '휴대폰 가입', subDepth: [
        {title: '휴대폰 가입', serviceId: 3280}, {title: '단말기 자급제도', serviceId: 3305},
        {title: '번호이동', serviceId: 3304}, {title: '번호 관리 제도', serviceId: 3308}
      ]},
      {title: '미성년자 가입', subDepth: [{title: '미성년자 가입', serviceId: 3306}, {title: '미성년자 보호 서비스', serviceId: 3307}]},
      {title: 'USIM 변경', subDepth: [
        {title: 'USIM잠금해제', serviceId: ''}, {title: '내 USIM으로 SKT 단말기 사용', serviceId: ''},
        {title: '내 USIM으로 타사 단말기 사용', serviceId: ''}, {title: '타사 USIM으로 SKT 단말기 사용', serviceId: ''}
      ]}
    ]
  },
  {
    title: '휴대폰 요금기준에 대한 안내',
    subDepth: [
      {title: '요금 기준', serviceId: 3315},
      {title: 'LTE 데이터 요금', serviceId: 3316},
      {title: 'band LTE', serviceId: ''},
      {title: '데이터 요금', subDepth: [{title: '데이터 요금 안내', serviceId: 231}, {title: '테이터 이용 유의사항', serviceId: 3319}]},
      {title: '부가세 포함', serviceId: 3320},
      {title: '영상통화 요금', serviceId: 3321}
    ]
  },
  {
    title: '다이렉트샵 이용안내',
    subDepth: [
      {title: '할인/혜택', subDepth: [
        {title: '요금약정할인', serviceId: 212},
        {title: '결합할인', serviceId: 222},
        {title: '다이렉트샵 혜택', serviceId: 224}
      ]},
      {title: '구매', subDepth: [
        {title: '구매 전 꿀팁', serviceId: 234},
        {title: '다이렉트샵 구매가이드', serviceId: 219},
        {title: '가입유형', serviceId: 220},
        {title: '휴대폰 분할 상환 수수료', serviceId: 221},
        {title: '구매 유의사항', serviceId: 223}

      ]},
      {title: '배송/개통', subDepth: [
        {title: '배송방법', serviceId: 216},
        {title: '개통방법', serviceId: 217},
        {title: '반품교환', serviceId: 218}
      ]}
    ],
  },
  {
    title: '멤버십/로밍에 대한 안내',
    subDepth: [
      {title: '멤버십 이용안내', subDepth: [
        {title: '멤버십 이용', serviceId: 3719},
        {title: '초콜릿 이용', serviceId: 3720},
        {title: '모바일 T 멤버십', serviceId: 3721}
      ]},
      {title: '로밍 이용안내', serviceId: 3727}
    ]
  },
  {
    title: '서비스 정책/제도에 대한 안내',
    subDepth: [
      {title: '데이터 리필하기', serviceId: 3722},
      {title: 'T끼리 데이터 선물하기', subDepth: [
        {title: 'T끼리 데이터 선물하기', serviceId: 3723},
        {title: 'T끼리 자동선물 신청', serviceId: 3724}
      ]},
      {title: 'T 기본약정 요금정책', serviceId: 215}
    ]
  },
  {
    title: '목소리인증/ARS상담에 대한 안내',
    subDepth: [
      {title: 'ARS상담 이용안내', subDepth: [
        {title: '버튼식 ARS', serviceId: ''},
        {title: '보이는 ARS', serviceId: ''},
        {title: '음성인식 ARS', serviceId: ''}
      ]},
      {title: '목소리인증 이용안내', subDepth: [
        {title: '목소리 인증', serviceId: ''},
        {title: '목소리 등록 문자받기', serviceId: ''}
      ]}
    ]
  },
  {
    title: '주요 용어',
    subDepth: [
      {title: 'USIM 관련 용어', serviceId: ''},
      {title: '기변(기기변경) 관련 용어', serviceId: ''},
      {title: '단말기 관련 용어', serviceId: ''},
      {title: '서비스 관련 기타 용어', serviceId: ''}
    ]
  }
];

export const CUSTOMER_SITEINFO_TYPE = [3324, 3326, 3327, 213, 3328, 3329, 3330];
