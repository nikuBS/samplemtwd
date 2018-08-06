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
  YYYYMMDD_TYPE_0 = 'YYYY년 MM월 DD일'
}

export enum RESEARCH_EXAMPLE_TYPE {
  ETC = '기타'
}


export enum CURRENCY_UNIT  {
  WON = '원',
  TEN_THOUSAND = '만원'
}

export enum MYT_JOIN_TYPE  {
  PAY = '납부',
  UNPAID = '미청구'
}

export enum USAGE_PATTERN_CHART {
  USED = '사용요금',
  MSG = '문자',
  DATA = '데이터',
  VOICE = '음성통화'
}
