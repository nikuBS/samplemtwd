export const DATA_SUBMAIN_MOCK = {
  BFF_06_0001: {
    'code': '00',
    'msg': 'success',
    'result': [{
      'copnIsueNum': 'AAA000000502151993',
      'copnNm': '장기가입쿠폰',
      'copnOperStCd': 'A10',
      'copnIsueDt': '20180101',
      'usePsblStaDt': '20180101',
      'usePsblEndDt': '20180130'
    }]
  },
  BFF_06_0002: {
    'code': '00',
    'msg': 'success',
    'result': [{
      'copnIsueNum': 'AAA000000502151993',
      'copnNm': '장기가입쿠폰',
      'copnUseDt': '20160106',
      'copnDtlClCd': 'AAA20',
      'copnDtlClNm': '음성 20%'
    }]
  },
  BFF_06_0003: {
    'code': '00',
    'msg': 'success',
    'result': [{
      'copnIsueNum': 'AAA000000502151993',
      'copnNm': '장기가입쿠폰',
      'svcNum': '01023**65**',
      'copnOpDt': '20180524',
      'usePsblStaDt': '20180101',
      'usePsblEndDt': '20181231',
      'type': '1'
    }]
  },
  BFF_06_0015: {
    'code': '00',
    'msg': 'success',
    'result': {
      'dataGiftCnt': '1',
      'familyMemberYn': 'Y',
      'familyDataGiftCnt': '2',
      'goodFamilyMemberYn': 'Y'
    }
  },
  BFF_06_0018: {
    'code': '00',
    'msg': 'success',
    'result': [
      {
        'opDt': '20170701',
        'dataQty': '1024',
        'custNm': '김*진',
        'svcNum': '01062**50**',
        'type': '1',
        'giftType': 'GC'
      }
    ]
  },
  BFF_06_0020: {
    'code': '00',
    'msg': 'success',
    'result':
      {
        'transferableAmt': '20000'
      }
  },
  BFF_06_0026: {
    'code': '00',
    'msg': 'success',
    'result': [{
      'opDt': '20180508',
      'opTypCd': '2',
      'opTypNm': '후불선물충전',
      'amt': '1000',
      'svcNum': '01062**50**',
      'custNm': '홍*동'
    }]
  },
  BFF_06_0028: {
    'code': '00',
    'msg': 'success',
    'result': {
      'blockYn': 'Y',
      'currentTopUpLimit': '15000',
      'regularTopUpYn': 'Y',
      'regularTopUpAmt': '5000'
    }
  },
  BFF_06_0032: {
    'code': '00',
    'msg': 'success',
    'result': [{
      'opDt': '20180623',
      'amt': '2000',
      'opTypCd': '1',
      'opTypNm': '후불충전',
      'refundableYn': 'Y'
    }]
  },
  BFF_06_0034: {
    'code': '00',
    'msg': 'success',
    'result': {
      'blockYn': 'N',
      'currentTopUpLimit': '20000',
      'regularTopUpYn': 'Y',
      'regularTopUpAmt': '1000',
      'dataLimitedTmthYn': 'Y',
      'dataLimitedYn': 'Y'
    }
  },
  BFF_06_0042: {
    'code': '00',
    'msg': 'success',
    'result': [{
      'opDt': '20180627',
      'amt': '10000',
      'opTypCd': '',
      'opTypNm': '후불충전',
      'opOrgNm': '모바일 Tworld'
    }]
  },
  BFF_06_0044: {
    code: '00',
    msg: 'success',
    result: {
      total: '0',
      used: '25',
      remained: '-25',
      adultYn: 'Y',
      mbrList: [
        {
          svcNum: '01062**94**',
          svcMgmtNum: '1451646217',
          custNm: '한*남',
          repYn: 'Y',
          prodId: 'NA00005958',
          prodNm: '패밀리',
          used: '0',
          shrblYn: 'Y',
          shared: '0',
          limitedYn: 'N',
          limitation: ''
        },
        {
          svcNum: '01055**08**',
          svcMgmtNum: '7228453341',
          custNm: '박*심',
          repYn: 'N',
          prodId: 'NA00005955',
          prodNm: '스몰',
          used: '0',
          shrblYn: 'N',
          shared: '0',
          limitedYn: 'N',
          limitation: ''
        },
        {
          svcNum: '01089**08**',
          svcMgmtNum: '7246046409',
          custNm: '한*진',
          repYn: 'N',
          prodId: 'NA00005627',
          prodNm: '주말엔 팅 세이브',
          used: '25',
          shrblYn: 'N',
          shared: '0',
          limitedYn: 'N',
          limitation: ''
        }
      ]
    }
  },
  BFF_06_0045: {
    code: '00',
    msg: 'success',
    result: {
      tFmlyShrblQty: '30',
      totShrblQty: '40',
      reqCnt: '1',
      nextReqYn: 'Y'
    }
  },
  BFF_06_0047: {
    code: '00',
    msg: 'success',
    result: {
      shrblData: '20',
      regularShrYn: 'Y',
      regularShrData: '20'
    }
  },
  BFF_05_0091: {
    'code': '00',
    'msg': 'success',
    'result': {
      'data': [{
        'invMth': '201807',
        'totalUsage': '158685',
        'basOfrUsage': '0',
        'basOfrQty': '0',
        'unlmtType': '2'
      }],
      'voice': [{
        'invMth': '201807',
        'totalUsage': '9273',
        'basOfrUsage': '0',
        'basOfrQty': '0',
        'unlmtType': '2',
        'inNetCallUsage': '10000',
        'outNetCallUsage': '5550',
        'videoCallUsage': '360'
      }],
      'sms': [{
        'invMth': '201807',
        'totalUsage': '0',
        'basOfrUsage': '0',
        'basOfrQty': '0',
        'unlmtType': '2'
      }]
    }
  }
};

