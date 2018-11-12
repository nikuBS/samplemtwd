Tw.POPUP_TPL = {
  CHANGE_NICKNAME:
  '<div class="cont-box"><div class="inputbox"><div class="input">' +
  '<input id="nickname" maxlength= "7" type="text" placeholder="7글자 이내로 입력해 주세요." title="input"' +
  'aria-labelledby="from-label3-1" aria-describedby="from-label3-2"></div><div class="guide-byte">' +
  '<span id="from-label3-2" class="guide-txt">특수문자, 2자리 이상의 숫자는 입력하실 수 없습니다.</span>' +
  '<span class="byte"><span class="byte-current">0</span> / <span class="byte-total">7</span>자</span></div></div></div>',
  HISTORY_OVER_PAY_POPUP:
  '<div class="widget pop-btm-area">' +
  '<div class="widget-box check"><ul class="select-list" role="group">' +
  '<li class="checkbox type01" role="checkbox" aria-checked="false">' +
  '<input type="checkbox" name="checkbox" title="하루동안 보지 않기"> 하루동안 보지 않기</li></ul></div></div>',
  CUSTOMER_SERVICE_INFO_CHOICE: [
    {
      title: '휴대폰 가입',
      options: [
        { title: '', checked: false, value: '3280', text: '휴대폰 가입' },
        { title: '', checked: false, value: '3305', text: '단말기 자급제도' },
        { title: '', checked: false, value: '3304', text: '번호이동' },
        { title: '', checked: false, value: '3308', text: '번호 관리 제도' }]
    },
    {
      title: '미성년자 가입',
      options: [
        { title: '', checked: false, value: '3306', text: '미성년자 가입' },
        { title: '', checked: false, value: '3307', text: '미성년자 보호 서비스' }]
    },
    {
      title: 'USIM 변경',
      options: [
        { title: '', checked: false, value: '', text: 'USIM 잠금헤제' },
        { title: '', checked: false, value: '', text: '내 USIM으로 SKT단말기 사용' },
        { title: '', checked: false, value: '', text: '내 USIM으로 타사 단말기 사용' },
        { title: '', checked: false, value: '', text: '타사 USIM으로 SKT단말기 사용' }]
    },
    {
      title: '데이터 요금',
      options: [
        { title: '', checked: false, value: '231', text: '데이터 요금 안내' },
        { title: '', checked: false, value: '3319', text: '데이터 이용 유의사항' }]
    },
    {
      title: '다이렉트샵 이용안내',
      options: [
        { title: '', checked: false, value: '', text: '할인/혜택' },
        { title: '', checked: false, value: '', text: '구매' },
        { title: '', checked: false, value: '', text: '배송/개통' }]
    },
    {
      title: '멤버십 이용안내',
      options: [
        { title: '', checked: false, value: '3719', text: '멤버십 이용' },
        { title: '', checked: false, value: '3720', text: '초콜릿 이용' },
        { title: '', checked: false, value: '3721', text: '모바일 T 멤버십' }]
    },
    {
      title: 'T끼리 데이터 선물하기',
      options: [
        { title: '', checked: false, value: '3723', text: 'T끼리 데이터 선물하기' },
        { title: '', checked: false, value: '3724', text: 'T끼리 자동선물 신청' }]
    },
    {
      title: 'ARS상담 이용안내',
      options: [
        { title: '', checked: false, value: '', text: '버튼식 ARS' },
        { title: '', checked: false, value: '', text: '보이는 ARS' },
        { title: '', checked: false, value: '', text: '음성인식 ARS' }]
    },
    {
      title: '목소리인증 이용안내',
      options: [
        { title: '', checked: false, value: '', text: '목소리 인증' },
        { title: '', checked: false, value: '', text: '목소리 등록 문자받기' }]
    }
  ],
  CUSTOMER_SITE_INFO_TYPEA_CHOICE: [{
    title: '가려진 정보',
    options: [
      { title: '고객님의 정보를 가리는 이유', check: false, value: 'A', text: '고객님의 정보를 가리는 이유' },
      { title: '가려진 정보를 보는 방법', check: false, value: 'B', text: '가려진 정보를 보는 방법' }
    ]
  }],
  FARE_PAYMENT_LAYER_DATA: [
    {
      'list': [
        { 'value': '자동납부', 'option': 'fe-auto', 'text2': '신청' }
      ]
    },
    {
      'type': '요금 납부',
      'list': [
        { 'value': '계좌이체 납부', 'option': 'fe-account' },
        { 'value': '체크/신용카드 납부', 'option': 'fe-card' },
        { 'value': 'OK캐쉬백/T포인트 납부', 'option': 'fe-point' }
      ]
    },
    {
      'list': [
        {
          'value': '입금전용계좌 SMS 신청', 'option': 'fe-sms',
          'explain': '입금전용계좌 정보를 SMS로 전송합니다.' + '<br/>' +
          '자동납부 인출 중이 아닌 경우에만 이용 가능합니다.'
        }
      ]
    },
    {
      'type': '포인트 요금 납부',
      'list': [
        { 'value': 'OK캐쉬백', 'option': 'fe-ok-cashbag' },
        { 'value': 'T포인트', 'option': 'fe-t-point' },
        { 'value': '레인보우 포인트', 'option': 'fe-rainbow-point' }
      ]
    }
  ],
  IMMEDIATELY_CHARGE_DATA: {
    TITLE: '충전방법 선택',
    REFILL: {
      TYPE: '나의 보유 쿠폰 사용',
      VALUE: '나의 리필 쿠폰',
      UNIT: '장'
    },
    PREPAY: {
      'type': '선불 쿠폰 구매/충전',
      'list': [
        { 'option': 'data_coupon', 'value': 'T 데이터 쿠폰' },
        { 'option': 't_coupon', 'value': 'T 쿠폰' },
        { 'option': 'jeju_coupon', 'value': '제주도 프리 쿠폰' }
      ]
    },
    CHARGE: {
      TYPE: '요금 충전',
      VALUE: {
        LIMIT: '데이터 한도 요금제',
        ETC: '팅 쿠키즈 안심 음성 요금',
        TING: '팅요금제 충전 선물'
      }
    }
  },
  FARE_PAYMENT_CARD_TYPE_LIST: [
    {
      'list': [
        { 'option': 'hbs-card-type', 'attr': 'id="00"', value: '일시불' },
        { 'option': 'hbs-card-type', 'attr': 'id="01"', value: '1개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="02"', value: '2개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="03"', value: '3개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="04"', value: '4개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="05"', value: '5개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="06"', value: '6개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="07"', value: '7개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="08"', value: '8개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="09"', value: '9개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="10"', value: '10개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="11"', value: '11개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="12"', value: '12개월 할부' },
        { 'option': 'hbs-card-type', 'attr': 'id="24"', value: '24개월 할부' }
      ]
    }
  ],
  FARE_PAYMENT_POINT_LIST: [
    {
      'list': [
        { 'option': 'point-type', 'attr': 'id="10" data-code="CPT"', value: 'OK캐쉬백' },
        { 'option': 'point-type', 'attr': 'id="11" data-code="TPT"', value: 'T포인트' }
      ]
    }
  ],
  FARE_PAYMENT_POINT: [
    {
      'list': [
        { 'option': 'point-type', 'attr': 'id="500"', value: '500P' },
        { 'option': 'point-type', 'attr': 'id="1000"', value: '1,000P' },
        { 'option': 'point-type', 'attr': 'id="1500"', value: '1,500P' },
        { 'option': 'point-type', 'attr': 'id="2000"', value: '2,000P' },
        { 'option': 'point-type', 'attr': 'id="2500"', value: '2,500P' },
        { 'option': 'point-type', 'attr': 'id="3000"', value: '3,000P' },
        { 'option': 'point-type', 'attr': 'id="3500"', value: '3,500P' },
        { 'option': 'point-type', 'attr': 'id="4000"', value: '4,000P' },
        { 'option': 'point-type', 'attr': 'id="4500"', value: '4,500P' },
        { 'option': 'point-type', 'attr': 'id="5000"', value: '5,000P' },
        { 'option': 'point-type', 'attr': 'id="5500"', value: '5,500P' },
        { 'option': 'point-type', 'attr': 'id="6000"', value: '6,000P' },
        { 'option': 'point-type', 'attr': 'id="6500"', value: '6,500P' },
        { 'option': 'point-type', 'attr': 'id="7000"', value: '7,000P' },
        { 'option': 'point-type', 'attr': 'id="7500"', value: '7,500P' },
        { 'option': 'point-type', 'attr': 'id="8000"', value: '8,000P' },
        { 'option': 'point-type', 'attr': 'id="8500"', value: '8,500P' },
        { 'option': 'point-type', 'attr': 'id="9000"', value: '9,000P' },
        { 'option': 'point-type', 'attr': 'id="9500"', value: '9,500P' },
        { 'option': 'point-type', 'attr': 'id="10000"', value: '10,000P' }
      ]
    }
  ],
  FARE_PAYMENT_TPOINT: [
    {
      'list': [
        { 'option': 'point-type', 'attr': 'id="10000"', value: '10,000P' },
        { 'option': 'point-type', 'attr': 'id="20000"', value: '20,000P' },
        { 'option': 'point-type', 'attr': 'id="50000"', value: '50,000P' },
        { 'option': 'point-type', 'attr': 'id="100000"', value: '100,000P' }
      ]
    }
  ],
  FARE_PAYMENT_RAINBOW: [
    {
      'list': [
        { 'option': 'point-type', 'attr': 'id="CCBBAE0"', value: '국내 음성 통화료' },
        { 'option': 'point-type', 'attr': 'id="CCRPDDC"', value: '국내 데이터 통화료' },
        { 'option': 'point-type', 'attr': 'id="CCBCOE0"', value: '부가서비스(컬러링)' },
        { 'option': 'point-type', 'attr': 'id="CCPCRBE"', value: '부가서비스(퍼펙트콜)' },
        { 'option': 'point-type', 'attr': 'id="CCPLRBE"', value: '부가서비스(퍼펙트콜 라이트)' },
        { 'option': 'point-type', 'attr': 'id="CCRPGDC"', value: '기본료 및 월정액' },
        { 'option': 'point-type', 'attr': 'id="CCRMRBE"', value: '로밍사용요금' }
      ]
    }
  ],
  FARE_PAYMENT_MICRO_HISTORY_LIST: [
    {
      'list': [
        { 'option': 'go-history', 'attr': 'data-link="/myt/fare/billsmall/history"', value: '소액결제 이용내역' },
        { 'option': 'go-history', 'attr': 'data-link="/myt/fare/billsmall/block"', value: '자동결제 차단내역' }
      ]
    }
  ],
  FARE_PAYMENT_BANK_DATE: [
    {
      'list': [
        { 'option': 'date', 'attr': 'id="0"', value: '15일' },
        { 'option': 'date', 'attr': 'id="3"', value: '21일' },
        { 'option': 'date', 'attr': 'id="1"', value: '23일' }
      ]
    }
  ],
  FARE_PAYMENT_CARD_DATE: [
    {
      'list': [
        { 'option': 'date', 'attr': 'id="1"', value: '11일' },
        { 'option': 'date', 'attr': 'id="2"', value: '18일' },
        { 'option': 'date', 'attr': 'id="3"', value: '26일' }
      ]
    }
  ],
  JOIN_INFO_NO_AGREEMENT: {
    title: '포인트 사용 유형',
    data: [
      {
        'list': [
          { 'option': 'condition', 'attr': 'id="0"', value: '전체' },
          { 'option': 'condition', 'attr': 'id="1"', value: '포인트 사용' },
          { 'option': 'condition', 'attr': 'id="2"', value: '포인트 적립' },
          { 'option': 'condition', 'attr': 'id="3"', value: '포인트 소멸' }
        ]
      }
    ]
  },
  JOIN_INFO_MGMT_PERIOD: {
    title: '기간선택',
    data: [
      {
        'list': [
          { 'option': 'condition', 'attr': 'data-prd="1"', value: '1개월' },
          { 'option': 'condition', 'attr': 'data-prd="2"', value: '2개월' },
          { 'option': 'condition', 'attr': 'data-prd="3"', value: '3개월' },
          { 'option': 'condition', 'attr': 'data-prd="4"', value: '4개월' },
          { 'option': 'condition', 'attr': 'data-prd="5"', value: '5개월' },
          { 'option': 'condition', 'attr': 'data-prd="6"', value: '6개월' },
          { 'option': 'condition', 'attr': 'data-prd="7"', value: '7개월' },
          { 'option': 'condition', 'attr': 'data-prd="8"', value: '8개월' },
          { 'option': 'condition', 'attr': 'data-prd="9"', value: '9개월' },
          { 'option': 'condition', 'attr': 'data-prd="10"', value: '10개월' },
          { 'option': 'condition', 'attr': 'data-prd="11"', value: '11개월' },
          { 'option': 'condition', 'attr': 'data-prd="12"', value: '12개월' }
        ]
      }
    ]
  },
  FARE_PAYMENT_LIMIT: [
    {
      'list': [
        { 'option': 'limit', 'attr': 'id="500000"', value: '50만원' },
        { 'option': 'limit', 'attr': 'id="300000"', value: '30만원' },
        { 'option': 'limit', 'attr': 'id="200000"', value: '20만원' },
        { 'option': 'limit', 'attr': 'id="150000"', value: '15만원' },
        { 'option': 'limit', 'attr': 'id="120000"', value: '12만원' },
        { 'option': 'limit', 'attr': 'id="60000"', value: '6만원' },
        { 'option': 'limit', 'attr': 'id="50000"', value: '5만원' },
        { 'option': 'limit', 'attr': 'id="30000"', value: '3만원' },
        { 'option': 'limit', 'attr': 'id="10000"', value: '1만원' }
      ]
    }
  ],
  PAYMENT_HISTORY_TYPE: [
    {
      list: [
        { value: '전체', option: 'checked' },
        { value: '즉시 납부' },
        { value: '자동 납부' },
        { value: '자동 납부 통합 인출' },
        { value: '소액결제 선결제' },
        { value: '콘텐츠 이용료 선결제' },
        { value: '포인트 납부 예약' },
        { value: '포인트 자동 납부' }
      ]
    }
  ],
  MYT_JOIN_WIRE_MODIFY_PERIOD: [
    {
      list: [
        { value: '무약정', attr: 'id="0"', cnt: 0 },
        { value: '1년', attr: 'id="1"', cnt: 1 },
        { value: '2년', attr: 'id="2"', cnt: 2 },
        { value: '3년', attr: 'id="3"', cnt: 3 }
      ]
    }
  ]
};

