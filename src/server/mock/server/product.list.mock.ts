const PRODUCT_PLANS = {
  code: '00',
  msg: 'success',
  result: {
    productCount: 8,
    hasNext: false,
    products: [
      {
        prodId: 'TW00000012',
        prodNm: '1231',
        rgstImg: 'http://mcdn.tworld.co.kr/uploads/poc/36258/5063/132DC85D172B47BFB2DF0824202FDB28.jpg',
        basFeeAmt: '상세참조',
        filters: [
          {
            prodFltId: 'F01121',
            prodFltNm: 'LTE'
          },
          {
            prodFltId: 'F01122',
            prodFltNm: '3G'
          }
        ]
      },
      {
        prodId: 'TW00000009',
        prodNm: '1231',
        rgstImg: 'http://mcdn.tworld.co.kr/uploads/poc/13093/50845/F944B3CC76E5459EA16DA57B3D331988.png',
        basFeeAmt: '0',
        filters: [
          {
            prodFltId: 'F01121',
            prodFltNm: 'LTE'
          }
        ]
      },
      {
        prodId: 'NA00005959',
        prodNm: 'Data 인피니티',
        rgstImg: 'http://mcdn.tworld.co.kr/uploads/poc/36258/5063/132DC85D172B47BFB2DF0824202FDB28.jpg',
        basOfrDataQtyCtt: '무제한',
        basOfrVcallTmsCtt: '집전화·이동전화 무제한',
        basOfrCharCntCtt: '기본제공',
        basFeeAmt: '100000',
        filters: [
          {
            prodFltId: 'F01121',
            prodFltNm: 'LTE'
          }
        ]
      },
      {
        prodId: 'NA00005958',
        prodNm: '패밀리',
        rgstImg: 'http://mcdn.tworld.co.kr/uploads/poc/36258/5063/132DC85D172B47BFB2DF0824202FDB28.jpg',
        basOfrDataQtyCtt: '150GB',
        basOfrVcallTmsCtt: '집전화·이동전화 무제한',
        basOfrCharCntCtt: '기본제공',
        basFeeAmt: '무료',
        filters: [
          {
            prodFltId: 'F01121',
            prodFltNm: 'LTE'
          }
        ]
      },
      {
        prodId: 'NA00005957',
        prodNm: '라지',
        rgstImg: 'http://mcdn.tworld.co.kr/uploads/poc/36258/5063/132DC85D172B47BFB2DF0824202FDB28.jpg',
        basOfrDataQtyCtt: '100GB',
        basOfrVcallTmsCtt: '집전화·이동전화 무제한',
        basOfrCharCntCtt: '기본제공',
        basFeeAmt: '무료',
        filters: [
          {
            prodFltId: 'F01121',
            prodFltNm: 'LTE'
          }
        ]
      },
      {
        prodId: 'NA00005956',
        prodNm: '미디엄',
        rgstImg: 'http://mcdn.tworld.co.kr/uploads/poc/36258/5063/132DC85D172B47BFB2DF0824202FDB28.jpg',
        basOfrDataQtyCtt: '4GB',
        basOfrVcallTmsCtt: '집전화·이동전화 무제한',
        basOfrCharCntCtt: '기본제공',
        basFeeAmt: '무료',
        filters: [
          {
            prodFltId: 'F01121',
            prodFltNm: 'LTE'
          }
        ]
      },
      {
        prodId: 'NA00005955',
        prodNm: '스몰',
        rgstImg: 'http://mcdn.tworld.co.kr/uploads/poc/36258/5063/132DC85D172B47BFB2DF0824202FDB28.jpg',
        basOfrDataQtyCtt: '1.2GB',
        basOfrVcallTmsCtt: '집전화·이동전화 무제한',
        basOfrCharCntCtt: '기본제공',
        basFeeAmt: '무료',
        filters: [
          {
            prodFltId: 'F01121',
            prodFltNm: 'LTE'
          }
        ]
      },
      {
        prodId: 'NA00004775',
        prodNm: 'band 데이터 퍼펙트',
        rgstImg: 'http://mcdn.tworld.co.kr/uploads/poc/36258/5063/132DC85D172B47BFB2DF0824202FDB28.jpg',
        basOfrDataQtyCtt: '11.0GB',
        basOfrVcallTmsCtt: '집전화·이동전화 무제한',
        basOfrCharCntCtt: '기본제공',
        basFeeAmt: '무료',
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
      searchOrder: 'recommand',
      searchCount: 20
    }
  }
};

const PRODUCT_ADDITIONS = {
  code: '00',
  msg: 'success',
  result: {
    productCount: 20,
    hasNext: false,
    products: [
      {
        prodId: 'NA00005696', //상품ID
        prodNm: '척척할인', //상품명
        prodSmryDesc: '매월 제휴사 상품 일정금액 이상 소비시 통신비 할인', //상품요약설명
        prodIconImgUrl: '/img/dummy/img_sample01.png', //상품 아이콘 이미지 FULL URL
        basFeeInfo: '43175', //이용요금(월정액)
        prodFltList: [
          //상품필터목록
          {
            prodFltId: 'F01121', //상품필터ID
            prodFltNm: 'LTE' //상품필터명
          }
        ]
      },
      {
        prodId: 'NA00005696', //상품ID
        prodNm: '척척할인', //상품명
        prodSmryDesc: '매월 제휴사 상품 일정금액 이상 소비시 통신비 할인', //상품요약설명
        prodIconImgUrl: '/img/dummy/img_sample01.png', //상품 아이콘 이미지 FULL URL
        basFeeInfo: '상세참조', //이용요금(월정액)
        prodFltList: [
          //상품필터목록
          {
            prodFltId: 'F01121', //상품필터ID
            prodFltNm: 'LTE' //상품필터명
          }
        ]
      },
      {
        prodId: 'NA00005696', //상품ID
        prodNm: '척척할인', //상품명
        prodSmryDesc: '매월 제휴사 상품 일정금액 이상 소비시 통신비 할인', //상품요약설명
        prodIconImgUrl: '/img/dummy/img_sample01.png', //상품 아이콘 이미지 FULL URL
        basFeeInfo: '43175', //이용요금(월정액)
        prodFltList: [
          //상품필터목록
          {
            prodFltId: 'F01121', //상품필터ID
            prodFltNm: 'LTE' //상품필터명
          }
        ]
      },
      {
        prodId: 'NA00005696', //상품ID
        prodNm: '척척할인', //상품명
        prodSmryDesc: '매월 제휴사 상품 일정금액 이상 소비시 통신비 할인', //상품요약설명
        prodIconImgUrl: '/img/dummy/img_sample01.png', //상품 아이콘 이미지 FULL URL
        basFeeInfo: '43175', //이용요금(월정액)
        prodFltList: [
          //상품필터목록
          {
            prodFltId: 'F01121', //상품필터ID
            prodFltNm: 'LTE' //상품필터명
          }
        ]
      },
      {
        prodId: 'NA00005696', //상품ID
        prodNm: '척척할인', //상품명
        prodSmryDesc: '매월 제휴사 상품 일정금액 이상 소비시 통신비 할인', //상품요약설명
        prodIconImgUrl: '/img/dummy/img_sample01.png', //상품 아이콘 이미지 FULL URL
        basFeeInfo: '43175', //이용요금(월정액)
        prodFltList: [
          //상품필터목록
          {
            prodFltId: 'F01121', //상품필터ID
            prodFltNm: 'LTE' //상품필터명
          }
        ]
      }
    ],
    searchOption: { searchOrder: 'recommand', searchCount: 20 }
  }
};

export { PRODUCT_PLANS, PRODUCT_ADDITIONS };
