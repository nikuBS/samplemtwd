const PRODUCT_PROMOTION_BANNERS = {
  code: '00',
  msg: 'success',
  result: [
    {
      rsvStaDtm: '20180813192149',
      oferStcCd: 'MAPROBMA_A00A0093',
      bnnrTypCd: 'I',
      imgId: '/img/dummy/img_MP.png',
      imgAltVal: '더미',
      anchTagInfo: '더미',
      linkTypCd: 'S',
      twdViewUrl: 'http://www.tworld.co.kr',
      bnnrHtmlCtt: '',
      bnnrLocCd: 'T'
    },
    {
      rsvStaDtm: '20180813192149',
      oferStcCd: 'MAPROBMA_A00A0093',
      bnnrTypCd: 'I',
      imgId: '/img/dummy/img_MP.png',
      imgAltVal: '더미',
      anchTagInfo: '더미',
      linkTypCd: 'S',
      twdViewUrl: 'http://www.tworld.co.kr',
      bnnrHtmlCtt: '',
      bnnrLocCd: 'T'
    },
    {
      rsvStaDtm: '20180813192149',
      oferStcCd: 'MAPROBMA_A00A0093',
      bnnrTypCd: 'H',
      bnnrHtmlCtt: '<img src="/img/dummy/img_MP.png">',
      bnnrLocCd: 'T'
    }
  ]
};

const PRODUCT_MY_FILTERS = {
  code: '00',
  msg: 'success',
  result: {
    prodCnt: '59',
    list: [
      {
        prodFltId: 'T00337',
        prodFltNm: 'LTE폰'
      }
    ]
  }
};

const PRODUCT_PLAN_GROUPS = {
  code: '00',
  msg: 'success',
  result: {
    expsTitNm: 'SKT의 대표 요금제',
    grpProdList: [
      {
        prodGrpId: 'T000000005',
        prodGrpNm: 'band 데이터',
        prodGrpDesc: '그룹테스트',
        prodGrpIconImgUrl: '',
        prodGrpFlagImgUrl: '',
        prodList: [
          {
            prodId: 'NA00004769',
            prodNm: 'band 데이터 세이브',
            basFeeInfo: '39600',
            basOfrVcallTmsCtt: '집전화·이동전화 무제한',
            basOfrCharCntCtt: '기본제공',
            basOfrDataQtyCtt: '1.2GB'
          },
          {
            prodId: 'NA00004770',
            prodNm: 'band 데이터 1.2G',
            basFeeInfo: '46200',
            basOfrVcallTmsCtt: '집전화·이동전화 무제한',
            basOfrCharCntCtt: '기본제공',
            basOfrDataQtyCtt: '2.2GB'
          },
          {
            prodId: 'NA00004771',
            prodNm: 'band 데이터 2.2G',
            basFeeInfo: '51700',
            basOfrVcallTmsCtt: '집전화·이동전화 무제한',
            basOfrCharCntCtt: '기본제공',
            basOfrDataQtyCtt: '3.5GB'
          },
          {
            prodId: 'NA00005134',
            prodNm: 'band 데이터 퍼펙트S',
            basFeeInfo: '75900',
            basOfrVcallTmsCtt: '집전화·이동전화 무제한',
            basOfrCharCntCtt: '기본제공',
            basOfrDataQtyCtt: '16.0GB'
          },
          {
            prodId: 'NA00004773',
            prodNm: 'band 데이터 6.5G',
            basFeeInfo: '65890',
            basOfrVcallTmsCtt: '집전화·이동전화 무제한',
            basOfrCharCntCtt: '기본제공',
            basOfrDataQtyCtt: '11.0GB'
          },
          {
            prodId: 'NA00004775',
            prodNm: 'band 데이터 퍼펙트',
            basFeeInfo: '무료',
            basOfrVcallTmsCtt: '집전화·이동전화 무제한',
            basOfrCharCntCtt: '기본제공',
            basOfrDataQtyCtt: '11.0GB'
          },
          {
            prodId: 'NA00004772',
            prodNm: 'band 데이터 3.5G',
            basFeeInfo: '56100',
            basOfrVcallTmsCtt: '집전화·이동전화 무제한',
            basOfrCharCntCtt: '기본제공',
            basOfrDataQtyCtt: '6.5GB'
          }
        ]
      }
    ]
  }
};

const PRODUCT_RECOMMENDED_PLANS = {
  code: '00',
  msg: 'success',
  result: {
    expsTitNm: '이런 요금제는 어떠세요?', //개별상품타이틀
    prodList: [
      //개별상품 목록
      {
        prodId: 'NA00005483', //상품ID
        prodNm: '뉴 T끼리 맞춤형(100분+6GB)', //상품명
        prodIconImgUrl: '', //상품 아이콘 이미지 FULL URL
        basFeeInfo: '43175', //이용요금(월정액)
        basOfrVcallTmsCtt: '집전화·이동전화 무제한', //기본제공 음성통화시간
        basOfrCharCntCtt: '기본제공', //기본제공 문자건수
        basOfrDataQtyCtt: '무제한', //기본제공 데이터량
        prodFltList: [
          //상품필터목록
          {
            prodFltId: 'F01121', //상품필터ID
            prodFltNm: 'LTE' //상품필터명
          }
        ]
      }
    ]
  }
};

const PRODUCT_MY_ADDITIONS = {
  code: '00',
  msg: '',
  result: {
    addProductJoinsInfo: {
      recentlyJoinsProdNm: 'Oksusu 기본월정액',
      addProdCnt: 3
    }
  }
};

