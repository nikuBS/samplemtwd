const BFF_10_0111_mock = {
  'code': '00',
  'msg': 'success',
  'result': {
    'preinfo': {
      'reqProdInfo': {
        'prodId': 'NI00000435',
        'prodNm': 'T_다뷰',
        'prodSmryDesc' : 'IP공유 부가 서비스 입니다.',
        'basFeeInfo': '3300',
        'svcNm': '인터넷',
        'svcCd': 'I'
      },
      'svcNumMask': '110동************************************',
      'autoJoinTermList': [
        {
          'prodId': 'TEST000001',
          'prodNm': '테스트 상품'
        },
        {
          'prodId': 'TEST000002',
          'prodNm': '테스트 상품2'
        }
      ]
    },
    'termRsnList': [
      {
        'rsnCd': '01',
        'rsnNm': '사용안함'
      },
      {
        'rsnCd': '02',
        'rsnNm': '불필요'
      }
    ],
    'stipulationInfo': {
      'scrbStplAgreeYn': 'Y',
      'scrbStplAgreeTitNm': '',
      'scrbStplAgreeHtmlCtt': '<p>&nbsp;</p>',
      'termStplAgreeYn': 'N',
      'termStplAgreeTitNm': '',
      'termStplAgreeHtmlCtt': '',
      'psnlInfoCnsgAgreeYn': 'Y',
      'psnlInfoCnsgAgreeTitNm': '',
      'psnlInfoCnsgHtmlCtt': '<p>&nbsp;</p>',
      'psnlInfoOfrAgreeYn': 'Y',
      'psnlInfoOfrAgreeTitNm': '',
      'psnlInfoOfrHtmlCtt': '<p>&nbsp;</p>',
      'adInfoOfrAgreeYn': 'Y',
      'adInfoOfrAgreeTitNm': '',
      'adInfoOfrHtmlCtt': '<p>&nbsp;</p>'
    }
  }
};

export default BFF_10_0111_mock;