Tw.MYT_TPL = {
  DATA_SUBMAIN: {
    SP_TEMP: '<br> ↓ <br>',
    MORE_LINE_TEMP: '<li data-svc-mgmt-num="{{svcMgmtNum}}"' +
    'data-name="{{nickNm}}" data-num="{{svcNum}}"><button>' +
    '<div class="lineinfo-user"><span class="info-title">{{nickNm}}' +
    '{{#if data.child}}' +
    '<span class="badge badge-fam"><span class="blind">자녀회선</span></span>' +
    '{{/if}}' +
    '</span><span class="info-sub">{{svcNum}}</span>' +
    '</div><div class="lineinfo-data">' +
    '<span class="info-title">{{data.data}}' +
    '<span class="unit ml4">{{data.unit}}</span>' +
    '</span><span class="ico"></span></div></button></li>'
  },
  FARE_SUBMAIN: {
    MORE_LINE_TEMP: '<li data-svc-mgmt-num="{{svcMgmtNum}}" data-rep-svc="{{repSvc}}"' +
    'data-name="{{nickNm}}" data-num="{{svcNum}}">' +
    '<button><div class="lineinfo-user d-table"><div class="ico"><i></i></div><div class="cont">' +
    '{{#if combine}}' +
    '{{else}}' + '<span class="ico"></span>' +
    '{{/if}}' +
    '<span class="info-title">{{nickNm}}' +
    '{{#if combine}}' +
    '<span class="badge badge-merge"><span class="blind">통합</span></span>' +
    '{{/if}}' +
    '</span>' +
    '<span class="info-sub">{{svcNum}}</span></div></div><div class="lineinfo-data">' +
    '<span class="info-title">{{amt}} 원</span><span class="ico"></span></div>' +
    '</button></li>'
  },
  JOIN_SUBMAIN: {
    MORE_LINE_TEMP: '<li data-svc-mgmt-num="{{svcMgmtNum}}"' +
    'data-name="{{nickNm}}" data-num="{{svcNum}}"><button>' +
    '<div class="lineinfo-user d-table"><div class="ico2"><i></i></div>' +
    '<div class="cont"><span class="info-title">{{nickNm}}' +
    '</span><span class="info-sub">{{svcNum}}</span></div>' +
    '</div><div class="lineinfo-data"><span class="ico"></span></div></button></li>'
  },
  MORE_BTN: '<div class="bt-more"><button>더보기</button></div>'
};

