Tw.BUTTON_LABEL = {
  CONFIRM: '확인',
  CANCEL: '취소',
  CLOSE: '닫기',
  MORE: '더보기',
  LINE: '회선관리'
};

Tw.POPUP_TITLE = {
  NOTIFY: '알림',
  SELECT_BANK: '은행선택',
  SELECT_AMOUNT: '금액 선택',
  SELECT: '선택',
  SELECT_PAYMENT_OPTION: '납부 방법 선택',
  SELECT_CARD_TYPE: '납부형태 선택',
  SELECT_POINT: '납부포인트 선택',
  SELECT_ACCOUNT: '계좌번호 선택',
  SELECT_PAYMENT_DATE: '요금납부일 선택',
  CHANGE_PAYMENT_DATE: '요금납부일 변경',
  NOT_FAMILY: '리필쿠폰 선물 가능한 가족이 아닙니다.',
  SELECT_CHARGE_TYPE: '충전/선물 유형'
};

Tw.POPUP_CONTENTS = {
  MORE_DETAIL: '더 알아보기',
  REFILL_COUPON_FAMILY: 'SKT 결합상품으로 묶으시면 리필쿠폰 선물이 가능합니다.'
};

Tw.CHART_TYPE = {
  BAR: 'bar',
  BAR_1: 'bar1',
  BAR_2: 'bar2'
};

Tw.CHART_UNIT = {
  WON:'원',
  GB: 'GB',
  TIME: 'time'
};

Tw.PERIOD_UNIT = {
  DAYS: '일',
  HOURS: '시간',
  MINUTES: '분',
  MONTH: '월'
};

Tw.WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

Tw.REFILL_COUPON_CONFIRM = {
  TITLE: '리필 하시겠습니까?',
  CONTENTS: '리필 음성/데이터량은 이번 달까지만 사용 가능합니다.'
};

Tw.REFUND_ACCOUNT_INFO = {
  TITLE: '환불계좌란',
  CONTENTS: '이중납부가 되는 경우 환불계좌로 자동 환불 처리해 드립니다.' + '<br/>' +
    '본인명의의 계좌로만 신청 가능합니다.'
};

Tw.SMS_INFO = {
  TITLE: '문자 발송여부란',
  CONTENTS: '지로납부 및 입금전용계좌납부 고객에게 입금전용계좌 SMS서비스를 제공합니다.' + '<br/><br/>' +
    '문자 발송여부와 입금전용계좌 은행을 선택해 주세요.'
};

Tw.AUTO_PAY_INFO = {
  TITLE: '자동 선결제란',
  CONTENTS: '자동 선결제 신청 시 설정된 금액이 자동으로 선결제됩니다.' + '<br/><br/>' +
  '잔여한도 걱정없이 소액결제를 이용하세요.'
};

Tw.AMOUNT_INFO = {
  TITLE: '금액정보란',
  MICRO_CONTENTS: '기준금액 및 선결제 금액은 이용한도의 최대 90%금액까지 설정이 가능합니다.' + '<br/><br/>' +
  '소액결제 이용금액이 고객님께서 설정한 [기준금액] 초과 시점에 [선결제 금액] 만큼 자동 결제됩니다.',
  CONTENTS_CONTENTS: '기준금액 및 선결제 금액은 이용한도의 최대 90%금액까지 설정이 가능합니다.' + '<br/><br/>' +
  '콘텐츠이용료 이용금액이 고객님께서 설정한 [기준금액] 초과 시점에 [선결제 금액] 만큼 자동 결제됩니다.'
};

Tw.REMNANT_OTHER_LINE = {
  TITLE: '기준회선을 변경하시겠습니까?',
  BTNAME: '변경하기',
  TOAST: '기준회선이 변경되었습니다.'
};

Tw.NON_PAYMENT = {
  SUCCESS: {
    Y: 'Y',
    R: 'R'
  },
  ERROR: {
    P_R: '이미 납부가능일이 등록되어있습니다.',
    S_R: '이미 이용정지가 해제되어있습니다.'
  },
  TOAST: {
    P: '납부가능일이 선택되었습니다.',
    S: '이용정지가 해제되었습니다.'
  },
  SUSPENSION: {
    TITLE: '지금 정지해제를 하시겠습니까?',
    CONTENT_1: '고객님의 미납요금 ',
    CONTENT_2: '원이 내일까지 납부 확인되지 않으면 다시 이용이 정지됩니다.' + '<br/><br/>'+
      '자동납부고객님은 이중인출의 우려가 있으니 통장의 잔고를 비워주시기 바랍니다',
    BTNAME: '해제하기'
  }
};

Tw.MYT_FARE_BILL_GUIDE = {
  DATE_FORMAT: {
    YYYYMM_TYPE: 'YYYY년 MM월'
  },
  FIRST_SVCTYPE: '서비스 전체',
  PHONE_SVCTYPE: '휴대폰',
  PHONE_TYPE_0: '이동전화',
  PHONE_TYPE_1: '휴대폰',
  POP_TITLE_TYPE_0: '조건 변경',
  POP_TITLE_TYPE_1: '납부 방법 선택'
};

Tw.MYT_FARE_BILL_REISSUE_TYPE_CD = {
  'P' : 'P', // T world
  'H' : 'H', // Bill Letter
  'B' : 'B', // 문자
  '2' : '2', // 이메일
  'I' : 'I', // Bill Letter+이메일
  'A' : 'A', // 문자+이메일
  '1' : '1', // 우편
  'Q' : 'Q', // Bill Letter+문자
  // 유선
  'J' : 'J', // Bill Letter
  'K' : 'K'  // Bill Letter+이메일
};

