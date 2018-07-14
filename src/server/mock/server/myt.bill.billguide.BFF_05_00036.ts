//청구요금조회
const billguide_BFF_05_00036 = {
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
    'useAmtTot': '75,510',//75,510
    'deduckTotInvAmt': '-22055',
    'detailYn': '',
    'autopayYn': 'Y',
    'paidAmtMonthSvcCnt': 3,//청구월회선수( 1 : 개별회선, 그외(1이상) : 통합청구 )
    'repSvcYn': 'Y',//대표청구회선여부 (Y : 대표청구회선, N: 대표청구회선아님)
    'coClCd': 'T',//브로드밴드 가입 여부
    'paidAmtMonthCnt': '6',
    'paidAmtMonthSvcNum': [
      {
        "svcMgmtNum": "1144012200",
        "name": "이동전화(010-90**-98**)"
      },
      {
        "svcMgmtNum": "7038287563",
        "name": "이동전화(010-63**-98**)"
      },    {
        "svcMgmtNum": "7228803112",
        "name": "이동전화(010-87**-86**)"
      },
      {
        "svcMgmtNum": "7233160336",
        "name": "인터넷(광랜F) 경기 부**********************************************"
      },
      {
        "svcMgmtNum": "7233162605",
        "name": "유선전화(디지털전화, 003**61*****) 경기 부**********************************************"
      }
    ],
    //청구목록 detailYn : 'N'
    'paidAmtSvcCdList' : [
      {
        "svcNm": "이동전화",
        "amt": "192200"
      },
      {
        "svcNm": "인터넷",
        "amt": "11000"
      },    {
        "svcNm": "유선전화",
        "amt": "550"
      }
    ],
    //상세 detailYn : 'Y'
    "paidAmtDetailInfo": [
      {
        "coClNm": "",
        "invAmt": "85,000",
        "svcNm": "",
        "billItmSclNm": "월정액",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "월정액",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "1,500",
        "svcNm": "",
        "billItmSclNm": "부가서비스",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "T메모링 프리미엄",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "1,000",
        "svcNm": "",
        "billItmSclNm": "부가서비스",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "T안심콜라이트",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "900",
        "svcNm": "",
        "billItmSclNm": "부가서비스",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "컬러링",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "2,800",
        "svcNm": "",
        "billItmSclNm": "부가서비스",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "폰세이프IV A 파손*",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "5,000",
        "svcNm": "",
        "billItmSclNm": "부가서비스",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "oksusu 안심팩(할인)",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "37,160",
        "svcNm": "",
        "billItmSclNm": "분할상환금",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "단말기분할상환금*",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "4,230",
        "svcNm": "",
        "billItmSclNm": "분할상환금",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "단말분할상환수수료*",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "-13,000",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "선택약정할인",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "-42,500",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "온가족+B인터넷할인",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },    {
        "coClNm": "",
        "invAmt": "-13,000",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "CLUB SK카드 할인*",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "-354",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "자동납부할인",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "9,340",
        "svcNm": "",
        "billItmSclNm": "부가가치세(세금)",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "부가세총액*",
        "billItmLclNm": "부가가치세(세금)",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "-4,286",
        "svcNm": "",
        "billItmSclNm": "부가가치세(세금)",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "할인부가세*",
        "billItmLclNm": "부가가치세(세금)",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "-1,300",
        "svcNm": "",
        "billItmSclNm": "부가가치세(세금)",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "1144012200",
        "billItmNm": "선택약정할인 부가세*",
        "billItmLclNm": "부가가치세(세금)",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-90**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "59,900",
        "svcNm": "",
        "billItmSclNm": "월정액",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "월정액",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "4,900",
        "svcNm": "",
        "billItmSclNm": "부가서비스",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "T아이폰클럽*",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "3,190",
        "svcNm": "",
        "billItmSclNm": "콘텐츠이용료",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "멜론콘텐츠*",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "36,100",
        "svcNm": "",
        "billItmSclNm": "분할상환금",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "단말기분할상환금*",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "2,370",
        "svcNm": "",
        "billItmSclNm": "분할상환금",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "단말분할상환수수료*",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "-12,000",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "선택약정할인",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "-17,970",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "온가족+B인터넷할인",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "-299",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "자동납부할인",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "-4",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "원단위조정금액*",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "5,990",
        "svcNm": "",
        "billItmSclNm": "부가가치세(세금)",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "부가세총액*",
        "billItmLclNm": "부가가치세(세금)",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "-1,827",
        "svcNm": "",
        "billItmSclNm": "부가가치세(세금)",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "할인부가세*",
        "billItmLclNm": "부가가치세(세금)",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "-1,200",
        "svcNm": "",
        "billItmSclNm": "부가가치세(세금)",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7038287563",
        "billItmNm": "선택약정할인 부가세*",
        "billItmLclNm": "부가가치세(세금)",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-63**-98**)"
      },
      {
        "coClNm": "",
        "invAmt": "75,000",
        "svcNm": "",
        "billItmSclNm": "월정액",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7228803112",
        "billItmNm": "월정액",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-87**-86**)"
      },
      {
        "coClNm": "",
        "invAmt": "5,000",
        "svcNm": "",
        "billItmSclNm": "옵션요금제",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7228803112",
        "billItmNm": "안심옵션(퍼펙트무한)",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-87**-86**)"
      },
      {
        "coClNm": "",
        "invAmt": "6,000",
        "svcNm": "",
        "billItmSclNm": "부가서비스",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7228803112",
        "billItmNm": "벅스 익스트리밍",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-87**-86**)"
      },
      {
        "coClNm": "",
        "invAmt": "-11,250",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7228803112",
        "billItmNm": "선택약정할인",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-87**-86**)"
      },
      {
        "coClNm": "",
        "invAmt": "-37,500",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7228803112",
        "billItmNm": "온가족+B인터넷할인",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-87**-86**)"
      },
      {
        "coClNm": "",
        "invAmt": "-372",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7228803112",
        "billItmNm": "자동납부할인",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-87**-86**)"
      },
      {
        "coClNm": "",
        "invAmt": "-5",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7228803112",
        "billItmNm": "원단위조정금액*",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-87**-86**)"
      },
      {
        "coClNm": "",
        "invAmt": "8,600",
        "svcNm": "",
        "billItmSclNm": "부가가치세(세금)",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7228803112",
        "billItmNm": "부가세총액*",
        "billItmLclNm": "부가가치세(세금)",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-87**-86**)"
      },
      {
        "coClNm": "",
        "invAmt": "-3,788",
        "svcNm": "",
        "billItmSclNm": "부가가치세(세금)",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7228803112",
        "billItmNm": "할인부가세*",
        "billItmLclNm": "부가가치세(세금)",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-87**-86**)"
      },
      {
        "coClNm": "",
        "invAmt": "-1,125",
        "svcNm": "",
        "billItmSclNm": "부가가치세(세금)",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7228803112",
        "billItmNm": "선택약정할인 부가세*",
        "billItmLclNm": "부가가치세(세금)",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "이동전화(010-87**-86**)"
      },
      {
        "coClNm": "",
        "invAmt": "33,000",
        "svcNm": "",
        "billItmSclNm": "기본료",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7233160336",
        "billItmNm": "기본료",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "인터넷(경기 부**********************************************)"
      },
      {
        "coClNm": "",
        "invAmt": "-13,000",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7233160336",
        "billItmNm": "약정할인",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "인터넷(경기 부**********************************************)"
      },
      {
        "coClNm": "",
        "invAmt": "-10,000",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7233160336",
        "billItmNm": "TB결합할인(인터넷)",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "인터넷(경기 부**********************************************)"
      },
      {
        "coClNm": "",
        "invAmt": "1,000",
        "svcNm": "",
        "billItmSclNm": "부가가치세(세금)",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7233160336",
        "billItmNm": "부가세(T)*",
        "billItmLclNm": "부가가치세(세금)",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "인터넷(경기 부**********************************************)"
      },
      {
        "coClNm": "",
        "invAmt": "4,500",
        "svcNm": "",
        "billItmSclNm": "기본료",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7233162605",
        "billItmNm": "기본료",
        "billItmLclNm": "사용요금",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "유선전화(003**61*****)"
      },
      {
        "coClNm": "",
        "invAmt": "-3,500",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7233162605",
        "billItmNm": "약정할인",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "유선전화(003**61*****)"
      },
      {
        "coClNm": "",
        "invAmt": "-500",
        "svcNm": "",
        "billItmSclNm": "요금할인",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7233162605",
        "billItmNm": "TB결합할인(전화)",
        "billItmLclNm": "요금할인",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "유선전화(003**61*****)"
      },
      {
        "coClNm": "",
        "invAmt": "50",
        "svcNm": "",
        "billItmSclNm": "부가가치세(세금)",
        "ibilItmCreMclNm": "",
        "svcMgmtNum": "7233162605",
        "billItmNm": "부가세(T)*",
        "billItmLclNm": "부가가치세(세금)",
        "ibilItmCreMclAmt": "",
        "svcInfoNm": "유선전화(003**61*****)"
      }
    ]

  }

};

export default billguide_BFF_05_00036;

