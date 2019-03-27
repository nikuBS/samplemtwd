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
      'title': '요금 즉시 납부',
      'list': [
        { 'button-attr': 'type="button"', 'txt': '계좌이체 납부', 'option': 'fe-account' },
        { 'button-attr': 'type="button"', 'txt': '체크/신용카드 납부', 'option': 'fe-card' },
        { 'button-attr': 'type="button"', 'txt': 'OK캐쉬백/T포인트 납부', 'option': 'fe-point' }
      ]
    },
    {
      'list': [
        {
          'button-attr': 'type="button"', 'txt': '입금전용계좌 문자 신청', 'option': 'fe-sms',
          'add': '입금전용계좌 정보를 문자로 전송합니다.\n자동납부 인출 중이 아닌 경우에만 이용 가능합니다.', 'spot': '신청'
        }
      ]
    },
    {
      'title': '포인트 요금 납부 예약',
      'list': [
        { 'button-attr': 'type="button"', 'txt': 'OK캐쉬백포인트', 'option': 'fe-ok-cashbag' },
        { 'button-attr': 'type="button"', 'txt': 'T포인트', 'option': 'fe-t-point' },
        { 'button-attr': 'type="button"', 'txt': '레인보우포인트', 'option': 'fe-rainbow-point' }
      ]
    }
  ],
  FARE_PAYMENT_LAYER_DATA_EXCEPT_POINT: [
    {
      'title': '요금 즉시 납부',
      'list': [
        { 'button-attr': 'type="button"', 'txt': '계좌이체 납부', 'option': 'fe-account' },
        { 'button-attr': 'type="button"', 'txt': '체크/신용카드 납부', 'option': 'fe-card' }
      ]
    },
    {
      'list': [
        {
          'button-attr': 'type="button"', 'txt': '입금전용계좌 문자 신청', 'option': 'fe-sms',
          'add': '입금전용계좌 정보를 문자로 전송합니다.\n자동납부 인출 중이 아닌 경우에만 이용 가능합니다.', 'spot': '신청'
        }
      ]
    }
  ],
  CUSTOMER_AGENTSEARCH_TUBE_AREA: [
    {
      list: [
        { 'label-attr': 'id="0"', 'radio-attr': 'id="0" name="r2" data-area="수도권"', txt: '수도권' },
        { 'label-attr': 'id="1"', 'radio-attr': 'id="1" name="r2" data-area="부산"', txt: '부산' },
        { 'label-attr': 'id="2"', 'radio-attr': 'id="2" name="r2" data-area="대구"', txt: '대구' },
        { 'label-attr': 'id="3"', 'radio-attr': 'id="3" name="r2" data-area="대전"', txt: '대전' },
        { 'label-attr': 'id="4"', 'radio-attr': 'id="4" name="r2" data-area="광주"', txt: '광주' }
      ]
    }
  ],
  CUSTOMER_AGENTSEARCH_TUBE_LINE: {
    0: [{
      list: [
        { 'label-attr': 'id="0"', 'radio-attr': 'id="0" name="r2" data-line="1호선"', txt: '1호선' },
        { 'label-attr': 'id="1"', 'radio-attr': 'id="1" name="r2" data-line="2호선"', txt: '2호선' },
        { 'label-attr': 'id="2"', 'radio-attr': 'id="2" name="r2" data-line="3호선"', txt: '3호선' },
        { 'label-attr': 'id="3"', 'radio-attr': 'id="3" name="r2" data-line="4호선"', txt: '4호선' },
        { 'label-attr': 'id="4"', 'radio-attr': 'id="4" name="r2" data-line="5호선"', txt: '5호선' },
        { 'label-attr': 'id="5"', 'radio-attr': 'id="5" name="r2" data-line="6호선"', txt: '6호선' },
        { 'label-attr': 'id="6"', 'radio-attr': 'id="6" name="r2" data-line="7호선"', txt: '7호선' },
        { 'label-attr': 'id="7"', 'radio-attr': 'id="7" name="r2" data-line="8호선"', txt: '8호선' },
        { 'label-attr': 'id="8"', 'radio-attr': 'id="8" name="r2" data-line="9호선"', txt: '9호선' },
        { 'label-attr': 'id="9"', 'radio-attr': 'id="9" name="r2" data-line="경강선"', txt: '경강선' },
        { 'label-attr': 'id="10"', 'radio-attr': 'id="10" name="r2" data-line="경춘선"', txt: '경춘선' },
        { 'label-attr': 'id="11"', 'radio-attr': 'id="11" name="r2" data-line="분당선"', txt: '분당선' },
        { 'label-attr': 'id="12"', 'radio-attr': 'id="12" name="r2" data-line="수인선"', txt: '수인선' },
        { 'label-attr': 'id="13"', 'radio-attr': 'id="13" name="r2" data-line="공항철도"', txt: '공항철도' },
        { 'label-attr': 'id="14"', 'radio-attr': 'id="14" name="r2" data-line="신분당선"', txt: '신분당선' },
        { 'label-attr': 'id="15"', 'radio-attr': 'id="15" name="r2" data-line="에버라인"', txt: '에버라인' },
        { 'label-attr': 'id="16"', 'radio-attr': 'id="16" name="r2" data-line="의정부선"', txt: '의정부선' },
        { 'label-attr': 'id="17"', 'radio-attr': 'id="17" name="r2" data-line="인천1호선"', txt: '인천1호선' },
        { 'label-attr': 'id="18"', 'radio-attr': 'id="18" name="r2" data-line="인천2호선"', txt: '인천2호선' },
        { 'label-attr': 'id="19"', 'radio-attr': 'id="19" name="r2" data-line="경의중앙선"', txt: '경의중앙선' },
        { 'label-attr': 'id="20"', 'radio-attr': 'id="20" name="r2" data-line="우이신설선"', txt: '우이신설선' }
      ]
    }],
    1: [{
      list: [
        { 'label-attr': 'id="0"', 'radio-attr': 'id="0" name="r2" data-line="1호선"', txt: '1호선' },
        { 'label-attr': 'id="1"', 'radio-attr': 'id="1" name="r2" data-line="2호선"', txt: '2호선' },
        { 'label-attr': 'id="2"', 'radio-attr': 'id="2" name="r2" data-line="3호선"', txt: '3호선' },
        { 'label-attr': 'id="3"', 'radio-attr': 'id="3" name="r2" data-line="4호선"', txt: '4호선' },
        { 'label-attr': 'id="4"', 'radio-attr': 'id="4" name="r2" data-line="부산김해경전철"', txt: '부산김해경전철' }
      ]
    }],
    2: [{
      list: [
        { 'label-attr': 'id="0"', 'radio-attr': 'id="0" name="r2" data-line="1호선"', txt: '1호선' },
        { 'label-attr': 'id="1"', 'radio-attr': 'id="1" name="r2" data-line="2호선"', txt: '2호선' },
        { 'label-attr': 'id="2"', 'radio-attr': 'id="2" name="r2" data-line="3호선"', txt: '3호선' }
      ]
    }],
    3: [{
      list: [
        { 'label-attr': 'id="0"', 'radio-attr': 'id="0" name="r2" data-line="1호선"', txt: '1호선' }
      ]
    }],
    4: [{
      list: [
        { 'label-attr': 'id="0"', 'radio-attr': 'id="0" name="r2" data-line="1호선"', txt: '1호선' }
      ]
    }]
  },
  IMMEDIATELY_CHARGE_DATA: {
    TITLE: '충전방법 선택',
    REFILL: {
      TYPE: '나의 보유 쿠폰 사용',
      VALUE: '리필쿠폰',
      UNIT: '장'
    },
    PREPAY: {
      'title': '선불쿠폰 구매 · 충전',
      'list': [
        { 'option': 'data_coupon', 'button-attr': 'type="button"" target="_blank"', 'icon': 'ico2', 'txt': 'T데이터쿠폰' },
        { 'option': 't_coupon', 'button-attr': 'type="button"', 'icon': 'ico3', 'txt': 'T쿠폰' },
        { 'option': 'jeju_coupon', 'button-attr': 'type="button"', 'icon': 'ico13', 'txt': '제주도 프리쿠폰' }

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
  PPS_CHARGE_DATA: {
    TITLE: '선불폰 충전',
    VOICE: '음성 충전',
    DATA: '데이터 충전',
    ONCE: '1회 충전',
    AUTO: '자동 충전',
    AUTO_CHANGE: '자동 충전 변경/해지'
  },
  FARE_PAYMENT_CARD_TYPE_LIST: [
    {
      'list': [
        { 'label-attr': 'id="00"', 'radio-attr': 'id="00" name="r2"', txt: '일시불' },
        { 'label-attr': 'id="01"', 'radio-attr': 'id="01" name="r2"', txt: '1개월 할부' },
        { 'label-attr': 'id="02"', 'radio-attr': 'id="02" name="r2"', txt: '2개월 할부' },
        { 'label-attr': 'id="03"', 'radio-attr': 'id="03" name="r2"', txt: '3개월 할부' },
        { 'label-attr': 'id="04"', 'radio-attr': 'id="04" name="r2"', txt: '4개월 할부' },
        { 'label-attr': 'id="05"', 'radio-attr': 'id="05" name="r2"', txt: '5개월 할부' },
        { 'label-attr': 'id="06"', 'radio-attr': 'id="06" name="r2"', txt: '6개월 할부' },
        { 'label-attr': 'id="07"', 'radio-attr': 'id="07" name="r2"', txt: '7개월 할부' },
        { 'label-attr': 'id="08"', 'radio-attr': 'id="08" name="r2"', txt: '8개월 할부' },
        { 'label-attr': 'id="09"', 'radio-attr': 'id="09" name="r2"', txt: '9개월 할부' },
        { 'label-attr': 'id="10"', 'radio-attr': 'id="10" name="r2"', txt: '10개월 할부' },
        { 'label-attr': 'id="11"', 'radio-attr': 'id="11" name="r2"', txt: '11개월 할부' },
        { 'label-attr': 'id="12"', 'radio-attr': 'id="12" name="r2"', txt: '12개월 할부' },
        { 'label-attr': 'id="24"', 'radio-attr': 'id="24" name="r2"', txt: '24개월 할부' }
      ]
    }
  ],
  FARE_PAYMENT_POINT_LIST: [
    {
      'list': [
        { 'label-attr': 'id="10"', 'radio-attr': 'id="10" name="r2" data-code="CPT"', txt: 'OK캐쉬백' },
        { 'label-attr': 'id="11"', 'radio-attr': 'id="11" name="r2" data-code="TPT"', txt: 'T포인트' }
      ]
    }
  ],
  FARE_PAYMENT_POINT: [
    {
      'list': [
        { 'label-attr': 'id="500"', 'radio-attr': 'name="r2" id="500"', txt: '500P' },
        { 'label-attr': 'id="1000"', 'radio-attr': 'name="r2" id="1000"', txt: '1,000P' },
        { 'label-attr': 'id="1500"', 'radio-attr': 'name="r2" id="1500"', txt: '1,500P' },
        { 'label-attr': 'id="2000"', 'radio-attr': 'name="r2" id="2000"', txt: '2,000P' },
        { 'label-attr': 'id="2500"', 'radio-attr': 'name="r2" id="2500"', txt: '2,500P' },
        { 'label-attr': 'id="3000"', 'radio-attr': 'name="r2" id="3000"', txt: '3,000P' },
        { 'label-attr': 'id="3500"', 'radio-attr': 'name="r2" id="3500"', txt: '3,500P' },
        { 'label-attr': 'id="4000"', 'radio-attr': 'name="r2" id="4000"', txt: '4,000P' },
        { 'label-attr': 'id="4500"', 'radio-attr': 'name="r2" id="4500"', txt: '4,500P' },
        { 'label-attr': 'id="5000"', 'radio-attr': 'name="r2" id="5000"', txt: '5,000P' },
        { 'label-attr': 'id="5500"', 'radio-attr': 'name="r2" id="5500"', txt: '5,500P' },
        { 'label-attr': 'id="6000"', 'radio-attr': 'name="r2" id="6000"', txt: '6,000P' },
        { 'label-attr': 'id="6500"', 'radio-attr': 'name="r2" id="6500"', txt: '6,500P' },
        { 'label-attr': 'id="7000"', 'radio-attr': 'name="r2" id="7000"', txt: '7,000P' },
        { 'label-attr': 'id="7500"', 'radio-attr': 'name="r2" id="7500"', txt: '7,500P' },
        { 'label-attr': 'id="8000"', 'radio-attr': 'name="r2" id="8000"', txt: '8,000P' },
        { 'label-attr': 'id="8500"', 'radio-attr': 'name="r2" id="8500"', txt: '8,500P' },
        { 'label-attr': 'id="9000"', 'radio-attr': 'name="r2" id="9000"', txt: '9,000P' },
        { 'label-attr': 'id="9500"', 'radio-attr': 'name="r2" id="9500"', txt: '9,500P' },
        { 'label-attr': 'id="10000"', 'radio-attr': 'name="r2" id="10000"', txt: '10,000P' }
      ]
    }
  ],
  FARE_PAYMENT_TPOINT: [
    {
      'list': [
        { 'label-attr': 'id="10000"', 'radio-attr': 'id="10000" name="r2"', txt: '10,000P' },
        { 'label-attr': 'id="20000"', 'radio-attr': 'id="20000" name="r2"', txt: '20,000P' },
        { 'label-attr': 'id="50000"', 'radio-attr': 'id="50000" name="r2"', txt: '50,000P' },
        { 'label-attr': 'id="100000"', 'radio-attr': 'id="100000" name="r2"', txt: '100,000P' }
      ]
    }
  ],
  FARE_PAYMENT_RAINBOW: [
    {
      'list': [
        { 'label-attr': 'id="CCBBAE0"', 'radio-attr': 'id="CCBBAE0" name="r2"', txt: '국내 음성통화료' },
        { 'label-attr': 'id="CCRPDDC"', 'radio-attr': 'id="CCRPDDC" name="r2"', txt: '국내 데이터 사용요금' },
        { 'label-attr': 'id="CCBCOE0"', 'radio-attr': 'id="CCBCOE0" name="r2"', txt: '부가서비스(컬러링)' },
        { 'label-attr': 'id="CCPCRBE"', 'radio-attr': 'id="CCPCRBE" name="r2"', txt: '부가서비스(퍼팩트콜)' },
        { 'label-attr': 'id="CCPLRBE"', 'radio-attr': 'id="CCPLRBE" name="r2"', txt: '부가서비스(퍼팩트콜라이트)' },
        { 'label-attr': 'id="CCRPGDC"', 'radio-attr': 'id="CCRPGDC" name="r2"', txt: '기본료/월정액' },
        { 'label-attr': 'id="CCRMRBE"', 'radio-attr': 'id="CCRMRBE" name="r2"', txt: '로밍 이용요금' }
      ]
    }
  ],
  FARE_PAYMENT_MICRO_HISTORY_LIST: [
    {
      'list': [
        { 'label-attr': 'data-link="/myt-fare/bill/small/history"', 'radio-attr': 'data-link="/myt-fare/bill/small/history"', txt: '소액결제 이용내역' },
        { 'label-attr': 'data-link="/myt-fare/bill/small/block"', 'radio-attr': 'data-link="/myt-fare/bill/small/block"', txt: '자동결제 차단내역' }
      ]
    }
  ],
  FARE_PAYMENT_BANK_DATE: [
    {
      'list': [
        { 'label-attr': 'id="0"', 'radio-attr': 'id="0" data-value="15" name="r2"', txt: '15일' },
        { 'label-attr': 'id="3"', 'radio-attr': 'id="3" data-value="21" name="r2"', txt: '21일' },
        { 'label-attr': 'id="1"', 'radio-attr': 'id="1" data-value="23" name="r2"', txt: '23일' }
      ]
    }
  ],
  FARE_PAYMENT_CARD_DATE: [
    {
      'list': [
        { 'label-attr': 'id="1"', 'radio-attr': 'id="1" name="r2"', txt: '11일' },
        { 'label-attr': 'id="2"', 'radio-attr': 'id="2" name="r2"', txt: '18일' },
        { 'label-attr': 'id="3"', 'radio-attr': 'id="3" name="r2"', txt: '26일' }
      ]
    }
  ],
  JOIN_INFO_NO_AGREEMENT: [
    {
      'list': [
        {'label-attr':'id="0"','radio-attr':'id="0" name="r1" value="전체"','txt':'전체'},
        {'label-attr':'id="1"','radio-attr':'id="1" name="r1" value="포인트 사용"','txt':'포인트 사용'},
        {'label-attr':'id="2"','radio-attr':'id="2" name="r1" value="포인트 적립"','txt':'포인트 적립'},
        {'label-attr':'id="3"','radio-attr':'id="3" name="r1" value="포인트 소멸"','txt':'포인트 소멸'}
      ]
    }
  ],
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
  FARE_PAYMENT_SMALL_LIMIT: [
    {
      'list': [
        { 'label-attr': 'id="500000"', 'radio-attr': 'name="r2" id="500000"', txt: '50만원' },
        { 'label-attr': 'id="300000"', 'radio-attr': 'name="r2" id="300000"', txt: '30만원' },
        { 'label-attr': 'id="200000"', 'radio-attr': 'name="r2" id="200000"', txt: '20만원' },
        { 'label-attr': 'id="150000"', 'radio-attr': 'name="r2" id="150000"', txt: '15만원' },
        { 'label-attr': 'id="120000"', 'radio-attr': 'name="r2" id="120000"', txt: '12만원' },
        { 'label-attr': 'id="60000"', 'radio-attr': 'name="r2" id="60000"', txt: '6만원' },
        { 'label-attr': 'id="50000"', 'radio-attr': 'name="r2" id="50000"', txt: '5만원' },
        { 'label-attr': 'id="30000"', 'radio-attr': 'name="r2" id="30000"', txt: '3만원' },
        { 'label-attr': 'id="10000"', 'radio-attr': 'name="r2" id="10000"', txt: '1만원' }
      ]
    }
  ],
  FARE_PAYMENT_CONTENTS_LIMIT: [
    {
      'list': [
        { 'label-attr': 'id="500000"', 'radio-attr': 'name="r2" id="500000"', txt: '50만원' },
        { 'label-attr': 'id="400000"', 'radio-attr': 'name="r2" id="400000"', txt: '40만원' },
        { 'label-attr': 'id="300000"', 'radio-attr': 'name="r2" id="300000"', txt: '30만원' },
        { 'label-attr': 'id="200000"', 'radio-attr': 'name="r2" id="200000"', txt: '20만원' },
        { 'label-attr': 'id="150000"', 'radio-attr': 'name="r2" id="150000"', txt: '15만원' },
        { 'label-attr': 'id="100000"', 'radio-attr': 'name="r2" id="100000"', txt: '10만원' },
        { 'label-attr': 'id="90000"', 'radio-attr': 'name="r2" id="90000"', txt: '9만원' },
        { 'label-attr': 'id="60000"', 'radio-attr': 'name="r2" id="60000"', txt: '6만원' },
        { 'label-attr': 'id="30000"', 'radio-attr': 'name="r2" id="30000"', txt: '3만원' },
        { 'label-attr': 'id="10000"', 'radio-attr': 'name="r2" id="10000"', txt: '1만원' }
      ]
    }
  ],
  PAYMENT_HISTORY_TYPE: [
    {
      list: [
        { txt: '최근 납부 내역', 'radio-attr': 'name="myTHistory" value="0" checked' },
        { txt: '즉시납부', 'radio-attr': 'name="myTHistory" value="1"' },
        { txt: '자동납부', 'radio-attr': 'name="myTHistory" value="2"' },
        { txt: '자동 납부 통합인출', 'radio-attr': 'name="myTHistory" value="3"', onlyType: 'M'},
        { txt: '소액결제 선결제', 'radio-attr': 'name="myTHistory" value="4"', onlyType: 'M' },
        { txt: '콘텐츠 이용요금 선결제', 'radio-attr': 'name="myTHistory" value="5"', onlyType: 'M' },
        { txt: '포인트 납부 예약', 'radio-attr': 'name="myTHistory" value="6"', onlyType: 'M' },
        { txt: '포인트 자동납부', 'radio-attr': 'name="myTHistory" value="7"', onlyType: 'M' }
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
  ],
  MEMBERSHIP_CORPORATE_LIST: [
    {
      'list': [
        { 'option': 'nominal', 'attr': 'id="010"', value: '본인' },
        { 'option': 'nominal', 'attr': 'id="090"', value: '직원' },
        { 'option': 'nominal', 'attr': 'id="990"', value: '기타' }
      ]
    }
  ],
  MEMBERSHIP_CLAUSE_ITEM: {
    '01': { title: 'SK텔레콤 멤버십 회원 이용약관', url: 'https://www.sktmembership.co.kr/mobile/html/iframe/1.1_iframe1.html' },
    '02': { title: '개인정보 수집 이용 동의', url: 'https://www.sktmembership.co.kr/mobile/html/iframe/1.1_iframe2.html' },
    '03': { title: '광고성 정보 수신 동의', url: 'https://www.sktmembership.co.kr/mobile/html/iframe/1.1_iframe3.html' },
    '04': { title: '고객 혜택 제공을 위한 개인정보 수집 이용 동의', url: 'https://www.sktmembership.co.kr/mobile/html/iframe/1.1_iframe4.html' },
    '05': { title: 'OK캐쉬백 카드 서비스 이용약관', url: 'https://www.sktmembership.co.kr/mobile/html/iframe/1.3_iframe11.html' },
    '06': { title: 'OK캐쉬백 암호화된 동일힌 식별정보 제공 동의', url: 'https://www.sktmembership.co.kr/mobile/html/iframe/1.3_iframe12.html' },
    '07': { title: '마케팅 활동 동의', url: 'https://www.sktmembership.co.kr/mobile/html/iframe/1.3_iframe13.html' },
    '09': { title: '개인정보 처리방침', url: 'https://privacy.sktelecom.com/view.do?ctg=policy&name=policy'}
  },
  ROAMING_RETURN_PLACE: [
    {
      'list': [
        { 'radio-attr': 'id="00" name="r2"',
          'label-attr':'id="00" data-center="A100110000" data-img="place-img-01-01" value="인천공항 1터미널 1층 로밍센터"',
          txt: '인천공항 1터미널 1층 로밍센터' },
        { 'radio-attr': 'id="01" name="r2"',
          'label-attr':'id="01" data-center="1430456896" data-img="place-img-02-1" value="인천공항 2터미널 1층 로밍센터"',
          txt: '인천공항 2터미널 1층 로밍센터' },
        { 'radio-attr': 'id="02" name="r2"',
          'label-attr':'id="02" data-center="A100140000" data-img="place-img-03" value="김포공항 1층 로밍센터"',
          txt: '김포공항 1층 로밍센터' },
        { 'radio-attr': 'id="03" name="r2"',
          'label-attr':'id="03" data-center="A900100000" data-img="place-img-04" value="제주공항 국제선 1층 로밍센터"',
          txt: '제주공항 국제선 1층 로밍센터' },
        { 'radio-attr': 'id="04" name="r2"',
          'label-attr':'id="04" data-center="A200130000" data-img="place-img-05-1" value="김해공항 3층 로밍센터"',
          txt: '김해공항 3층 로밍센터' },
        { 'radio-attr': 'id="05" name="r2"',
          'label-attr':'id="05" data-center="C399900000" data-img="place-img-06" value="대구공항 2층 로밍센터"',
          txt: '대구공항 2층 로밍센터' },
        { 'radio-attr': 'id="14" name="r2"',
          'label-attr':'id="14" data-center="1430452300" data-img="place-img-10" value="대구 SKT 황금점 매장"',
          txt: '대구 SKT 황금점 매장' }
      ]
    }
  ],
  TEVENT_LIST: [
    {
      'list': [
        { 'label-attr': 'id="ing"', 'radio-attr': 'id="ing" name="r2"', txt: '진행중 이벤트' },
        { 'label-attr': 'id="last"', 'radio-attr': 'id="last" name="r2"', txt: '지난 이벤트' },
        { 'label-attr': 'id="win"', 'radio-attr': 'id="win"', txt: '당첨자 발표' }
      ]
    }
  ],
  ROAMING_RECEIVE_PLACE: [
    {
      'list': [
        { 'radio-attr': 'name="r2"',
          'label-attr':'id="06" data-center="A100110000" data-booth="1000004045"' +
            ' data-img="place-img-01-f" value="인천공항 1터미널 3층 로밍센터(F 카운터)"',
          txt: '인천공항 1터미널 3층 로밍센터(F 카운터)' },
        { 'radio-attr': 'name="r2"',
          'label-attr':'id="07" data-center="A100110000" data-booth="1000004047"' +
            ' data-img="place-img-01-h" value="인천공항 1터미널 3층 로밍센터(H 카운터)"',
          txt: '인천공항 1터미널 3층 로밍센터(H 카운터)' },
        { 'radio-attr': 'name="r2"',
          'label-attr':'id="08" data-center="1430456896" data-booth="1430456957"' +
            ' data-img="place-img-02-de" value="인천공항 2터미널 3층 로밍센터(D-E 카운터)"',
          txt: '인천공항 2터미널 3층 로밍센터(D-E 카운터)' },
        { 'radio-attr': 'name="r2"',
          'label-attr':'id="09" data-center="A100140000" data-booth="1000004055"' +
            ' data-img="place-img-03" value="김포공항 1층 로밍센터"',
          txt: '김포공항 1층 로밍센터' },
        { 'radio-attr': 'name="r2"',
          'label-attr':'id="10" data-center="A900100000" data-booth="1000004057"' +
            ' data-img="place-img-04" value="제주공항 국제선 1층 로밍센터"',
          txt: '제주공항 국제선 1층 로밍센터' },
        { 'radio-attr': 'name="r2"',
          'label-attr':'id="11" data-center="A200130000" data-booth="1000012532"' +
            ' data-img="place-img-05" value="김해공항 3층 로밍센터"',
          txt: '김해공항 3층 로밍센터' },
        { 'radio-attr': 'name="r2"',
          'label-attr':'id="12" data-center="C399900000" data-booth="1430455436"' +
            ' data-img="place-img-06" value="대구공항 2층 로밍센터"',
          txt: '대구공항 2층 로밍센터' },
        { 'radio-attr': 'name="r2"',
          'label-attr':'id="13" data-center="1430452300" data-booth="1430452300"' +
            ' data-img="place-img-10" value="대구 SKT 황금점 매장"',
          txt: '대구 SKT 황금점 매장' }
      ]
    }
  ],
  ROAMING_INFO_CENTER: [
    {
      data: [{
        'list': [
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="1"', txt: '인천공항 1터미널 3층' },
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="2"', txt: '인천공항 1터미널 1층' }
        ]
      }]
    },
    {
      data: [{
        'list': [
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="3"', txt: '인천공항 2터미널 3층' },
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="4"', txt: '인천공항 2터미널 1층' }
        ]
      }]
    },
    {
      data: [{
        'list': [
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="7"', txt: '김해공항 3층 국제선 청사' },
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="8"', txt: '김해공항 1층 국제선 청사' }
        ]
      }]
    },
    {
      data: [{
        'list': [
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="10"', txt: '국제1 여객터미널' },
          { 'radio-attr': 'name="r2"', 'label-attr': 'id="11"', txt: '국제2 여객터미널' }
        ]
      }]
    }
  ],
  BENEFIT_JOIN_ADVICE_PRODUCT: [
    {
      'list': [
        {'label-attr':'id="cellphone"','radio-attr':'id="cellphone" name="r1" value="휴대폰"','txt':'휴대폰'},
        {'label-attr':'id="internet"' ,'radio-attr':'id="internet" name="r1" value="인터넷"','txt':'인터넷'},
        {'label-attr':'id="phone"'    ,'radio-attr':'id="phone" name="r1" value="전화"','txt':'전화'},
        {'label-attr':'id="tv"'       ,'radio-attr':'id="tv" name="r1" value="TV"','txt':'TV'},
        {'label-attr':'id="combine"'  ,'radio-attr':'id="combine" name="r1" value="결합상품"','txt':'결합상품'}
      ]
    }
  ]
};

Tw.MYT_TPL = {
  DATA_SUBMAIN: {
    SP_TEMP: '<br> ↓ <br>',
    MORE_LINE_TEMP: '<li data-svc-mgmt-num="{{svcMgmtNum}}"' +
    'data-name="{{nickNm}}" data-num="{{svcNum}}"><button>' +
    '<span class="ico-wrap"><i class="icon-{{svcType}}-80"><span class="blind"></span></i></span>' +
    '<span class="cont"><span class="info-title">{{nickNm}}' +
    '{{#if child}}' +
    '<span class="badge-type1"><i class="icon-children"><span class="blind">자녀</span></i></span>' +
    '{{/if}}' +
    '<span class="info-sub">{{svcNum}}</span>' +
    '<span class="price">{{data}}{{unit}}</span>' +
    '</span></span></button></li>'
  },
  FARE_SUBMAIN: {
    MORE_LINE_TEMP: '<li data-svc-mgmt-num="{{svcMgmtNum}}" data-rep-svc="{{repSvc}}"' +
      'data-name="{{nickNm}}" data-num="{{svcNum}}"><button>' +
      '<span class="ico-wrap">' +
      '<i class="icon-{{svcType}}-80"><span class="blind"></span></i>' +
      '</span>' +
      '<span class="cont">' +
      '<span class="info-title">{{nickNm}}' +
      '{{#if combine}}' +
      '<span class="badge badge-allpay ml6"><span class="blind">통합대표</span></span>' +
      '{{/if}}' +
      '</span>' + '{{#if isAddr }}' +
      '<span class="info-sub">{{addr}}</span>' +
      '{{else}}'+
      '<span class="info-sub">{{svcNum}}</span>' +
      '{{/if}}' +
    '<span class="price">{{amt}}</span>' +
    '</span></button></li>',
    TAX_TEMP: '<span class="inner"><span class="tit">세금계산서 재발행</span></span>',
    CONTB_TEMP: '<span class="inner"><span class="tit">기부금 / 후원금 납부내역</span></span>'
  },
  JOIN_SUBMAIN: {
    MORE_LINE_TEMP: '<li data-svc-mgmt-num="{{svcMgmtNum}}"' +
      'data-name="{{nickNm}}" data-num="{{number}}"><button>' +
      '<span class="ico-wrap"><i class="icon-{{className}}-80">' +
      '<span class="blind"></span></i></span><span class="cont">' +
      '<span class="info-title">{{nickNm}}</span><span class="info-sub">{{number}}</span>' +
      '</span></button></li>'
  },
  MORE_BTN: '<div class="bt-more"><button>더보기</button></div>',
  SWITCH_LINE_POPUP:
    {
      TITLE: '다른 회선의 정보를 조회하려면 현재 조회중인 회선({{svcNum}})을 아래의 회선으로 변경해야 합니다.',
      CONTENTS:
      '<p class="tl change-txt">변경할 회선</p>' +
      '<div class="pop-device-type">' +
      '<span class="ico-wrap"><i class="icon-{{clsNm}}-80"><span class="blind">{{clsNm}}</span></i></span>' +
      '<div class="user-info">' +
      '<span class="device"><span class="blind">디바이스 펜네임/닉네임</span>{{desc}}</span>' +
      '<div class="p-num"><span class="blind">회선정보</span>{{svcNum}}</div>' +
      '</div>' +
      '</div>'
    }
};

Tw.MYT_DATA_CHARGE_TYPE_LIST = [
  { max: '전체', 'radio-attr': 'data-type="5"', 'label-attr': ' ' },
  { max: 'T끼리 데이터 선물', 'radio-attr': 'data-type="0"', 'label-attr': ' ' },
  { max: '데이터 한도 충전', 'radio-attr': 'data-type="1"', 'label-attr': ' ' },
  { max: '팅/쿠키즈/안심요금', 'radio-attr': 'data-type="2"', 'label-attr': ' ' },
  { max: '팅 요금 선물', 'radio-attr': 'data-type="3"', 'label-attr': ' ' },
  { max: '데이터 음성 리필', 'radio-attr': 'data-type="4"', 'label-attr': ' ' }
];

Tw.PRODUCT_LIST_ORDER = [
  { txt: '추천순', 'radio-attr': 'data-order="recommand"', 'label-attr': ' ' },
  { txt: '높은 가격순', 'radio-attr': 'data-order="highprice"', 'label-attr': ' ' },
  { txt: '낮은 가격순', 'radio-attr': 'data-order="lowprice"', 'label-attr': ' ' }
];

Tw.TERMS_ACTION = {
  46: {
    data: [{
      list: [
        { txt: '초고속인터넷 이용약관', 'label-attr': 'id="46"', 'radio-attr': 'id="46" value="46:c:43"' },
        { txt: '인터넷전화 이용약관', 'label-attr': 'id="49"', 'radio-attr': 'id="49" value="49:d"' },
        { txt: '시내전화 이용약관', 'label-attr': 'id="50"', 'radio-attr': 'id="50" value="50:d"' }
      ]
    }]
  }
};

Tw.MYT_FARE_BILL_GUIDE_TPL = {
  TIT_ICON:[
    {SCH_LB:'이동전화', ELEMENT : '<span class="ico-wrap"><i class="icon-cellphone-80"><span class="blind"></span></i></span>'},
    {SCH_LB:'휴대폰', ELEMENT : '<span class="ico-wrap"><i class="icon-cellphone-80"><span class="blind"></span></i></span>'},
    {SCH_LB:'인터넷', ELEMENT : '<span class="ico-wrap"><i class="icon-internet-48"><span class="blind"></span></i></span>'},
    {SCH_LB:'TV', ELEMENT : '<span class="ico-wrap"><i class="icon-pc-48"><span class="blind"></span></i></span>'}
  ],
  DETAIL_BTN: [
    {SCH_ID : '콘텐츠이용료', ELEMENT: '콘텐츠이용료'}, // <button class="bt-link-tx underline" data-target="detailContentsBtn">콘텐츠이용료</button>'},  // DV001-19127
    {SCH_ID : '소액결제', ELEMENT: '소액결제'} // <button class="bt-link-tx underline" data-target="detailMicroBtn">소액결제</button>'}
  ],
  THIRD_PARTY_TPL: '<i class="icon-acompany"><span class="blind">타사</span></i>',
  ASTERISK_TPL: {SCH_ID : '*', ELEMENT: '<i class="icon-fnote"><span class="blind">각주 참고</span></i>'},
  PRICE_DC_POINT: { LABEL:'요금할인', CLASS : 'txt-point'},
  SVC_TYPE_TPL :{
    ALL: '<i class="icon-whole"><span class="blind"></span></i>',
    OTHER: '<span class="bar"></span>{{svcType}}'
  }
};

Tw.HELPLINE_TYPES = [
  { txt: '일반', 'radio-attr': 'data-type-idx="0"' },
  { txt: '로밍', 'radio-attr': 'data-type-idx="1"' },
  { txt: '통화품질 상담', 'radio-attr': 'data-type-idx="2"' }
];

Tw.CUSTOMER_HELPLINE_AREAS = [
  { txt: '수도권(서울, 경기, 인천, 강원)', 'radio-attr': 'data-area-code="1"' },
  { txt: '중부(충남, 충북, 대전)', 'radio-attr': 'data-area-code="5"' },
  { txt: '서부(전남, 전북, 광주, 제주)', 'radio-attr': 'data-area-code="4"' },
  { txt: '대구(경북, 대구)', 'radio-attr': 'data-area-code="3"' },
  { txt: '부산(경남, 울산, 부산)', 'radio-attr': 'data-area-code="2"' }
];

Tw.CUSTOMER_PRAISE_SUBJECT_TYPES = [
  { txt: '지점', 'radio-attr': 'data-index="0" data-code="T40"', 'label-attr': ' ' },
  { txt: '대리점', 'radio-attr': 'data-index="1" data-code="T10"', 'label-attr': ' ' },
  { txt: '고객센터', 'radio-attr': 'data-index="2" data-code="T30"', 'label-attr': ' ' },
  { txt: '통화품질 기준 매니저', 'radio-attr': 'data-index="3" data-code="T50"', 'label-attr': ' ' },
  { txt: 'A/S센터', 'radio-attr': 'data-index="4" data-code="T20"', 'label-attr': ' ' },
  { txt: '행복기사(SK브로드밴드)', 'radio-attr': 'data-index="5" data-code="T60"', 'label-attr': ' ' }
];

Tw.CUSTOMER_PRAISE_AREAS = [
  { txt: '서울/인천/경기', 'radio-attr': 'data-code="A10"', 'label-attr': ' ' },
  { txt: '강원/충청/대전', 'radio-attr': 'data-code="A20"', 'label-attr': ' ' },
  { txt: '전북/전남/광주/제주', 'radio-attr': 'data-code="A30"', 'label-attr': ' ' },
  { txt: '부산/경남', 'radio-attr': 'data-code="A40"', 'label-attr': ' ' },
  { txt: '대구/경북', 'radio-attr': 'data-code="A50"', 'label-attr': ' ' }
];

Tw.CUSTOMER_EMAIL_SERVICE_CATEGORY = [
  {
    title: '휴대폰',
    category: 'CELL',
    list: [
      { title: '요금조회/납부', ofrCtgSeq: '5000273' },
      { title: '단말기 관련', ofrCtgSeq: '5000274' },
      { title: '요금제 부가서비스', ofrCtgSeq: '5000270' },
      { title: '가입/변경/해지', ofrCtgSeq: '5000271' },
      { title: 'T멤버십', ofrCtgSeq: '5000275' },
      { title: '휴대폰 정지', ofrCtgSeq: '5000269' },
      { title: '기타', ofrCtgSeq: '5000280' }
    ]
  },
  {
    title: '인터넷/집전화/IPTV',
    category: 'INTERNET',
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
    title: 'T world 다이렉트',
    category: 'DIRECT',
    list: [
      { title: '휴대폰 구매', ofrCtgSeq: '07' },
      { title: '기타 문의', ofrCtgSeq: '10' },
      { title: 'T기프트/액세서리', ofrCtgSeq: '12' },
      { title: '휴대폰배송', ofrCtgSeq: '08' },
      { title: '휴대폰 교환/반품', ofrCtgSeq: '09' }
    ]
  },
  {
    title: '초콜릿',
    category: 'CHOCO',
    list: [
      { title: '상품문의', ofrCtgSeq: '010700' },
      { title: '교환/반품', ofrCtgSeq: '010600' },
      { title: '취소문의', ofrCtgSeq: '010800' },
      { title: '이용문의', ofrCtgSeq: '010900' }
    ]
  }
];

Tw.CUSTOMER_EMAIL_QUALITY_CATEGORY = [
  { title: '휴대폰', category: 'cell' },
  { title: '인터넷/집전화/IPTV', category: 'internet' }
];

Tw.CUSTOMER_EMAIL_QUALITY_QUESTION = {
  Q_TYPE01: {
    title: '현상',
    list: [
      { text: '음성통화 불량(HD Voice 포함)' },
      { text: '영상통화 불량' },
      { text: '부가서비스 불량' },
      { text: '데이터 불량' }
      // { text: '와이브로 품질장애/고장' }
    ]
  },
  Q_TYPE02: {
    title: '세부현상',
    list: [
      { text: '음성통화(발신, 수신, 발신/수신) 불량' },
      { text: '문자(발신, 수신, 발신/수신) 불량' },
      { text: '인터넷 접속 불량, 특정 앱 분량, 기타' }
    ]
  },
  Q_TYPE03: {
    title: '발생위치',
    list: [
      { text: '건물내부(지하층)' },
      { text: '건물내부(지상층)' },
      { text: '건물외부' },
      { text: '위치 무관' }
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
      { text: '이사 또는 회사 이동 후부터' }
    ]
  }
};

Tw.CUSTOMER_EMAIL_FILLED_CONTENT_CASE = {
  'CELL_MEMBER': 'MEMBERSHIP',
  'CHOCO': 'CHOCO'
};

Tw.REGION_LIST_ITEM = {
  start: '<li role="radio" aria-checked="false" aria-labelledby="aria-comp-radio">' +
    '<input type="radio" name="senddata" aria-labelledby="aria-comp-radio" value="',
  close: '</li>',
  getItem: function (name, code) {
    return this.start + code + '">' + name + this.close;
  }
};

Tw.MYT_PREPAID_AMOUNT = {
  title: '충전 금액',
  list: [
    { text: '50,000원', value: 50000 },
    { text: '30,000원', value: 30000 },
    { text: '20,000원', value: 20000 },
    { text: '10,000원', value: 10000 }
  ]
};

Tw.MYT_PREPAID_RECHARGE_AMOUNT = {
  list: [
    { text: '5,000원', value: 5000, chargeCd: '06'},
    { text: '3,000원', value: 3000, chargeCd: '05' },
    { text: '2,000원', value: 2000, chargeCd: '04' },
    { text: '1,000원', value: 1000, chargeCd: '03' }
  ]
};

Tw.MYT_PREPAID_RECHARGE_DATA_ADD = [
  {
    list: [
      { 'label-attr': 'id="005G12S"', 'radio-attr': 'name="r2" id="005G12S" data-value="5120" data-amount="33000"', txt: '5GB(33,000원)' },
      { 'label-attr': 'id="002G12S"', 'radio-attr': 'name="r2" id="002G12S" data-value="2048" data-amount="19000"', txt: '2GB(19,000원)' },
      { 'label-attr': 'id="001G12S"', 'radio-attr': 'name="r2" id="001G12S" data-value="1024" data-amount="15000"', txt: '1GB(15,000원)' },
      { 'label-attr': 'id="500M12S"', 'radio-attr': 'name="r2" id="500M12S" data-value="500" data-amount="10000"', txt: '500MB(10,000원)' },
      { 'label-attr': 'id="100M12S"', 'radio-attr': 'name="r2" id="100M12S" data-value="100" data-amount="2000"', txt: '100MB(2,000원)' }
    ]
  }
];

Tw.MYT_PREPAID_RECHARGE_DATA = [
  {
    list: [
      { 'label-attr': 'id="004G090"', 'radio-attr': 'name="r2" id="004G090" data-value="4096" data-amount="33000"', txt: '4GB / 90일(33,000원)' },
      { 'label-attr': 'id="002G090"', 'radio-attr': 'name="r2" id="002G090" data-value="2048" data-amount="27500"', txt: '2GB / 90일(27,500원)' },
      { 'label-attr': 'id="002G030"', 'radio-attr': 'name="r2" id="002G030" data-value="2048" data-amount="24200"', txt: '2GB / 30일(24,200원)' },
      { 'label-attr': 'id="001G090"', 'radio-attr': 'name="r2" id="001G090" data-value="1024" data-amount="22000"', txt: '1GB / 90일(22,000원)' },
      { 'label-attr': 'id="001G030"', 'radio-attr': 'name="r2" id="001G030" data-value="1024" data-amount="18700"', txt: '1GB / 30일(18,700원)' },
      { 'label-attr': 'id="300M030"', 'radio-attr': 'name="r2" id="300M030" data-value="300" data-amount="8800"', txt: '300MB / 30일(8,800원)' }
    ]
  }
];

Tw.MYT_PREPAID_DATE = {
  list: [
    { text: '15일', value: 15, chargeCd: '01' },
    { text: '26일', value: 26, chargeCd: '02' }
  ]
};

Tw.MYT_PREPAID_ALARM = {
  title: '선택',
  status_list: [
    { text: '기준 시간으로 알람', value: '1' },
    { text: '잔액 기준으로 알람', value: '2' },
    { text: '설정 안함', value: '0' }
  ],
  category_list: [
    { text: '발신기간', value: '1' },
    { text: '수신기간', value: '2' },
    { text: '번호유지기간', value: '3' }
  ],
  date_list: [
    { text: '1일', value: '1' },
    { text: '2일', value: '2' },
    { text: '3일', value: '3' }
  ],
  price_list: [
    { text: '1,000원', value: '1' },
    { text: '2,000원', value: '2' },
    { text: '3,000원', value: '3' },
    { text: '5,000원', value: '5' }
  ]
};

Tw.PRODUCT_APPS_ORDER = [
  { txt: '최신순', 'radio-attr': 'data-prop="storRgstDtm"' },
  { txt: '추천순', 'radio-attr': 'data-prop="idxExpsSeq"' },
  { txt: '가나다순', 'radio-attr': 'data-prop="prodNm"' }
];

Tw.SUSPEND_RELATION = {
  title: '추가연락처',
  list: [
    { 'option': '', 'attr': 'data-value="부모님"', value: '부모님' },
    { 'option': '', 'attr': 'data-value="형제/자매"', value: '형제/자매' },
    { 'option': '', 'attr': 'data-value="자녀"', value: '자녀' },
    { 'option': '', 'attr': 'data-value="친구"', value: '친구' },
    { 'option': '', 'attr': 'data-value="배우자"', value: '배우자' },
    { 'option': '', 'attr': 'data-value="동료"', value: '동료' },
    { 'option': '', 'attr': 'data-value="기타"', value: '기타' }
  ]
};

Tw.SUSPEND_RELATION = {
  title: '추가연락처',
  list: [
    { 'option': '', 'attr': 'data-value="부모님"', value: '부모님' },
    { 'option': '', 'attr': 'data-value="형제/자매"', value: '형제/자매' },
    { 'option': '', 'attr': 'data-value="자녀"', value: '자녀' },
    { 'option': '', 'attr': 'data-value="친구"', value: '친구' },
    { 'option': '', 'attr': 'data-value="배우자"', value: '배우자' },
    { 'option': '', 'attr': 'data-value="동료"', value: '동료' },
    { 'option': '', 'attr': 'data-value="기타"', value: '기타' }
  ]
};

Tw.PREPAID_HISTORIES = [
  { txt: '음성 충전', 'radio-attr': 'data-type="voice"', 'label-attr': ' ' },
  { txt: '데이터 충전', 'radio-attr': 'data-type="data"', 'label-attr': ' ' }
];

Tw.PREPAID_BADGES = {
  1: { name: '1회', icon: 'auto' },
  2: { name: '자동', icon: 'one' },
  4: { name: '잔액승계', icon: 'succession' }
};

Tw.ANDROID_STORE = [
  {
    'list':[
      {'attr': 'type="button" id="google"', 'img': { src: '/img/common/icon-app-play-store.png', alt: 'google play store' }, 'value': 'Play 스토어'},
      {'attr': 'type="button" id="one"', 'img': { src: '/img/common/icon-app-one-store.png', alt: 'one store' }, 'value':'원스토어'}
    ],
    'btn-floating':[
      {'attr':'type="button"', 'txt':'닫기'}
    ]
  }
];

Tw.ROAMING_MANAGE_TYPE = {
  list:[
      { txt: 'LTE 자동로밍', 'radio-attr': 'id="ra0" name="r2" data-manage-type="L"', 'label-attr': 'id="ra0"', type: 'L' },
      { txt: '3G 자동로밍', 'radio-attr': 'id="ra1" name="r2" data-manage-type="W"', 'label-attr': 'id="ra1"', type: 'W' },
      { txt: '2G 자동로밍', 'radio-attr': 'id="ra2" name="r2" data-manage-type="C"', 'label-attr': 'id="ra2"', type: 'C' },
      { txt: 'GSM 자동로밍', 'radio-attr': 'id="ra3" name="r2" data-manage-type="G"', 'label-attr': 'id="ra3"', type: 'G' },
      { txt: '임대로밍', 'radio-attr': 'id="ra4" name="r2" data-manage-type=""', 'label-attr': 'id="ra4"', type: '' }
  ]
};

Tw.ROAMING_MFACTCD_LIST = {
    list: [
        { txt: '전체', 'radio-attr': 'id="ra0" name="r2" data-mfact-code="ALL" data-mfact-name="전체"', 'label-attr': 'id="ra0"' },
        { txt: '삼성', 'radio-attr': 'id="ra1" name="r2" data-mfact-code="100SS" data-mfact-name="삼성"', 'label-attr': 'id="ra1"' },
        { txt: 'LG', 'radio-attr': 'id="ra2" name="r2" data-mfact-code="100LG" data-mfact-name="LG"', 'label-attr': 'id="ra2"' },
        { txt: '팬택', 'radio-attr': 'id="ra3" name="r2" data-mfact-code="100PT" data-mfact-name="팬택"', 'label-attr': 'id="ra3"' },
        { txt: '애플', 'radio-attr': 'id="ra4" name="r2" data-mfact-code="100CG" data-mfact-name="애플"', 'label-attr': 'id="ra4"' },
        { txt: '기타', 'radio-attr': 'id="ra5" name="r2" data-mfact-code="ETC" data-mfact-name="기타"', 'label-attr': 'id="ra5"' }
    ]
};

Tw.PRODUCT_ROAMING_ORDER = [
  { txt: '추천순', 'radio-attr': 'id="ra0" name="r2" data-oder-name="recommand"', 'label-attr': 'id="ra0"' },
  { txt: '높은 가격순', 'radio-attr': 'id="ra1" name="r2" data-oder-name="highprice"', 'label-attr': 'id="ra1"' },
  { txt: '낮은 가격순', 'radio-attr': 'id="ra2" name="r2" data-oder-name="lowprice"', 'label-attr': 'id="ra2"' }
];

Tw.PHONE_NUMS = [
  {
    list: [
      { option: 'hbs-card', value: '010', attr: 'data-phone="010" data-type="ph"' },
      { option: 'hbs-card', value: '011', attr: 'data-phone="011" data-type="ph"' },
      { option: 'hbs-card', value: '016', attr: 'data-phone="016" data-type="ph"' },
      { option: 'hbs-card', value: '017', attr: 'data-phone="017" data-type="ph"' },
      { option: 'hbs-card', value: '018', attr: 'data-phone="018" data-type="ph"' },
      { option: 'hbs-card', value: '019', attr: 'data-phone="019" data-type="ph"' },
      { option: 'hbs-card', value: '02',  attr: 'data-tel="02" data-type="area"'  },
      { option: 'hbs-card', value: '031', attr: 'data-tel="031" data-type="area"' },
      { option: 'hbs-card', value: '032', attr: 'data-tel="032" data-type="area"' },
      { option: 'hbs-card', value: '033', attr: 'data-tel="033" data-type="area"' },
      { option: 'hbs-card', value: '041', attr: 'data-tel="041" data-type="area"' },
      { option: 'hbs-card', value: '042', attr: 'data-tel="042" data-type="area"' },
      { option: 'hbs-card', value: '043', attr: 'data-tel="043" data-type="area"' },
      { option: 'hbs-card', value: '044', attr: 'data-tel="044" data-type="area"' },
      { option: 'hbs-card', value: '051', attr: 'data-tel="051" data-type="area"' },
      { option: 'hbs-card', value: '052', attr: 'data-tel="052" data-type="area"' },
      { option: 'hbs-card', value: '053', attr: 'data-tel="053" data-type="area"' },
      { option: 'hbs-card', value: '054', attr: 'data-tel="054" data-type="area"' },
      { option: 'hbs-card', value: '055', attr: 'data-tel="055" data-type="area"' },
      { option: 'hbs-card', value: '061', attr: 'data-tel="061" data-type="area"' },
      { option: 'hbs-card', value: '062', attr: 'data-tel="062" data-type="area"' },
      { option: 'hbs-card', value: '063', attr: 'data-tel="063" data-type="area"' },
      { option: 'hbs-card', value: '064', attr: 'data-tel="064" data-type="area"' },
      { option: 'hbs-card', value: '070', attr: 'data-tel="070" data-type="area"' }
    ]
  }
];

Tw.CUSTOMER_SITE_INFO_TYPEA_CHOICE = {
  title: '가려진 정보',
  options:[{
    list:[
      { value: '고객님의 정보를 가리는 이유', attr: 'value="A"', option:'A' },
      { value: '가려진 정보를 보는 방법', attr: 'value="B"', option:'B'}
    ]
  }]
};


Tw.CUSTOMER_SERVICE_INFO_USIM_DEFINE = {
  data:{
    list: [
      {txt: '유심 관련 용어', 'radio-attr': 'name="usimDefineTab" value="1"'},
      {txt: '기기변경 관련 용어', 'radio-attr': 'name="usimDefineTab" value="2"'},
      {txt: '기기 관련 용어', 'radio-attr': 'name="usimDefineTab" value="3"'},
      {txt: '서비스 관련 기타 용어', 'radio-attr': 'name="usimDefineTab" value="4"'}
    ]
  }
};

Tw.LINE_RESITTER_TMPL =
  '{{#each list}}' +
  '<li class="checkbox type01-big fe-item" role="checkbox" aria-checked="false"' +
  ' data-svcMgmtNum="{{svcMgmtNum}}" data-showName="{{showName}}" data-svcNum="{{svcNum}}">' +
  '<input type="checkbox" class="fe-check-child" name="checkbox" value="" title="값1" aria-labelledby="aria-comp-checkbox3"/>' +
  '<div class="comp-list-layout" id="aria-comp-checkbox3" aria-hidden="true">' +
  '<p class="layout-text">' +
  '<span class="mtext">{{showName}}</span>' +
  '<span class="stext"><span class="info">{{showDetail}}</span>{{#if showPet}}<span class="info">{{eqpMdlNm}}</span>{{/if}}</span>' +
  '</p>' +
  '</div>' +
  '</li>' +
  '{{/each}}';


Tw.BANNER_DOT_TMPL = '<span class="blind">{{index}} 선택됨</span>'