Tw.ALERT_MSG_COMMON = {
  SERVER_ERROR: '통신 오류입니다. 잠시 후 다시 시도해 주세요.'
};

Tw.ALERT_MSG_HOME = {

};

Tw.ALERT_MSG_MYT_DATA = {
  UNSUBSCRIBE_MONTHLY_GIFT: '선택하신 자동 선물 내역을 삭제하시겠습니까?',
  RECHARGE_CANCLE: '충전 취소는 고객센터 [국번 없이 1599-0011(유료) / 휴대폰 114]를 통해 당일에 한해 가능합니다.'
};

Tw.ALERT_MSG_MYT_FARE = {
  COMPLETE_NEW: '신청이 완료되었습니다.',
  COMPLETE_CHANGE: '변경이 완료되었습니다.',
  COMPLETE_CANCEL: '해지가 완료되었습니다.',
  COMPLETE_CHANGE_DATE: '요금납부일 변경이 완료되었습니다.',
  ADD_SVC: {
    BIL0030: '휴대폰 결제 이용동의 후 사용 가능합니다.',
    BIL0033: '휴대폰 결제 차단 고객은 사용이 제한된 메뉴입니다.',
    BIL0034: '법인실사용자 소액결제 부가서비스 가입 후 사용 가능합니다.'
  },
  MICRO: '소액결제',
  CONTENTS: '콘텐츠이용료',
  USABLE: '사용',
  MSG_ALLOWED: '이 혀용되었습니다.',
  MSG_PROHIBITED: '이 차단되었습니다.'
};

Tw.ALERT_MSG_MYT_JOIN = {
  ALERT_2_A61 : { TITLE : '알림' , MSG : '비밀번호를 확인해주세요.' },
  ALERT_2_A62 : { TITLE : '알림' , MSG : '고객보호 비밀번호가 변경되었습니다.' },
  ALERT_2_A63 : { TITLE : '알림' , MSG : '비밀번호가 일치하지 않습니다.' },
  ALERT_2_A64 : { TITLE : '알림' , MSG : '고객보호 비밀번호 설정이 완료 되었습니다.' }
};

Tw.ALERT_MSG_PRODUCT = {

};

Tw.ALERT_MSG_BENEFIT = {

};

Tw.ALERT_MSG_CUSTOMER = {

};

Tw.ALERT_MSG_AUTH = {
  L01: '선택하신 회선을 첫 번째 순서로 지정하시겠습니까?',
  L02: '첫 번째 순서가 변경 되었습니다.',
  L03: '선택하신 회선을 사용 가능 회선 목록으로 이동 시 회선관리 목록에서 삭제됩니다.<br/>삭제 후 다시 사용하시려면 직접 등록하셔야 가능합니다.',
  L04: '번경 내용을 저장하시겠습니까?',
  L05: 'SK텔레콤 이동전화번호가 아니거나 입력하신 정보가 일치하지 않습니다. 다시 입력해 주세요.',
  L06: '이미 다른 계정에 등록된 회선 입니다.',
  L07: '이미 등록된 회선 입니다.'

};

Tw.URL_PATH = {
  OKCASHBAG: 'https://member.okcashbag.com/mb/ocb/searchPass/searchPass/MOCB/687474703A2F2F6d2e6f6b636173686261672e636f6d2F696e6465782e6d6f63623F6c6f67696e3D59',
  BROADBAND: 'http://www.skbroadband.com',
  COP_SERVICE: 'http://b2b.tworld.co.kr/cs/counsel/certServiceInfo.bc',
  CONTETNS_YOUTUBE_HELP_URL: 'https://support.google.com/youtube/contact/commerce_contact?hl=ko&cfsi=subs_red_2',
  CHOCOLATE_MALL: 'http://tmembership.tworld.co.kr/web/html/chocolate/main/ChocoHomeMain.jsp?sel=1',
  '11ST': 'http://www.11st.co.kr/html/main.html',
  DATA_FREE: 'http://www.sktmembership.co.kr/web/html/data/dataFree.jsp',
  MYT_BILL_HISTORY_MICRO: '/myt/bill/history/micro',
  MYT_PAYPASS_CONFIRM: '/myt/bill/history/micro/password',
  MYT_PAYPASS_INFO: '',
  MYT_PAYPASS_SET: '/myt/bill/history/micro/password/set',
  MYT_PAY_MICRO_LIMIT_CHANGE: '/myt/bill/history/micro/limit/change',
  MYT_PAY_MICRO_LIMIT_DETAIL: '/myt/bill/history/micro/limit',
  MYT_PAY_CONTENTS_LIMIT_CHANGE: '/myt/bill/history/contents/limit/change',
  MYT_PAY_CONTENTS_LIMIT_DETAIL: '/myt/bill/history/contents/limit'
};

Tw.PRODUCT_INFINITY_CATEGORY = {
  NA00006114: '여행',
  NA00006115: '영화',
  NA00006116: '스마트워치',
  NA00006117: '클럽'
};

Tw.PRODUCT_INFINITY_CATEGORY_DESC = {
  NA00006114: 'T 로밍 Onepass 월 1회/ 1개월 + 마티나 라운지 이용권 1회/ 3개월',
  NA00006115: '무료영화예매 2회 / 1개월',
  NA00006116: '스마트 워치 월정액 100% 할인',
  NA00006117: '인피니티 클럽 이용료 100%할인'
};

Tw.HOTBILL_UNPAID_TITLE = '미납요금';