export const FARE_SUBMAIN_MOCK = {
  BFF_05_0020: {
    'code': '00',
    'msg': 'success',
    'result': {
      'avgInvAmt': '-347,414',
      'avgDeduckInvAmt': '-4',
      'recentUsageList': [
        {
          'invDt': '201807',
          'invAmt': '42,110',
          'deduckInvAmt': '-1'
        },
        {
          'invDt': '201806',
          'invAmt': '43,620',
          'deduckInvAmt': '-9'
        },
        {
          'invDt': '201805',
          'invAmt': '49,710',
          'deduckInvAmt': '-5'
        },
        {
          'invDt': '201804',
          'invAmt': '47,750',
          'deduckInvAmt': '-6'
        },
        {
          'invDt': '201803',
          'invAmt': '49,570',
          'deduckInvAmt': '-1'
        },
        {
          'invDt': '201802',
          'invAmt': '49,570',
          'deduckInvAmt': '-9'
        },
        {
          'invDt': '201801',
          'invAmt': '49,570',
          'deduckInvAmt': '-1'
        }
      ]
    }
  },
  BFF_05_0021: {
    'code': '00',
    'msg': 'success',
    'result': {
      'avgInvAmt': '-347,414',
      'avgDeduckInvAmt': '-4',
      'recentUsageList': [
        {
          'invDt': '201807',
          'invAmt': '42,110',
          'deduckInvAmt': '-1'
        },
        {
          'invDt': '201806',
          'invAmt': '43,620',
          'deduckInvAmt': '-9'
        },
        {
          'invDt': '201805',
          'invAmt': '49,710',
          'deduckInvAmt': '-5'
        },
        {
          'invDt': '201804',
          'invAmt': '47,750',
          'deduckInvAmt': '-6'
        },
        {
          'invDt': '201803',
          'invAmt': '49,570',
          'deduckInvAmt': '-1'
        },
        {
          'invDt': '201802',
          'invAmt': '49,570',
          'deduckInvAmt': '-9'
        },
        {
          'invDt': '201801',
          'invAmt': '49,570',
          'deduckInvAmt': '-1'
        }
      ]
    }
  },
  BFF_05_0022: {
    'code': '00',
    'msg': 'success',
    'result': {
      'gubun': 'G',
      'term': '2018.11.1.~2018.11.20.',
      'prevMonth': '9',
      'currMonth': '10',
      'childYn': 'N',
      'hotBillInfo': [
        {
          'recCnt1': '00007',
          'recCnt2': '00000',
          'totOpenBal1': '0',
          'totOpenBal2': '52,680',
          'totDedtBal1': '0',
          'totDedtBal2': '0',
          'record1': [
            {
              'billItmLclNm': '통신서비스요금',
              'billItmSclNm': '월정액',
              'billItmNm': '월정액',
              'invAmt1': '0',
              'invAmt2': '18,964'
            },
            {
              'billItmLclNm': '통신서비스요금',
              'billItmSclNm': '국내통화료',
              'billItmNm': '음성통화료',
              'invAmt1': '0',
              'invAmt2': '33,200'
            },
            {
              'billItmLclNm': '통신서비스요금',
              'billItmSclNm': '요금할인',
              'billItmNm': '선택약정할인',
              'invAmt1': '0',
              'invAmt2': '-4,742'
            },
            {
              'billItmLclNm': '통신서비스요금',
              'billItmSclNm': '부가가치세(세금)*',
              'billItmNm': '부가세총액*',
              'invAmt1': '0',
              'invAmt2': '5,238'
            },
            {
              'billItmLclNm': '통신서비스요금',
              'billItmSclNm': '부가가치세(세금)*',
              'billItmNm': '선택약정할인 부가세*',
              'invAmt1': '0',
              'invAmt2': '-475'
            },
            {
              'billItmLclNm': '부가사용금액',
              'billItmSclNm': '부가서비스이용료',
              'billItmNm': '콜키퍼',
              'invAmt1': '0',
              'invAmt2': '225'
            },
            {
              'billItmLclNm': '부가사용금액',
              'billItmSclNm': '부가서비스이용료',
              'billItmNm': '폰세이프IV A 파손*',
              'invAmt1': '0',
              'invAmt2': '270'
            }
          ]
        }

      ],
      'childList': [
        {
          'svcNum': '01053**29**',
          'svcMgmtNum': '7285919670',
          'prodNm': '쿠키즈 스마트',
          'childEqpMdNm': 'SM-J530SP'
        },
        {
          'svcNum': '01053**35**',
          'svcMgmtNum': '7270446005',
          'prodNm': '쿠키즈 스마트',
          'childEqpMdNm': 'LG-F770S'
        }

      ]
    }
  },
  BFF_05_0030: {
    'code': '00',
    'msg': 'success',
    'result': {
      'unPaidAmtMonthInfoList': {
        'unPaidInvDt': '20170930',
        'unPaidAmt': '590090'
      },
      'unPaidTotSum': '80000'
    }
  },
  BFF_05_0036: {
    'code': '00',
    'msg': 'success',
    'result': {
      'selSvcMgmtNum': '',
      'acntNum': '6138672678',
      'custNum': '8007460892',
      'invDt': '20180731',
      'invDtArr': [
        '20180731',
        '20180630',
        '20180531',
        '20180430',
        '20180331',
        '20180228'
      ],
      'useAmtTot': '175180',
      'deduckTotInvAmt': '-24205',
      'detailYn': 'N',
      'autopayYn': 'Y',
      'repSvcYn': 'Y',
      'coClCd': 'T',
      'paidAmtMonthSvcCnt': 1,
      'paidAmtMonthCnt': '6',
      'paidAmtMonthSvcNum': [
        {
          'svcMgmtNum': '7223983307',
          'name': '이동전화(01062**64**)'
        }
      ],
      'paidAmtDetailInfo': [
        {
          'billItmLclNm': '통신서비스요금',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '월정액',
          'ibilItmCreMclAmt': '69000',
          'billItmNm': '월정액',
          'invAmt': '69000',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '통신서비스요금',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '요금할인',
          'ibilItmCreMclAmt': '-24205',
          'billItmNm': '단말보험 멤버십할인*',
          'invAmt': '-3700',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '통신서비스요금',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '요금할인',
          'ibilItmCreMclAmt': '-24205',
          'billItmNm': '척척할인_11번가*',
          'invAmt': '-1250',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '통신서비스요금',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '요금할인',
          'ibilItmCreMclAmt': '-24205',
          'billItmNm': '선택약정할인',
          'invAmt': '-17250',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '통신서비스요금',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '요금할인',
          'ibilItmCreMclAmt': '-24205',
          'billItmNm': 'TB끼리 TV플러스할인',
          'invAmt': '-2000',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '통신서비스요금',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '요금할인',
          'ibilItmCreMclAmt': '-24205',
          'billItmNm': '원단위조정금액*',
          'invAmt': '-5',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '통신서비스요금',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '부가가치세(세금)*',
          'ibilItmCreMclAmt': '5205',
          'billItmNm': '부가세총액*',
          'invAmt': '7130',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '통신서비스요금',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '부가가치세(세금)*',
          'ibilItmCreMclAmt': '5205',
          'billItmNm': '할인부가세*',
          'invAmt': '-200',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '통신서비스요금',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '부가가치세(세금)*',
          'ibilItmCreMclAmt': '5205',
          'billItmNm': '선택약정할인 부가세*',
          'invAmt': '-1725',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '부가사용금액',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '부가서비스이용료',
          'ibilItmCreMclAmt': '6000',
          'billItmNm': '컬러링',
          'invAmt': '900',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '부가사용금액',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '부가서비스이용료',
          'ibilItmCreMclAmt': '6000',
          'billItmNm': '안전결제 프리미엄',
          'invAmt': '500',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '부가사용금액',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '부가서비스이용료',
          'ibilItmCreMclAmt': '6000',
          'billItmNm': '퍼펙트S A Plan*',
          'invAmt': '3700',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '부가사용금액',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '부가서비스이용료',
          'ibilItmCreMclAmt': '6000',
          'billItmNm': '휴대폰인증서서비스',
          'invAmt': '900',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '부가사용금액',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '콘텐츠이용료(#)',
          'ibilItmCreMclAmt': '14190',
          'billItmNm': '구글플레이콘텐츠*',
          'invAmt': '14190',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '부가사용금액',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '소액결제(#)',
          'ibilItmCreMclAmt': '7900',
          'billItmNm': '소액결제_페이레터*',
          'invAmt': '7900',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '단말기할부금',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '분할상환금',
          'ibilItmCreMclAmt': '97090',
          'billItmNm': '단말기분할상환금*',
          'invAmt': '90560',
          'svcInfoNm': '01062**64**'
        },
        {
          'billItmLclNm': '단말기할부금',
          'billItmSclNm': '',
          'svcNm': '이동전화',
          'coClNm': 'SKT',
          'ibilItmCreMclNm': '분할상환금',
          'ibilItmCreMclAmt': '97090',
          'billItmNm': '단말분할상환수수료*',
          'invAmt': '6530',
          'svcInfoNm': '01062**64**'
        }
      ]
    }
  },
  BFF_05_0038: {
    'code': '00',
    'msg': 'success',
    'result': {
      'totalCount': 1,
      'donationList': [
        {
          'svcMgmtNum': '7271265744',
          'billTcDt': '20161201',
          'billTCTm': '223513',
          'sponCoArsNum': '0608007****',
          'sponCoNmInfo': '후원금',
          'sponAmt': 2000
        }
      ],
      'totSponAmt': 2000
    }
  },
  BFF_05_0047: {
    'code': '00',
    'msg': 'success',
    'result': {
      svcMgmtNum: '7033115182',
      invDt: '20170930',
      invDtArr: [
        '20170930',
        '20170831',
        '20170731',
        '20170630',
        '20170531',
        '20170430'
      ],
      useAmtTot: '75510',
      deduckTotInvAmt: '-22055',
      unPayAmt: '99820',
      useAmtMonthCnt: 6,
      useAmtDetailInfo: [{
        billItmLclNm: '',
        billItmSclNm: '',
        svcNm: '휴대폰',
        coClNm: 'SKT',
        ibilItmCreMclNm: '',
        ibilItmCreMclAmt: '',
        billItmNm: '',
        invAmt: '',
        repSvcNm: '010-12**-34**'
      }],
      unPayAmtList: [{
        invDt: '20170930',
        comBat: '99820'
      }]

    }
  },
  BFF_05_0058: {
    'code': '00',
    'msg': 'success',
    'result': {
      'custNm': '전*득',
      'feeProdId': 'NA00003895',
      'feeProdNm': 'T끼리 35',
      'coClCd': 'T',
      'payMthdCd': '01',
      'payMthdNm': '은행자동납부',
      'bankCardNum': '***********',
      'bankCardCo': '****',
      'billTypeCd': '1',
      'billTypeNm': '기타(우편 요금)',
      'dpstCardOwnrNm': '전*득',
      'eMail': 'gude************',
      'cntcNum': '001**11*****',
      'cntcAddr': null
    }
  },
  BFF_07_0017: {
    'code': '00',
    'msg': 'success',
    'result': {
      'svcNum': '01044061324',
      'selectMonth': {
        '201712': '2017년 12월',
        '201801': '2018년 01월',
        '201802': '2018년 02월',
        '201803': '2018년 03월',
        '201804': '2018년 04월',
        '201805': '2018년 05월',
        '201806': '2018년 06월'
      },
      'selectQuarter': {
        '20174': '2017년 4분기',
        '20181': '2018년 1분기',
        '20182': '2018년 2분기'
      },
      'selectHalf': {
        '20172': '2017년 하반기',
        '20181': '2018년 상반기'
      },
      'splyPrcLong': 97600,
      'vatAmtLong': 9760,
      'totAmtLong': 107360,
      'taxReprintList': [
        {
          'taxBillIsueDt': '20180310',
          'taxBillIsuNum': '000520645684',
          'ctzBizNum': '1160614738',
          'splyBizNum': '1048137225',
          'splyPrc': 48800,
          'vatAmt': 4880,
          'totAmt': 53680
        },
        {
          'taxBillIsueDt': '20180508',
          'taxBillIsuNum': '000523864955',
          'ctzBizNum': '1160614738',
          'splyBizNum': '1048137225',
          'splyPrc': 48800,
          'vatAmt': 4880,
          'totAmt': 53680
        }
      ]
    }
  },
  BFF_07_0030: {
    'code': '00',
    'msg': 'success',
    'result': {
      'rfndTotAmt': '82500',
      'ovrPayCnt': '3',
      'refundPaymentRecord': [
        {
          'rfndBankNm': '국민은행',
          'rfndBankNum': '12345678901',
          'rfndReqDt': '20180512',
          'ovrPay': '1200',
          'rfndObjAmt': '0',
          'sumAmt': '1200',
          'msg': '...송금중 금액...',
          'rfndStat': 'ING'
        }],
      'paymentRecord': [{
        'invAmt': '18800',
        'opDt': '20180510',
        'payAmt': '43390',
        'payMthdCd': 'A0',
        'payMthdCdNm': '대리점 납부',
        'overPayYn': 'Y',
        'invDt': '20170331'
      },
        {
          'invAmt': '49030',
          'opDt': '20180328',
          'payAmt': '49030',
          'payMthdCd': '20',
          'payMthdCdNm': 'Tworld 납부',
          'overPayYn': 'Y',
          'invDt': '20170331'
        },
        {
          'invAmt': '18800',
          'opDt': '20180314',
          'payAmt': '-18800',
          'payMthdCd': 'A0',
          'payMthdCdNm': '대리점 납부',
          'overPayYn': 'Y',
          'invDt': '20170331'
        }],
      'overPaymentRecord': [{
        'svcBamt': '27000',
        'opDt': '20180523',
        'bamtClCd': 'A01',
      }]
    }
  },
  BFF_07_0072: {
    'code': '00',
    'msg': 'success',
    'result': {
      'autoChrgStCd': 'U',
      'autoChrgAmt ': '10000',
      'autoChrgStrdAmt': '10000',
      'cardNum': '12334******',
      'cardCdNm': '신한카드',
    }
  },
  BFF_07_0072_E1: {
    'code': 'BIL0030',
    'msg': '휴대폰 결제 이용동의 후 사용 가능한 메뉴입니다.'
  },
  BFF_07_0072_E2: {
    'code': 'BIL0031',
    'msg': '미성년자는 이용할 수 없습니다.'
  },
  BFF_07_0072_E3: {
    'code': 'BIL0033',
    'msg': '휴대폰 결제 차단 고객은 사용이 제한된 메뉴입니다.'
  },
  BFF_07_0072_E4: {
    'code': 'BIL0034',
    'msg': '소액결제 부가서비스 미가입자는 이용할 수 없습니다.'
  },
  BFF_07_0080: {
    'code': '00',
    'msg': 'success',
    'result': {
      'tmthUseAmt': '0',
      'tmthChrgAmt': '0',
      'tmthChrgPsblAmt': '0',
      'useContentsLimitAmt': '0',
      'remainUseLimit': '0',
      'requestCnt': '0',
      'gubun': 'Standby',
      'autoChrgStCd': 'U',
      'autoChrgStrdAmt': '250000',
      'autoChrgAmt': '250000',
      'cardNum': '4060783309435014',
      'cardCdNm': 'BC카드'

    }
  },
  BFF_07_0080_E1: {
    'code': 'BIL0030',
    'msg': '휴대폰 결제 이용동의 후 사용 가능한 메뉴입니다.'
  },
  BFF_07_0080_E2: {
    'code': 'BIL0031',
    'msg': '미성년자는 이용할 수 없습니다.'
  },
  BFF_07_0080_E3: {
    'code': 'BIL0033',
    'msg': '휴대폰 결제 차단 고객은 사용이 제한된 메뉴입니다.'
  }
};
