Tw.DATA_UNIT = {
  KB: 'KB',
  MB: 'MB',
  GB: 'GB',
  TB: 'TB',
  PB: 'PB'
};

Tw.SMS_UNIT = '건';

Tw.CURRENCY_UNIT = {
  WON: '원',
  TEN_THOUSAND: '만원',
  POINT: '점'
};

Tw.BUTTON_LABEL = {
  CONFIRM: '확인',
  CANCEL: '취소',
  CLOSE: '닫기',
  MORE: '더보기',
  LINE: '회선관리',
  CHANGE : '변경하기'
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
  SELECT_PAYMENT_TYPE: '납부 유형',
  // SELECT_CARD_TYPE: '일시불',
  NOT_FAMILY: '리필쿠폰 선물 가능한 가족이 아닙니다.',
  SELECT_CHARGE_TYPE: '충전/선물 유형',
  SELECT_ORDER: '정렬 기준을 선택해주세요',
  CONFIRM_SHARE: '데이터를 공유 하시겠습니까?'
};

Tw.POPUP_CONTENTS = {
  MORE_DETAIL: '더 알아보기',
  REFILL_COUPON_FAMILY: 'SKT 결합상품으로 묶으시면 리필쿠폰 선물이 가능합니다.',
  CERTIFICATE_SUCCESS: '스마트폰 인증서 내보내기: 성공',
  REFUND_ACCOUNT_SUCCESS: '환불신청 계좌가 등록되었습니다.'
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

Tw.TOAST_TEXT = {
  MYT_FARE_HISTORY_AUTOPAYMENT_BLOCK: '차단 신청이 완료되었습니다.',
  MTY_FARE_HISTORY_AUTOPAYMENT_UNBLOCK: '헤제 신청이 완료되었습니다.'
};

Tw.PERIOD_UNIT = {
  DAYS: '일',
  HOURS: '시간',
  MINUTES: '분',
  MONTH: '월',
  YEAR: '년'
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
  CONTENTS_MICRO: '자동 선결제 신청 시 설정된 금액이 자동으로 선결제됩니다.' + '<br/><br/>' +
  '잔여한도 걱정없이 소액결제를 이용하세요.',
  CONTENTS_CONTENTS: '자동 선결제 신청 시 설정된 금액이 자동으로 선결제됩니다.' + '<br/><br/>' +
  '잔여한도 걱정없이 콘텐츠 이용료를 이용하세요.'
};

Tw.AUTO_PAY_CANCEL = {
  TITLE: '자동 선결제를' + '<br/>' + '해지하시겠습니까?',
  CONTENTS: '자동 선결제가' + '<br/>' + '즉각 해지됩니다.',
  BTN_NAME: '해지하기'
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

Tw.MYT_DATA_TOTAL_SHARING_DATA = {
  USED_DATA_PREFIX: '총 ',
  USED_DATA_SUFFIX: ' 사용',
  JOIN_T_FAMILY_SHARING: 'T가족모아 가입하기'
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

Tw.MYT_FARE_BILL_SET = {
  A41 : {
    TITLE : '요금안내서 유형을 변경하시겠습니까?',
    CONTENTS : '기존에 신청하신 요금안내서는 자동 해지 됩니다.'
  },
  A42 : {
    TITLE : '요금안내서 정보를 변경하시겠습니까?',
    CONTENTS : '변경하기를 누르시면 변경하신 정보가 즉시 적용 됩니다.'
  },
  A43 : {
    TITLE : '요금안내서 유형을 변경하시겠습니까?',
    CONTENTS : '고객님의 이메일로 신청확인 메일이 발송되오니 확인해 주시기 바랍니다.'
  },
  A44 : {
    TITLE : '신청 불가',
    CONTENTS : '선택하신 청구월에 대한 청구서가 이미 재발행 신청 되었습니다.'
  },
  A45 : {
    TITLE : '요금안내서 재발행을 <br/> 신청하시겠습니까?',
    CONTENTS : '선택하신 청구월에 대한 청구서가 재발행 됩니다.'
  }
};

Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME = {
  PASSWORD: '비밀번호',
  CONFIRM_PASSWORD: '비밀번호 확인',
  CHANGE_PASSWORD: '변경할 비밀번호',
  CONFIRM_CHANGE_PASSWORD: '변경할 비밀번호 확인',
  BTN_NEW: '설정하기',
  BTN_CHANGE: '변경하기'
};

Tw.MYT_FARE_PAYMENT_NAME = {
  ACCOUNT: '계좌이체',
  CARD: '체크/신용카드',
  OK_CASHBAG: 'OK캐쉬백',
  T_POINT: 'T포인트',
  PAYMENT: '납부',
  GO_PAYMENT_HISTORY: '납부내역 보기',
  PREPAY: '선결제',
  GO_PREPAY_HISTORY: '선결제내역 보기',
  REQUEST: '신청',
  CHANGE: '변경',
  GO_CHANGE_HISTORY: '변경내역 보기'
};

Tw.ALERT_MSG_COMMON = {
  SERVER_ERROR: '통신 오류입니다. 잠시 후 다시 시도해 주세요.'
};

Tw.ALERT_MSG_HOME = {

};

Tw.ALERT_MSG_MYT_DATA = {
  UNSUBSCRIBE_MONTHLY_GIFT: '선택하신 자동 선물 내역을 삭제하시겠습니까?',
  RECHARGE_CANCLE: '충전 취소는 고객센터 [국번 없이 1599-0011(유료) / 휴대폰 114]를 통해 당일에 한해 가능합니다.',
  JOIN_ONLY_CUSTOMER_CENTER_T: '대리점 방문 또는 고객센터를' + '<br />' + '통해 신청 가능합니다.',
  JOIN_ONLY_CUSTOMER_CENTER_C: '고객센터를 통하여 신청하시면' + '<br />' + '그룹 구성을 동의 할 수 있는 SMS를 ' + '<br />' + '가족 구성원에게 보내드립니다.',
  CALL_CUSTOMER_CENTER: '고객센터 전화하기',
  CONFIRM_SHARE: '공유된 데이터는 취소하실 수 없습니다.',
  A5: '변경 정보가 없습니다.',
  A6: '사용 가능 공유 데이터량 보다 한도가 높게 설정되었습니다. 확인 후 다시 시도해주세요.',
  A7: '{reason}로 실패하였습니다. 잠시 후 다시 시도해주세요.'
};

Tw.VALIDATE_MSG_MYT_DATA = { 
  V16: '공유 가능 데이터를 초과했습니다.',
  V17: '가족에게 공유할 데이터를 입력해주세요.'
}

Tw.ALERT_MSG_MYT_FARE = {
  COMPLETE_NEW: '신청이 완료되었습니다.',
  COMPLETE_CHANGE: '변경이 완료되었습니다.',
  COMPLETE_CANCEL: '해지가 완료되었습니다.',
  COMPLETE_CHANGE_DATE: '요금납부일 변경이 완료되었습니다.',
  COMPLETE_CHANGE_LIMIT: '한도변경이 완료되었습니다.',
  COMPLETE_CHANGE_PASSWORD: '결제 비밀번호 변경이 완료되었습니다.',
  NOT_ALLOWED_CHANGE_LIMIT: '한도 변경이 불가능합니다',
  NOT_ALLOWED_INFO_MESSAGE: '연체/미납 중인 고객님은 납부 후' + '<br/>' + '한도변경이 가능합니다.',
  GO_PAYMENT: '납부하러 가기',
  ADD_SVC: {
    BIL0030: '휴대폰 결제 이용동의 후 사용 가능합니다.',
    BIL0030_C: 'SK텔레콤이 제공하는 통신과금서비스를 <br/> 이용하기 위한 사전 동의 무료 부가 서비스입니다.',
    BIL0033: '휴대폰 결제 차단 고객은 사용이 제한된 메뉴입니다.',
    BIL0033_C: '차단 해제를 원하시는 고객님은 <br/> 고객센터 [국번없이1599-0590]로 <br/> 문의해 주세요.',
    BIL0034: '법인실사용자 소액결제 부가서비스 가입 후 사용 가능합니다.',
    BIL0034_C: '가까운 지점/대리점에 방문하셔서 <br/> 가입가능 합니다.<br/>(신청자 본인 신분증 지참)',
    MORE: '더 알아보기'
  },
  MICRO: '소액결제',
  CONTENTS: '콘텐츠이용료',
  USABLE: '사용',
  MSG_ALLOWED: '이 혀용되었습니다.',
  MSG_PROHIBITED: '이 차단되었습니다.',
  V18 : '휴대폰번호 자릿수를 확인해주세요. (10~11자리)',
  V21 : '이메일 주소가 올바르지 않습니다.',
  V41 : '법정대리인 휴대폰번호를 입력해주세요.',
  V42 : '이메일 주소를 입력해주세요.',
  V43 : '우편 주소를 입력해주세요.',
  V44 : '휴대폰 번호가 올바르지 않습니다.'
};

Tw.ALERT_MSG_MYT_JOIN = {
  ALERT_2_A39 : { TITLE : '알림' , MSG : '요금제 변경 알림 서비스가 신청 되었습니다.' },
  ALERT_2_A40 : { TITLE : '알림' , MSG : '요금제 변경 가능일 알림이 해지 되었습니다.' },
  ALERT_2_A61 : { TITLE : '알림' , MSG : '비밀번호를 확인해주세요.' },
  ALERT_2_A62 : { TITLE : '알림' , MSG : '고객보호 비밀번호가 변경되었습니다.' },
  ALERT_2_A63 : { TITLE : '알림' , MSG : '비밀번호가 일치하지 않습니다.' },
  ALERT_2_A64 : { TITLE : '알림' , MSG : '고객보호 비밀번호 설정이 완료 되었습니다.' }
};

Tw.ALERT_MSG_PRODUCT = {
  ALERT_3_A1 : { TITLE : '알림', MSG : '선택하신 상품 가입을 취소하시겠습니까?', BUTTON : '계속하기' },
  ALERT_3_A2 : { TITLE : '가입 시 유의사항을 모두 확인 하였으며,\n선택하신  상품으로 가입하시겠습니까?', MSG : '사용중인 요금제는 자동 해지되며, 1개월동안 다른 상품으로 가입하실 수 없습니다.', BUTTON: '가입하기' },
  ALERT_3_A4 : { TITLE : '해지 시 유의사항을 모두 확인 하였으며,\n선택하신  상품을 해지하시겠습니까?', MSG : '', BUTTON: '해지하기' },
  ALERT_3_A5 : { TITLE : '선택한 회선을 해지하시겠습니까?', MSG: '해지하시면, 해당 회선은 서비스 이용이 불가합니다.', BUTTON: '해지하기' },
  ALERT_3_A7 : { TITLE : '알림', MSG : '지정번호 5회선 모두 등록되었습니다. 기존 신청된 회선 해지 후 추가 신청할 수 있습니다.' },
  ALERT_3_A8 : { TITLE : '알림', MSG : '지정번호 3회선 모두 등록되었습니다. 기존 신청된 회선 해지 후 추가 신청할 수 있습니다.' },
  ALERT_3_A9 : { TITLE : '알림', MSG : '결합회선 4회선 모두 등록되었습니다. 기존 신청된 회선 해지 후 추가 신청할 수 있습니다.' },
  ALERT_3_A10 : { TITLE : '알림', MSG: '1회선만 결합된 경우, 회선 해지가 불가합니다.' },
  ALERT_3_A16: { TITLE: '알림', MSG : '확인을 누르시면 선택된 필터가 해제되고 선택한 태그의 결과페이지로 이동합니다' },
  ALERT_3_A18: { TITLE: '알림', MSG : '검색 결과가 없습니다' },
  ALERT_FRONT_DUPLICATE: { TITLE : '알림', MSG : '현재 사용중인 옵션과 동일한 옵션을 선택하였습니다. 변경할 옵션을 선택해주세요.' },
  ALERT_FRONT_VALIDATE_NUM: { TITLE : '알림', MSG : '올바른 회선 번호를 입력해주세요.' }
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

Tw.MYT_DATA_CANCLABLE_CHARGE_ALERT = '충전 취소는 고객센터 [국번 없이 1599-0011(유료) / 휴대폰 114]를 통해 당일에 한해 가능합니다.';

Tw.MYT_FARE_HISTORY_MICRO_TYPE = {
  Y: '무선',
  N: 'Web'
};

Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TYPE = {
  A0: '차단중',
  A1: '다음 달 차단예정',
  C1: '다음 달 해제예정'
};

Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TOAST = {
  BLOCK: '차단 신청이 완료되었습니다.',
  REVOCATION: '해제 신청이 완료되었습니다.'
};

Tw.PRODUCT_CTG_NM = {
  PLANS: '요금제',
  ADDITIONS: '부가서비스'
};

Tw.PRODUCT_TYPE_NM = {
  JOIN: '가입',
  SETTING: '변경',
  TERMINATE: '해지'
};

Tw.PRODUCT_JOIN_SETTING_AREA_CASE = {
  LINE: '회선',
  MV_02_02_01: '결합회선',
  MP_02_02_03_05: '결합회선',
  MP_02_02_03_11: '공유회선'
};

Tw.MYT_FARE_HISTORY_PAYMENT = {
  CANCEL_AUTO_WITHDRAWAL: '자동납부 통합 인출해지 신청 되었습니다.'
};

Tw.INFO = {
  MYT : {
    TDATA_SHARE: {
      DC_01_01_TITLE: 'T데이터셰어링 기본제공 데이터 사용량',
      DC_01_01_CONTENTS: '올인원 요금제 등 기본으로 데이터를 제공하는 요금제를 이용하는 고객님 중 제한된 USIM의 데이터 정보만 노출합니다.'
    },
    DISCOUNT: {
      DC_01_01_TITLE: '50% 할인제공 대상 데이터는',
      DC_01_01_CONTENTS: '기본요금상품 및 무료로 제공되는 데이터 제공량에 한합니다. <br />' +
      '대상 데이터 : 각 요금상품 별 데이터 기본 제공량, T끼리 데이터 선물하기 및 데이터 리필하기 서비스로 받은 데이터 제공량, 눝 데이터 생성하기, T가족혜택 데이터 생성하기'
    },
    USAGE_TING: {
      DC_01_01_TITLE: '통화가능 금액이란?',
      DC_01_01_CONTENTS: '팅요금상품 가입 시 선택하신 상한금액에서 기본료를 제외한 나머지 금액입니다.\n' +
        '예) 팅 100요금상품의 경우, 상한 2만원 선택 시 통화 가능 금액은 7,500원입니다.\n' +
        '상한(20,000원) – 기본료(12,500원) = 7,500원\n'
    }
  }
};

Tw.URL_PATH = {
  OKCASHBAG: 'https://member.okcashbag.com/mb/ocb/searchPass/searchPass/' + '' +
  'MOCB/687474703A2F2F6d2e6f6b636173686261672e636f6d2F696e6465782e6d6f63623F6c6f67696e3D59',
  SET_PASSWORD: 'http://www.tworld.co.kr/normal.do?serviceId=S_PROD2001&viewId=V_PROD2001&prod_id=NA00003909',
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

Tw.SETTINGS_MENU = {
  LATEST: '최신'
};

Tw.NTV_FIDO_REGISTER_TXT = {
  FINGER_ON: '등록된 지문이 있습니다.',
  FINGER_OFF: '등록된 지문이 없습니다.',
  FACE_ON: '등록된 Face ID가 있습니다.',
  FACE_OFF: '등록된 Face ID가 없습니다.'
};

Tw.JOIN_INFO_NO_AGREEMENT = {
  CHANGE_TYPE : {
    '1' : '사용',
    '2' : '적립',
    '3' : '소멸'
  },
  NO_USE : '포인트 사용 내역이 없습니다.',
  NO_DATA : '검색된 포인트 사용 내역이 없습니다.'
};

Tw.MYT_DATA_FAMILY_TOAST = {
  SUCCESS_CHANGE: '변경되었습니다.'
}

Tw.MYT_DATA_FAMILY_CONFIRM_SHARE = {
  TITLE: '데이터를 공유 하시겠습니까?',
  CONTENTS: '공유된 데이터는 취소하실 수 없습니다.',
  BTN_NAME: '공유하기'
}

Tw.MYT_DATA_FAMILY_CONFIRM_SHARE_MONTHLY = {
  TITLE: '매월 자동으로 데이터를 공유 하시겠습니까?',
  CONTENTS: '다음달부터 자동 공유되며, 이번 달 안으로 변경이 가능합니다.',
  BTN_NAME: '변경하기'
}

Tw.MYT_DATA_FAMILY_DELETE_SHARE_MONTHLY = {
  TITLE: '자동공유를 그만 하시겠습니까?',
  CONTENTS: '다음달부터 자동 공유가 해지되며, 이번 달 안으로 변경이 가능합니다.',
  BTN_NAME: '그만하기'
}

Tw.MYT_PAYMENT_HISTORY_HASH = {
  OVERPAY_REFUND: 'overpay-refund',
  AUTO_WITHDRAWAL: 'auto-withdrawal',
  BILL_RESEND_BY_FAX: 'by-fax',
  BILL_RESEND_BY_EMAIL: 'by-email'
}
