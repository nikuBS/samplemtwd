//청구요금조회
const billguide_BFF_01_00036 = {
  'code': '00',
  'msg': 'success',
  'result': {
    'selSvcMgmtNum': '',
    'acntNum': '6017402179',
    'custNum': '8005489015',
    'invDt': 20170930,
    'invDtArr':
      [
        '20170930',
        '20170831',
        '20170731',
        '20170630',
        '20170531',
        '20170430'
      ],
    'useAmtTot': '75,510',
    'deduckTotInvAmt': '-22055',
    'detailYn': '',
    'autopayYn': 'Y',
    'paidAmtMonthSvcCnt': 2,//청구월회선수( 1 : 개별회선, 그외(1이상) : 통합청구 )
    'repSvcYn': 'Y',//대표청구회선여부 (Y : 대표청구회선, N: 대표청구회선아님)
    'coClCd': 'B',
    'paidAmtMonthCnt': '6',
    'paidAmtMonthSvcNum':
      {
        'svcMgmtNum': '1670016704',
        'name': '이동전화(011-06**-28**)'
      },
    'paidAmtDetailInfo':
      {
        'billItmLclNm': '통신서비스요금',
        'billItmSclNm': '',
        'svcNm': '휴대폰',
        'coClNm': 'SKT',
        'ibilItmCreMclNm': '월정액',
        'ibilItmCreMclAmt': '82,161',
        'billItmNm': '월정액',
        'invAmt': '71,161',
        'svcMgmtNum': ''
      }
  }

};

export default billguide_BFF_01_00036;

