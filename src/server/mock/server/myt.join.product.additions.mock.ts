const MYT_JOIN_ADDITONS = {
  code: '00',
  msg: '',
  result: {
    addProdList: [
      {
        prodId: 'NA00004073',
        prodNm: '넘버플러스II',
        basFeeTxt: '3850',
        scrbDt: '20170915',
        payFreeYn: 'N',
        prodLinkYn: 'Y',
        btnList: [
          {
            btnLinkTypCd: 'SC',
            btnNm: '설정 변경',
            btnLinkUrl: ''
          }
        ]
      },
      {
        prodId: 'NA00004196',
        prodNm: 'T안심콜 라이트',
        basFeeTxt: '2000',
        scrbDt: '20140120',
        payFreeYn: 'N',
        prodLinkYn: 'Y',
        btnList: []
      },
      {
        prodId: 'NA00004863',
        prodNm: 'T로밍 함께쓰기 3GB',
        basFeeTxt: '상세참조',
        scrbDt: '20130225',
        prodLinkYn: 'Y',
        payFreeYn: 'Y',
        btnList: []
      },
      {
        prodId: 'NA00004707',
        prodNm: 'T로밍 함께쓰기 10GB',
        basFeeTxt: '1000',
        scrbDt: '20130225',
        prodLinkYn: 'Y',
        payFreeYn: 'Y',
        btnList: []
      },
      {
        prodId: 'NA00004707',
        prodNm: 'T로밍 함께쓰기 10GB',
        basFeeTxt: '무료',
        scrbDt: '20130225',
        prodLinkYn: 'Y',
        payFreeYn: 'Y',
        btnList: []
      }
    ]
  }
};

const MYT_JOIN_WIRE_ADDITIONS = {
  code: '00',
  msg: 'success',
  result: {
    pays: [
      { prodId: 'NI00000318', prodNm: '스마트온', basFeeAmt: 0, basFeeTxt: '상세참조', prodLinkYn: 'N', scrbDt: '20150223' },
      { prodId: 'NI00000566', prodNm: '기가WiFi 라이트', basFeeAmt: 1650, basFeeTxt: '1650', prodLinkYn: 'N', scrbDt: '20150223' },
      { prodId: 'NI00000566', prodNm: '기가WiFi 라이트', basFeeAmt: 0, basFeeTxt: '무료', prodLinkYn: 'N', scrbDt: '20150223' }
    ],
    frees: [],
    reserveds: [],
    joinables: [
      {
        prodId: 'NA00004707',
        prodNm: 'T로밍 함께쓰기 10GB',
        basFeeAmt: 0,
        basFeeTxt: '무료',
        scrbDt: '20130225',
        prodLinkYn: 'Y',
        payFreeYn: 'Y'
      }
    ]
  }
};

export { MYT_JOIN_ADDITONS, MYT_JOIN_WIRE_ADDITIONS };
