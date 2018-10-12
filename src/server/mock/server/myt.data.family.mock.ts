const BFF_06_0044_familyInfo = {
  code: '00',
  msg: '',
  result: {
    total: '2048',
    used: '400',
    remained: '1648',
    adultYn: 'Y',
    mbrList: [
      {
        svcNum: '01094**04**',
        svcMgmtNum: '7039746413',
        custNm: '조*희',
        repYn: 'Y',
        prodId: 'NA00005959',
        prodNm: 'Data 인피니티',
        used: '0',
        limitedYn: 'N',
        limitation: '',
        shrblYn: 'Y',
        shared: '0'
      },
      {
        svcNum: '01012**34**',
        svcMgmtNum: '7226057315',
        custNm: '박*수',
        repYn: 'N',
        prodId: 'NA00005959',
        prodNm: 'ting 요금제',
        used: '0',
        limitedYn: 'Y',
        limitation: '300'
      }
    ]
  }
};

const BFF_06_0045_ImmediatelyInfo = {
  code: '00',
  msg: 'success',
  result: {
    dataQty: '30',
    reqCnt: '1',
    nextReqYn: 'Y'
  }
};

const BFF_06_0047_MonthlyInfo = {
  code: '00',
  msg: 'success',
  result: {
    shrblData: '20',
    regularShrYn: 'Y',
    regularShrData: '20'
  }
};

export { BFF_06_0044_familyInfo, BFF_06_0045_ImmediatelyInfo, BFF_06_0047_MonthlyInfo };