Tw.MYT_DATA_CHARGE_TYPE_LIST = [
  { value: '전체' },
  { value: 'T끼리 데이터 선물' },
  { value: '데이터 한도 충전' },
  { value: '팅/쿠키즈/안심요금' },
  { value: '팅 요금 선물' },
  { value: '데이터 음성 리필' }
];

Tw.PRODUCT_PLANS_ORDER = [
  { value: '추천순' },
  { value: '높은 가격순' },
  { value: '낮은 가격순' }
];

Tw.PRODUCT_LIST_DEVICE_FILTERS = {
  'F01100': [
    {
      id: 'F01121',
      name: 'LTE',
      icon: 'lte'
    }, {
      id: 'F01122',
      name: '3G',
      icon: '3g'
    }, {
      id: 'F01123',
      name: '일반폰',
      icon: 'feature'
    }, {
      id: 'F01124',
      name: '태블릿/<br>2nd Device',
      icon: 'device'
    }, {
      id: 'F01125',
      name: '선불폰',
      icon: 'prepayment'
    }],
  'F01200': [
    {
      id: 'F01221',
      name: '스마트폰',
      icon: 'lte'
    }, {
      id: 'F01122',
      name: '일반폰',
      icon: 'feature'
    }, {
      id: 'F01123',
      name: '태블릿/<br>2nd Device',
      icon: 'device'
    }
  ]
};

