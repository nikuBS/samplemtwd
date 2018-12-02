const BFF_10_0017_mock = {
  'code': '00',
  'msg': 'success',
  'result': {
    'preinfo': {
      'svcNumMask': '010xx**xx**',
      'reqProdInfo': {
        'prodNm': '함께쓰기베이직차단해제(LTE용)',
        'basFeeInfo': '0',
        'prodSmryDesc': '함께쓰기 요금제 데이터를 종량과금(한도초과요금상한제)으로 추가 사용 원할 시 선택하는 서비스'
      },
      'autoJoinList' : [
        {
          'svcProdCd': '3',
          'svcProdNm': '부가서비스',
          'prodNm': '부가서비스명'
        }
      ],
      'autoTermList' : [
        {
          'svcProdCd': '3',
          'svcProdNm': '부가서비스',
          'prodNm': '부가서비스명'
        }
      ],
      'prodNoticeList': [
        {}
      ]
    },
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

export default BFF_10_0017_mock;
