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
  CUSTOMER_SERVICE_INFO_CHOICE : [
    {
      title: '휴대폰 가입',
      options: [
        { title:'', checked: false, value: '3280', text: '휴대폰 가입'},
        { title:'', checked: false, value: '3305', text: '단말기 자급제도'},
        { title:'', checked: false, value: '3304', text: '번호이동'},
        { title:'', checked: false, value: '3308', text: '번호 관리 제도'}]
    },
    {
      title: '미성년자 가입',
      options: [
        { title:'', checked: false, value: '3306', text: '미성년자 가입'},
        { title:'', checked: false, value: '3307', text: '미성년자 보호 서비스'}]
    },
    {
      title: 'USIM 변경',
      options: [
        { title:'', checked: false, value: '', text: 'USIM 잠금헤제'},
        { title:'', checked: false, value: '', text: '내 USIM으로 SKT단말기 사용'},
        { title:'', checked: false, value: '', text: '내 USIM으로 타사 단말기 사용'},
        { title:'', checked: false, value: '', text: '타사 USIM으로 SKT단말기 사용'}]
    },
    {
      title: '데이터 요금',
      options: [
        { title:'', checked: false, value: '231', text: '데이터 요금 안내'},
        { title:'', checked: false, value: '3319', text: '데이터 이용 유의사항'}]
    },
    {
      title: '다이렉트샵 이용안내',
      options: [
        { title:'', checked: false, value: '', text: '할인/혜택'},
        { title:'', checked: false, value: '', text: '구매'},
        { title:'', checked: false, value: '', text: '배송/개통'}]
    },
    {
      title: '멤버십 이용안내',
      options: [
        { title:'', checked: false, value: '3719', text: '멤버십 이용'},
        { title:'', checked: false, value: '3720', text: '초콜릿 이용'},
        { title:'', checked: false, value: '3721', text: '모바일 T 멤버십'}]
    },
    {
      title: 'T끼리 데이터 선물하기',
      options: [
        { title:'', checked: false, value: '3723', text: 'T끼리 데이터 선물하기'},
        { title:'', checked: false, value: '3724', text: 'T끼리 자동선물 신청'}]
    },
    {
      title: 'ARS상담 이용안내',
      options: [
        { title:'', checked: false, value: '', text: '버튼식 ARS'},
        { title:'', checked: false, value: '', text: '보이는 ARS'},
        { title:'', checked: false, value: '', text: '음성인식 ARS'}]
    },
    {
      title: '목소리인증 이용안내',
      options: [
        { title:'', checked: false, value: '', text: '목소리 인증'},
        { title:'', checked: false, value: '', text: '목소리 등록 문자받기'}]
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
      'list':[
        {'value':'<button class="fe-auto">자동납부</button>', 'text1':'신청'}
      ]
    },
    {
      'type':'요금 납부',
      'list':[
        {'value':'<button class="fe-account">계좌이체 납부</button>'},
        {'value':'<button class="fe-card">체크/신용카드 납부</button>'},
        {'value':'<button class="fe-point">OK캐쉬백/T포인트 납부</button>'}
      ]
    },
    {
      'list':[
        {'value':'<button class="fe-sms">입금전용계좌 SMS 신청</button>',
          'explain':'입금전용계좌 정보를 SMS로 전송합니다.\n' +
          '자동납부 인출 중이 아닌 경우에만 이용 가능합니다.\n'}
      ]
    }
  ]
};
