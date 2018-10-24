const BFF_06_0044_familyInfo = {
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
};

const BFF_06_0045_ImmediatelyInfo = {
  code: '00',
  msg: 'success',
  result: {
    tFmlyShrblQty: '30',
    totShrblQty: '40',
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
