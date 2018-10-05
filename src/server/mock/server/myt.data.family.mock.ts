const BFF_06_0044_familyInfo = {
  code: '00',
  msg: '',
  result: {
    total: '2048',
    used: '400',
    remained: '1648',
    mbrList: [{
      svcNum: '01094**04**',
      svcMgmtNum: '7226057315',
      custNm: '조*희',
      repYn: 'Y',
      prodId: 'NA00005959',
      prodNm: 'Data 인피니티',
      used: '0',
      limitedYn: 'N',
      limitation: ''
    }, {
      svcNum: '01012**34**',
      svcMgmtNum: '7226057315',
      custNm: '박*수',
      repYn: 'N',
      prodId: 'NA00005959',
      prodNm: 'ting 요금제',
      used: '0',
      limitedYn: 'Y',
      limitation: '300'
    }]
  }
};

const oMockMytDataFamily = {
  BFF_06_0044_familyInfo
}

export default oMockMytDataFamily;
