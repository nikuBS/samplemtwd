const Wire = {
  'code': '00',
  'msg': 'success',
  'result': {
    'prodId': 'TW20000007',
    'coClCd': 'T',
    'prodDetailLinkYn': 'Y',
    'basFeeAmt': 0,
    'svcScrbDt': '20180808',
    'feeProdNm': 'T_스마트광랜(다이렉트)',
    'liconImgAltCtt': '100Mbps',
    'dcBenefits': [
      {
        'dcEndDt': '99991231',
        'dcOferNm': '서비스정기계약할인',
        'dcObjInvItmTypNm': '기본료',
        'dcCttClCd': '01',
        'dcVal': '8000',
        'penYn': 'Y',
        'dcStaDt': '20130330'
      }
    ]
  }
};

const WireLess = {
  'code': '00',
  'msg': '',
  'result': {
    'useFeePlanPro': {
      'prodId': 'NA00004776',
      'prodNm': 'T 시그니처 Classic(구)',
      'svcProdCd': '1',
      'scrbDt': '20160529',
      'basFeeAreaTxt': '88000',
      'basOfrLtrAmtTxt': '20G',
      'basOfrVcallTmsTxt': '집전화·이동전화 무제한',
      'basDataTxt': '기본제공',
      'prodDispYn': 'Y',
      'goDetailUrl': '',
      'goSetUrl': '',
    },
    'tClassProd': {
      'tClassNm' : 'T클래스 스탠다드',
      'tClassProdList' : [
        {
          'prodId': 'NA00004863',
          'prodNm': 'T클래스 플러스',
          'svcProdCd': '3',
          'scrbDt': '20130225',
          'prodDesc': '스마트폰 도난,분실, 파손 고객에게 단말기 보상 지원금 혜택을 제공하는 보험연계상품',
          'goSetUrl': ''
        },
        {
          'prodId': 'NA00004707',
          'prodNm': 'T나는 OCB포인트',
          'svcProdCd': '3',
          'scrbDt': '20130225',
          'prodDesc': '요금약정할인 금액의 최대 120%를 적립할 수 있는 Okcashbag 상품',
          'goSetUrl': '/normal.do?serviceId=S_ADD_0080&viewId=V_PROD2027&prod_id=NA00004863'
        }
      ],
    }
  }
};

const WirelessEnableAlarm = {
  'code': '00',
  'msg': '',
  'result': {
    'svcNum': '010-123*-123*',
    'notiSchdDt': '20180808',
    'smsStCd': '01',
    'smsStNm': '신청',
    'smsTrmsStNm': '정상',
    'reqDt': '20180808',
    'feeProdNm': 'T시그니처 Classic',
    'lastChgDt': '20180808',
    'prodChgPsblDt': '20180808'
  }
};

const WirelessDisableAlarm = {
  'code': '00',
  'msg': '',
  'result': {
    'svcNum': '010-123*-123*',
    'smsStCd': '03',
    'smsStNm': '해지',
    'lastChgDt': '20180808',
    'prodChgPsblDt': '20180808'
  }
};

const Combinations = {
  '5': {
    'prodId': 'TW20000008',
    'prodNm': 'TB끼리 온가족프리',
    'scrbDt': '20150223',
    'expsOrder': '5',
    'prodSmryDesc': '휴대폰과 초고속인터넷 결합으로 LTE데이터 안심사용, 가족간/SKT 지정회선간 음성문자 무료(월5천분)',
    'items': [
      {
        'icon': 'line',
        'description': '휴대폰'
      },
      {
        'icon': 'multi',
        'description': '1~4'
      }
    ],
    'hasDetail': true
  }
};

export { Combinations, Wire, WireLess, WirelessEnableAlarm, WirelessDisableAlarm };