Tw.RESELL_TERMS = {
  title: '재판매 이용약관',
  data: [{
    'list': [
      { 'value': '초고속인터넷 이용약관', 'option': 'fe-action' },
      { 'value': '인터넷전화 이용약관', 'option': 'fe-action' },
      { 'value': '시내전화 이용약관', 'option': 'fe-action' }
    ]
  }]
};

Tw.MYT_FARE_BILL_GUIDE = {
  DETAIL_BTN: {
    CONTENTS: '<span class="bt-detail"><button data-target="detailContentsBtn">자세히 보기</button></span>',
    MICRO: '<span class="bt-detail"><button data-target="detailMicroBtn">자세히 보기</button></span>'
  },
  THIRD_PARTY_TPL: '<span class="badge badge-other"><span class="blind">타사</span></span>'

};

Tw.HELPLINE_TYPES = [{ value: '일반' }, { value: '로밍' }, { value: '통화품질 상담' }];

Tw.CUSTOMER_HELPLINE_AREAS = [
  { value: '수도권 (서울, 경기, 인천, 강원)', attr: 'data-area-code="1"' },
  { value: '중부 (충남, 충북, 대전)', attr: 'data-area-code="5"' },
  { value: '서부 (전남, 전북, 광주, 제주)', attr: 'data-area-code="4"' },
  { value: '대구 (경북, 대구)', attr: 'data-area-code="3"' },
  { value: '부산 (경남, 울산, 부산)', attr: '"data-area-code="2""' }
];