const PRODUCT_BEST_ADDITIONS = {
  code: '00',
  msg: 'success',
  result: {
    expsTitNm: 'SKT의 대표 부가서비스', //개별상품타이틀
    prodList: [
      //개별상품 목록
      {
        prodId: 'NA00005696', //상품ID
        prodNm: '척척할인', //상품명
        prodSmryDesc: '매월 제휴사 상품 일정금액 이상 소비시 통신비 할인', //상품요약설명
        prodIconImgUrl: '', //상품 아이콘 이미지 FULL URL
        basFeeInfo: '43175', //이용요금(월정액)
        prodFltList: [
          //상품필터목록
          {
            prodFltId: 'F01121', //상품필터ID
            prodFltNm: 'LTE' //상품필터명
          }
        ]
      }
    ]
  }
};

const PRODUCT_RECOMMENDED_ADDITIONS = {
  code: '00',
  msg: 'success',
  result: {
    expsTitNm: '이런 부가서비스는 어떠세요?', //개별상품타이틀
    prodList: [
      //개별상품 목록
      {
        prodId: 'NA00005696', //상품ID
        prodNm: '척척할인', //상품명
        prodSmryDesc: '매월 제휴사 상품 일정금액 이상 소비시 통신비 할인', //상품요약설명
        prodIconImgUrl: '', //상품 아이콘 이미지 FULL URL
        basFeeInfo: '43175', //이용요금(월정액)
        prodFltList: [
          //상품필터목록
          {
            prodFltId: 'F01231', //상품필터ID
            prodFltNm: '데이터' //상품필터명
          }
        ]
      }
    ]
  }
};

const PRODUCT_RECOMMENDED_TAGS = {
  code: '00',
  msg: 'success',
  result: {
    expsTitNm: '모바일 요금제 태그',
    tagList: [
      {
        tagId: 'TAG0000001',
        tagNm: '태그1'
      },
      {
        tagId: 'TAG0000002',
        tagNm: '태그2'
      },
      {
        tagId: 'TAG0000003',
        tagNm: '태그3'
      },
      {
        tagId: 'TAG0000004',
        tagNm: '태그4'
      },
      {
        tagId: 'TAG0000005',
        tagNm: '태그5'
      }
    ]
  }
};

const PRODUCT_ADDITIONAL_BANNERS = {
  code: '00',
  msg: 'success',
  result: {
    bnnrList: [
      //배너 목록
      {
        bnnrId: '7',
        bnnrNm: '데이터 부가서비스',
        imgUrl: 'http://mcdn.tworld.co.kr20181004\\1\\08\\71\\73\\35\\Koala.jpg',
        imgAltVal: 'aa',
        anchTagInfo: 'bb',
        linkTypCd: 'S',
        linkTypNm: '일반콘텐츠',
        twdViewUrl: '',
        oferStcCd: ''
      },
      {
        bnnrId: '1', //배너ID
        bnnrNm: '모일수록 줄어드는 데이터 걱정!', //배너명
        imgUrl: '/img/dummy/img_product_main01.png',
        imgAltVal: '더미',
        anchTagInfo: '더미',
        linkTypCd: 'S',
        linkTypNm: 'T world',
        twdViewUrl: 'http://www.tworld.co.kr',
        oferStcCd: 'MAPROBMA_A00A0093'
      },
      {
        bnnrId: '2', //배너ID
        bnnrNm: '모일수록 줄어드는 데이터 걱정!', //배너명
        imgUrl: '/img/dummy/img_product_main02.png',
        imgAltVal: '더미',
        anchTagInfo: '더미',
        linkTypCd: 'S',
        linkTypNm: 'T world',
        twdViewUrl: 'http://www.tworld.co.kr',
        oferStcCd: 'MAPROBMA_A00A0093'
      }
    ]
  }
};

const PRODUCT_LIST_PLANS = {
  code: '00',
  msg: 'success',
  result: {
    productCount: 55,
    hasNext: true,
    products: [
      {
        prodId: 'N000000001',
        prodNm: '요금제명',
        rgstImg: '/upload/image/prodIcon01.png',
        basOfrDataQtyCtt: '기본제공데이터량내용',
        basOfrVcallTmsCtt: '기본제공음성통화시간내용',
        basOfrCharCntCtt: '기본제공문자건수내용',
        prodSmryDesc: '상품요약설명',
        basFeeAmt: '기본요금정보',
        filters: [
          {
            prodFltId: 'F01121',
            prodFltNm: 'LTE'
          },
          {
            prodFltId: 'F01134',
            prodFltNm: '8GB~무제한'
          },
          {
            prodFltId: 'F01143',
            prodFltNm: '6만원대~'
          }
        ]
      }
    ],

    searchOption: {
      searchFltIds: ['FILTERID001', 'FILTERID002'],
      searchTag: '#태그명',
      searchOrder: 'recommand',
      searchCount: 20
    }
  }
};

const PRODUCT_SEARCH_FILTERS = {
  code: '00',
  msg: 'success',
  result: {
    filters: [
      {
        prodFltId: 'T00001',
        prodFltNm: '기기',
        rgstImg: '이미지 아이콘',
        subFilters: [
          {
            prodFltId: 'T00002',
            prodFltNm: 'LTE',
            rgstImg: '이미지 아이콘'
          }
        ]
      }
    ],

    tags: ['#태그1', '#태그1', '#태그1']
  }
};

export {
  PRODUCT_PROMOTION_BANNERS,
  PRODUCT_MY_FILTERS,
  PRODUCT_PLAN_GROUPS,
  PRODUCT_LIST_PLANS,
  PRODUCT_RECOMMENDED_PLANS,
  PRODUCT_RECOMMENDED_TAGS,
  PRODUCT_SEARCH_FILTERS,
  PRODUCT_MY_ADDITIONS,
  PRODUCT_BEST_ADDITIONS,
  PRODUCT_RECOMMENDED_ADDITIONS,
  PRODUCT_ADDITIONAL_BANNERS
};
