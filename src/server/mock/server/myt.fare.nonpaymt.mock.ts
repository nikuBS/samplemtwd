export const UnbillInfo = {
  'code': '00',
  'msg': 'success',
  'result': {
    'unPaidAmtMonthInfoList': {
      'unPaidInvDt': '20170930',
      'unPaidAmt': '590090'
    },
    'unPaidTotSum': '80000'
  }
};

export const PossibleDay = {
  'code': '00',
  'msg': 'success',
  'result': {
    'maxConnDt': null,
    'useObjYn': 'Y',
    'evtNum': 'C101807019',
    'colAmt': '000000000039500',
    'suspStaDt': '20180727',
    'maxPtpDtList': [
      '20180703',
      '20180704',
      '20180705',
      '20180706',
      '20180707',
      '20180708',
      '20180709',
      '20180710',
      '20180711',
      '20180712',
      '20180713',
      '20180714',
      '20180715',
      '20180716',
      '20180717',
      '20180718',
      '20180719',
      '20180720',
      '20180721',
      '20180722',
      '20180723',
      '20180724',
      '20180725',
      '20180726'
    ]
  }
};

// 카드인 경우
export const AutoPaySd_01 = {
  'code': '00',
  'msg': 'success',
  'result': {
    'payMthdCd': '02',
    'drwInvCyclCd': '01',
    'autoPayHistoryList': [
      {
        'billNum': '1',
        'autoPayDrawList': [
          {
            'seq': 1,
            'drwDt': '20180711',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          }
        ]
      },
      {
        'billNum': '2',
        'autoPayDrawList': [
          {
            'seq': 1,
            'drwDt': '20180718',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          }
        ]
      },
      {
        'billNum': '3',
        'autoPayDrawList': [
          {
            'seq': 1,
            'drwDt': '20180726',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          }
        ]
      }
    ]
  }
};

// 은행 - 데일리 인출 은행
export const AutoPaySd_02 = {
  'code': '00',
  'msg': 'success',
  'result': {
    'payMthdCd': '01',
    'drwInvCyclCd': 'S1',
    'autoPayHistoryList': [
      {
        'billNum': '1',
        'autoPayDrawList': [
          {
            'seq': 0,
            'drwDt': null,
            'pStartDay': '20180621',
            'pEndDay': '20180705',
            'tStartDay': '20180723',
            'tEndDay': '20180806'
          }
        ]
      },
      {
        'billNum': '2',
        'autoPayDrawList': [
          {
            'seq': 1,
            'drwDt': '20180808',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          },
          {
            'seq': 2,
            'drwDt': '20180813',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          }
        ]
      }
    ]
  }
};

// 은행 - 금결원 인출 은행
export const AutoPaySd_03 = {
  'code': '00',
  'msg': 'success',
  'result': {
    'payMthdCd': '01',
    'drwInvCyclCd': '01',
    'autoPayHistoryList': [
      {
        'billNum': '1',
        'autoPayDrawList': [
          {
            'seq': 1,
            'drwDt': '20180723',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          },
          {
            'seq': 2,
            'drwDt': '20180726',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          },
          {
            'seq': 3,
            'drwDt': '20180730',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          },
          {
            'seq': 4,
            'drwDt': '20180801',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          },
          {
            'seq': 5,
            'drwDt': '20180803',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          }
        ]
      },
      {
        'billNum': '2',
        'autoPayDrawList': [
          {
            'seq': 1,
            'drwDt': '20180808',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          },
          {
            'seq': 2,
            'drwDt': '20180813',
            'pStartDay': null,
            'pEndDay': null,
            'tStartDay': null,
            'tEndDay': null
          }
        ]
      }
    ]
  }
};

export const PaySuspension = {
  'code': '00',
  'msg': 'success',
  'result': {
    'useObjYn': 'Y',
    'maxConnDt': '20180731',
    'evtNum': 'C101807019',
    'colMgmtTypCd': null,
    'colExeActCd': null,
    'colAmt': '000000000039500',
    'tmthColAmt': '2525100'
  }
};