Tw.CUSTOMER_PRAISE_SUBJECT_TYPES = [
  { value: '지점', code: 'T40' },
  { value: '대리점', code: 'T10' },
  { value: '이용안내', code: 'T30' },
  { value: '통화품질 기준 매니저', code: 'T50' },
  { value: 'AS센터', code: 'T20' },
  { value: '행복기사(SK브로드밴드)', code: 'T60' }
];

Tw.CUSTOMER_PRAISE_AREAS = [
  { value: '서울/인천/경기', code: 'A10' },
  { value: '강원/충청/대전', code: 'A20' },
  { value: '전북/전남/광주/제주', code: 'A30' },
  { value: '부산/경남', code: 'A40' },
  { value: '대구/경북', code: 'A50' }
];

Tw.CUSTOMER_EMAIL_SERVICE_CATEGORY = [
  {
    title: '휴대폰',
    category: 'cell',
    list: [
      { title: '요금조회/납부', ofrCtgSeq: '5000273' },
      { title: '단말기 관련', ofrCtgSeq: '5000274' },
      { title: '요금제 부가서비스', ofrCtgSeq: '5000270' },
      { title: '가입/변경/해지', ofrCtgSeq: '5000271' },
      { title: '멤버쉽', ofrCtgSeq: '5000275' },
      { title: '휴대폰 정지', ofrCtgSeq: '5000269' },
      { title: '기타', ofrCtgSeq: '5000280' }
    ]
  },
  {
    title: '인터넷/집전화/TV',
    category: 'internet',
    list: [
      { title: '요금조회/납부', ofrCtgSeq: '5000141' },
      { title: '장애/고장신고', ofrCtgSeq: '5000143' },
      { title: '가입/변경/해지', ofrCtgSeq: '5000153' },
      { title: '부가서비스', ofrCtgSeq: '5000152' },
      { title: '위약금/약정기간', ofrCtgSeq: '5000153' },
      { title: '기사/상담원 불만', ofrCtgSeq: '5000147' },
      { title: '기타', ofrCtgSeq: '5000153' }
    ]
  },
  {
    title: '다이렉트샵',
    category: 'direct',
    list: [
      { title: '휴대폰 구매', ofrCtgSeq: '07' },
      { title: '기타 문의', ofrCtgSeq: '10' },
      { title: 'T기프트/액세서리', ofrCtgSeq: '12' },
      { title: '휴대폰배송', ofrCtgSeq: '08' },
      { title: '휴대폰 교환/반품', ofrCtgSeq: '09' }
    ]
  },
  {
    title: '초코렛',
    category: 'chocolate',
    list: [
      { title: '상품문의', ofrCtgSeq: '010700' },
      { title: '교환/반품', ofrCtgSeq: '010600' },
      { title: '취소문의', ofrCtgSeq: '010800' },
      { title: '이용문의', ofrCtgSeq: '010900' }
    ]
  }
];

