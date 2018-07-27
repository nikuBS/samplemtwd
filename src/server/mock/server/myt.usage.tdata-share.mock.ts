const MyTUsageTDataShareData = {
  'code': '결과코드',
  'msg': '결과메세지',
  'result': {
    'prodNm': '올인원 54(요금제명-사용 중인 요금상품)',
    'isAdultInd': '미성년 여부 T/F (미성년자인 경우 조회만 가능(변경처리 업무 불가))',
    'svcStatCd': 'AC일 경우 분실해지이나 미성년의 경우 불가)',

    'freePlan': [
      { // 기본제공 데이터 현황
        'skipName': '무룧택명 처리',
        'total': '32475123',
        'used': '12475123',
        'remained': '20000000',
        'unit': '140'
      },
      { // 기본제공 데이터 현황
        'skipName': '무룧택명 처리',
        'total': '기본공제량',
        'used': '120000',
        'remained': '잔여량,',
        'unit': '140'
      }
    ],

    'dataSharingSvc': {
      // 모회선 사용량 + 자회선 목록 조회
      'used': '모회선 사용량',
      'totUsed': '모회선 총 사용량',
      'totShar': '모회선 데이터셰어링 총사용량',
      'opmdBasic': '모회선 데이터셰어링 기본 제공량',

      'childList': [
        {
          'mSvcMgmtNum': '모 서비스관리번호(구분이 모/총계일 경우 사용량 전달)',
          'cSvcMgmtNum': '자 서비스관리번호(구분이 총계일 경우 자서비스 사용량 총계=해지하기 파라미터)',
          'usimNum': '1010-1003-7399-1F(USIM 번호)',
          'svcScrbDt': '2018.05.16(가입일자)',
          'svcTermDt': '해지일시',
          'svcStNm': '서비스상태명',
          'svcStCd': '서비스상태코드(AC 분실신고, SP 분실)',
          'svcStChgCd': '서비스상태 변경코드',
          'svcSt': 'T데이터 셰어링 USIM 상태명',
          'eqpMgmtStCd': '단말기관리상태코드(09 분실신고/분실)',
          'useAmt': '10242024'

          // 'svcStChgNm': '서비스상태 변경명',
          // 'svcChgRsnCd': '서비스변경 사유코드',
          // 'svcChgRsnNm': '서비스변경 사유명',
          //
          // 'cEqpMgmtStNm': '단말기관리상태명',
          // 'prodId': 'USIM칩의 상품코드 'NA00002888' = 비한도형, 'NA00003095' = 한도형',
          // 'prodNm': 'USIM칩의 상품명',

        },
        {
          'mSvcMgmtNum': '모 서비스관리번호(구분이 모/총계일 경우 사용량 전달)',
          'cSvcMgmtNum': '자 서비스관리번호(구분이 총계일 경우 자서비스 사용량 총계=해지하기 파라미터)',
          'usimNum': '1010-1003-7399-1F(USIM 번호)',
          'svcScrbDt': '2018.05.16(가입일자)',
          'svcTermDt': '해지일시',
          'svcStNm': '서비스상태명',
          'svcStCd': '서비스상태코드(AC 분실신고, SP 분실)',
          'svcStChgCd': '서비스상태 변경코드',
          'svcSt': 'T데이터 셰어링 USIM 상태명',
          'eqpMgmtStCd': '단말기관리상태코드(09 분실신고/분실)',
          'useAmt': '10242024'

          // 'svcStChgNm': '서비스상태 변경명',
          // 'svcChgRsnCd': '서비스변경 사유코드',
          // 'svcChgRsnNm': '서비스변경 사유명',
          //
          // 'cEqpMgmtStNm': '단말기관리상태명',
          // 'prodId': 'USIM칩의 상품코드 'NA00002888' = 비한도형, 'NA00003095' = 한도형',
          // 'prodNm': 'USIM칩의 상품명',

        },
        {
          'mSvcMgmtNum': '모 서비스관리번호(구분이 모/총계일 경우 사용량 전달)',
          'cSvcMgmtNum': '자 서비스관리번호(구분이 총계일 경우 자서비스 사용량 총계=해지하기 파라미터)',
          'usimNum': '1010-1003-7399-1F(USIM 번호)',
          'svcScrbDt': '2018.05.16(가입일자)',
          'svcTermDt': '해지일시',
          'svcStNm': '서비스상태명',
          'svcStCd': '서비스상태코드(AC 분실신고, SP 분실)',
          'svcStChgCd': '서비스상태 변경코드',
          'svcSt': 'T데이터 셰어링 USIM 상태명',
          'eqpMgmtStCd': '단말기관리상태코드(09 분실신고/분실)',
          'useAmt': '10242024'

          // 'svcStChgNm': '서비스상태 변경명',
          // 'svcChgRsnCd': '서비스변경 사유코드',
          // 'svcChgRsnNm': '서비스변경 사유명',
          //
          // 'cEqpMgmtStNm': '단말기관리상태명',
          // 'prodId': 'USIM칩의 상품코드 'NA00002888' = 비한도형, 'NA00003095' = 한도형',
          // 'prodNm': 'USIM칩의 상품명',

        },
        {
          'mSvcMgmtNum': '모 서비스관리번호(구분이 모/총계일 경우 사용량 전달)',
          'cSvcMgmtNum': '자 서비스관리번호(구분이 총계일 경우 자서비스 사용량 총계=해지하기 파라미터)',
          'usimNum': '1010-1003-7399-1F(USIM 번호)',
          'svcScrbDt': '2018.05.16(가입일자)',
          'svcTermDt': '해지일시',
          'svcStNm': '서비스상태명',
          'svcStCd': '서비스상태코드(AC 분실신고, SP 분실)',
          'svcStChgCd': '서비스상태 변경코드',
          'svcSt': 'T데이터 셰어링 USIM 상태명',
          'eqpMgmtStCd': '단말기관리상태코드(09 분실신고/분실)',
          'useAmt': '10242024'

          // 'svcStChgNm': '서비스상태 변경명',
          // 'svcChgRsnCd': '서비스변경 사유코드',
          // 'svcChgRsnNm': '서비스변경 사유명',
          //
          // 'cEqpMgmtStNm': '단말기관리상태명',
          // 'prodId': 'USIM칩의 상품코드 'NA00002888' = 비한도형, 'NA00003095' = 한도형',
          // 'prodNm': 'USIM칩의 상품명',

        },
        {
          'mSvcMgmtNum': '모 서비스관리번호(구분이 모/총계일 경우 사용량 전달)',
          'cSvcMgmtNum': '자 서비스관리번호(구분이 총계일 경우 자서비스 사용량 총계=해지하기 파라미터)',
          'usimNum': '1010-1003-7399-1F(USIM 번호)',
          'svcScrbDt': '2018.05.16(가입일자)',
          'svcTermDt': '해지일시',
          'svcStNm': '서비스상태명',
          'svcStCd': '서비스상태코드(AC 분실신고, SP 분실)',
          'svcStChgCd': '서비스상태 변경코드',
          'svcSt': 'T데이터 셰어링 USIM 상태명',
          'eqpMgmtStCd': '단말기관리상태코드(09 분실신고/분실)',
          'useAmt': '10242024'

          // 'svcStChgNm': '서비스상태 변경명',
          // 'svcChgRsnCd': '서비스변경 사유코드',
          // 'svcChgRsnNm': '서비스변경 사유명',
          //
          // 'cEqpMgmtStNm': '단말기관리상태명',
          // 'prodId': 'USIM칩의 상품코드 'NA00002888' = 비한도형, 'NA00003095' = 한도형',
          // 'prodNm': 'USIM칩의 상품명',

        },
        {
          'mSvcMgmtNum': '모 서비스관리번호(구분이 모/총계일 경우 사용량 전달)',
          'cSvcMgmtNum': '자 서비스관리번호(구분이 총계일 경우 자서비스 사용량 총계=해지하기 파라미터)',
          'usimNum': '1010-1003-7399-1F(USIM 번호)',
          'svcScrbDt': '2018.05.16(가입일자)',
          'svcTermDt': '해지일시',
          'svcStNm': '서비스상태명',
          'svcStCd': '서비스상태코드(AC 분실신고, SP 분실)',
          'svcStChgCd': '서비스상태 변경코드',
          'svcSt': 'T데이터 셰어링 USIM 상태명',
          'eqpMgmtStCd': '단말기관리상태코드(09 분실신고/분실)',
          'useAmt': '10242024'

          // 'svcStChgNm': '서비스상태 변경명',
          // 'svcChgRsnCd': '서비스변경 사유코드',
          // 'svcChgRsnNm': '서비스변경 사유명',
          //
          // 'cEqpMgmtStNm': '단말기관리상태명',
          // 'prodId': 'USIM칩의 상품코드 'NA00002888' = 비한도형, 'NA00003095' = 한도형',
          // 'prodNm': 'USIM칩의 상품명',

        },
        {
          'mSvcMgmtNum': '모 서비스관리번호(구분이 모/총계일 경우 사용량 전달)',
          'cSvcMgmtNum': '자 서비스관리번호(구분이 총계일 경우 자서비스 사용량 총계=해지하기 파라미터)',
          'usimNum': '1010-1003-7399-1F(USIM 번호)',
          'svcScrbDt': '2018.05.16(가입일자)',
          'svcTermDt': '해지일시',
          'svcStNm': '서비스상태명',
          'svcStCd': '서비스상태코드(AC 분실신고, SP 분실)',
          'svcStChgCd': '서비스상태 변경코드',
          'svcSt': 'T데이터 셰어링 USIM 상태명',
          'eqpMgmtStCd': '단말기관리상태코드(09 분실신고/분실)',
          'useAmt': '10242024'

          // 'svcStChgNm': '서비스상태 변경명',
          // 'svcChgRsnCd': '서비스변경 사유코드',
          // 'svcChgRsnNm': '서비스변경 사유명',
          //
          // 'cEqpMgmtStNm': '단말기관리상태명',
          // 'prodId': 'USIM칩의 상품코드 'NA00002888' = 비한도형, 'NA00003095' = 한도형',
          // 'prodNm': 'USIM칩의 상품명',

        }
      ]
    }
  }
};

export default MyTUsageTDataShareData;
