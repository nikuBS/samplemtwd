const myTUsageData = {
  'header': {
    'svcType': '서비스구분',
    'svcNum': '서비스번호',
    'svcNickName': '회선닉네임'
  },

  'result': {
    'prodId': '기본요금제ID',
    'prodName': '기본요금제명',
    'dataTopUp': '데이터한도요금제 가입여부',
    'ting': 'Ting요금상품 가입여부',
    'dataDiscount': '24시간데이터50%할인 가입여부',
    'child': [
      {
        'svcNum': '자녀 서비스번호',
        'mdlName': '자녀 단말기 기종명'
      }
    ],

    'data': [
      {
        'skipId': '공제항목ID',
        'skipName': '공제항목명',
        'total': '기본제공량',
        'used': '사용량',
        'remained': '잔여량',
        'unit': '단위코드',
        'couponDate': '쿠폰등록일'
      }
    ],
    'voice': [
      {
        'skipId': '공제항목ID',
        'skipName': '공제항목명',
        'total': '기본제공량',
        'used': '사용량',
        'remained': '잔여량',
        'unit': '단위코드',
        'couponDate': '쿠폰등록일'
      }
    ],
    'sms': [
      {
        'skipId': '공제항목ID',
        'skipName': '공제항목명',
        'total': '기본제공량',
        'used': '사용량',
        'remained': '잔여량',
        'unit': '단위코드',
        'couponDate': '쿠폰등록일'
      }
    ],
    'etc': [
      {
        'skipId': '공제항목ID',
        'skipName': '공제항목명',
        'total': '기본제공량',
        'used': '사용량',
        'remained': '잔여량',
        'unit': '단위코드',
        'couponDate': '쿠폰등록일'
      }
    ]
  }
};

export default myTUsageData;