Tw.CUSTOMER_EMAIL_QUALITY_CATEGORY = [
  { title: '휴대폰/와이브로', category: 'cell' },
  { title: '인터넷/TV/집전화', category: 'internet' }
];

Tw.CUSTOMER_EMAIL_QUALITY_QUESTION = {
  Q_TYPE01: {
    title: '현상',
    list: [
      { text: '음성통화 불량(HD Voice 포함)' },
      { text: '영상통화 불량' },
      { text: '부가서비스 불량' },
      { text: '데이터(Date) 불량' },
      { text: '와이브로 품질장애/고장' }
    ]
  },
  Q_TYPE02: {
    title: '세부현상',
    list: [
      { text: '음성발신불량, 음성수신불량, 음성발신/수신 모두 불량' },
      { text: 'SMS발신불량, SMS수신불량, SMS발신/수신 모두불량' },
      { text: '인터넷접속불량 특정 APP 분량, 기타' }
    ]
  },
  Q_TYPE03: {
    title: '발생위치',
    list: [
      { text: '건물내부(지하층)' },
      { text: '건물내부(지상층)' },
      { text: '건물외부' },
      { text: '위치무관' }
    ]
  },
  Q_TYPE04: {
    title: '건물종류',
    list: [
      { text: '주택, 빌라' },
      { text: '아파트, 오피스텔' },
      { text: '사무실, 상가' },
      { text: '기타' }
    ]
  },
  Q_TYPE05: {
    title: '발생시기',
    list: [
      { text: '사용 중 갑자기' },
      { text: '며칠 전부터' },
      { text: '이사/회사 이동 후 부터' }
    ]
  }
};

Tw.REGION_LIST_ITEM = {
  start: '<li role="radio" aria-checked="false"><input type="radio" name="senddata" title="" value="',
  close: '</li>',
  getItem: function (name, code) {
    return this.start + code + '">' + name + this.close;
  }
};
