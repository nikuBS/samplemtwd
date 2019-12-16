/**
 * @file common.member.line.skb-svc-agreement.js
 * @author Kangta Kim (kangta.kim@sk.com)
 * @since 2019.12.11
 */

/**
 * @class
 * @desc 공통 > 회선관리
 * @param rootEl
 * @param defaultCnt
 * @constructor
 */
Tw.CommonMemberLineSkbSvcAgreement = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._tooltipService = Tw.Tooltip;
  this._historyService = new Tw.HistoryService();

  this._cacheElements();
  this._bindEvent();
};

Tw.CommonMemberLineSkbSvcAgreement.prototype = {

  _cacheElements: function() {
    this.$btnTerm = this.$container.find('.fe-bt-term');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-bt-cancel', $.proxy(function() { this._historyService.goBack() }, this));
    this.$container.on('click', '.fe-bt-term', $.proxy( this._openTermDetail, this ));
    this.$container.on('click', '.fe-bt-next', $.proxy(this._callIsOverFourteen, this));
  },

  /**
   * @function
   * @desc 약관 레이어 팝업
   * @private
   * TODO: HTML 내 value 값 상용 Admin 기준 약관 번호로 수정 필요
   */
  _openTermDetail: function (event) {
    Tw.CommonHelper.openTermLayer( $(event.currentTarget).attr('value') );
  },

  /**
   * @function
   * @desc 만 14세 이상 여부 확인 API 호출
   * @private
   */
  _callIsOverFourteen: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0080, {})
    .done( $.proxy(this._checkIsOverFourteen, this) )
    .fail( $.proxy(this._failedApiCall, this) );
  },

  /**
   * @function
   * @desc 만 14세 이상 여부에 따라 2단계 진입 또는 에러메시지 발생
   * @private
   */
  _checkIsOverFourteen: function(resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.age >= 14 ) {
        this._callDisagreeLineCheck();
      } else {
        this._popupService.openAlert(Tw.ALERT_MSG_COMMON.BROADBAND_AGREEMENT_UNDER_FOURTEEN)
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 티월드동의 미동의 회선 조회 API 호출
   * @private
   */
  _callDisagreeLineCheck: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0214, {})
      .done($.proxy(this._successDisagreeLineCheck, this))
      .fail($.proxy(this._failDisagreeLineCheck, this));
  },

  /**
   * @function
   * @desc 티월드동의 미동의 회선 조회 API 응답 수신
   * @private
   */
  _successDisagreeLineCheck: function (resp) {
    // if ( resp.code === Tw.API_CODE.CODE_00 ) { TODO: 테스트용 주석 처리
    if ( true ) {
      // 테스트용 Dummy 데이터
      // TODO: 서비스타입이 Swing 기준인 I/T/P 로 내려오는게 맞는지 확인 필요
      resp = {
        "code": "00",
        "msg": "success",
        "result": [
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188757",
            "svcCd": "P", // 서비스타입 맞는지... 
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "전화_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188758",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "IPTV_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188759",
            "svcCd": "I",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "인터넷_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188757",
            "svcCd": "P",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "전화_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188758",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "IPTV_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188759",
            "svcCd": "I",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "인터넷_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188757",
            "svcCd": "P",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "전화_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188758",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "IPTV_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188759",
            "svcCd": "I",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "인터넷_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188757",
            "svcCd": "P",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "전화_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188758",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "IPTV_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188759",
            "svcCd": "I",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "인터넷_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188757",
            "svcCd": "P",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "전화_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188758",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "IPTV_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188759",
            "svcCd": "I",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "인터넷_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188757",
            "svcCd": "P",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "전화_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188758",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "IPTV_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188759",
            "svcCd": "I",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "인터넷_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188757",
            "svcCd": "P",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "전화_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188758",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "IPTV_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188759",
            "svcCd": "I",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "인터넷_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188757",
            "svcCd": "P",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "전화_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188758",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "IPTV_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188759",
            "svcCd": "I",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "인터넷_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188757",
            "svcCd": "P",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "전화_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188758",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "IPTV_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188759",
            "svcCd": "I",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "인터넷_테스트",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188760",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188761",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188762",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188763",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188764",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188765",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188766",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188767",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188768",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188769",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188770",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188771",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188772",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188773",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188774",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188775",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          },
          {
            "zcstCustNum": "8000172839",
            "zcstCustNm": "권홍석",
            "zcstDupScrbInfo": "MC0GCCqGSIb3DQIJAyEA5LyHYVEsoQ2pLCbHb3Raup5oZ4d1fYegpG2eDPrQmrw=",
            "zcstCnntInfo": "817bXN/7L6xGaul9jrWpd/U+iaOPy1htrzc4gFF8DlLqnqsIGQj9KNmh2Y07+ufQgBAJMZVJH+cEzvwrmmHvrA==",
            "zcstSsnBirthDt": "760119",
            "zcstSsnSexCd": "1",
            "zcstCustTypCd": "01",
            "zcstCustDtlTypCd": "N0",
            "zsvcSvcMgmtNum": "7287188776",
            "svcCd": "T",
            "svcNum": "7287**87**",
            "svcStCd": "AC",
            "svcTypCd": "01",
            "svcDtlClCd": "T2",
            "feeProdId": "NT00000536",
            "bprdProdNm": "스마트Plus_M_Biz",
            "coClCd": "B",
            "wagreeClCd": "",
            "zsvcTwldWireOpAgreeYn": "",
            "zsvcTwldOpDtm": "",
            "zssaBasAddr": "인천 연********",
            "msvcPageNo": 1,
            "msvcTotalCnt": 105,
            "msvcPageSize": 20
          }
        ]
      };

      var disagreedLineList = [];
      var totalLineCount = 0;
      var serialNumber = 0;

      resp.result.forEach( function (line) {
        totalLineCount = line.msvcTotalCnt;
        disagreedLineList.push({
          serialNumber: serialNumber,
          isInternet: line.svcCd === Tw.BROADBAND_SVC_CODE.INTERNET || false,
          isIptv: line.svcCd === Tw.BROADBAND_SVC_CODE.IPTV || false,
          isPhone: line.svcCd === Tw.BROADBAND_SVC_CODE.PHONE || false,
          svcName: Tw.BROADBAND_SVC_CODE_NAME[line.svcCd],
          address: line.zssaBasAddr,
          isNone: serialNumber < 20 ? '' : ' none'
        })
        serialNumber++;
      });

      // TODO: 회선 없는 CASE 테스트용
      // disagreedLineList = [];

      // 미동의 회선이 없는 경우
      if ( disagreedLineList.length <= 0 ) {
        this._popupService.open({
          hbs: 'CO_01_05_03_02_NO_BROADBAND_LINE',
          layer: true,
        }, $.proxy(this._noLinePopupOpenCallback, this), null, 'no-line');
      } else { // 미동의 회선이 있는 경우
        // 티월드동의 동의처리 2단계 팝업 호출
        this._popupService.open({
          hbs: 'CO_01_05_03_02',
          layer: true,
          disagreedLine: disagreedLineList,
          totalLineCount: totalLineCount
        }, $.proxy(this._agreementPopupOpenCallback, this), null, 'line-check');
      }
    } else { // 조회 오류 시 Error 처리
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _noLinePopupOpenCallback: function($popupContainer) {
    $popupContainer.on('click', '.fe-bt-close', $.proxy( function() { this._historyService.goBack(); }, this ));
  },

  /**
   * @function
   * @desc API 응답 없음
   * @private
   */
  _failedApiCall:function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  _agreementPopupOpenCallback: function ($popupContainer) {
    $popupContainer.on('click', '.fe-bt-close', $.proxy(this._openAlertBeforeClose, this));
    $popupContainer.on('click', '.fe-bt-more', $.proxy(this._showMore, this));
    $popupContainer.on('click', '.fe-bt-agreement', $.proxy(this._confirmAgreement, this));
  },

  // TODO: Hash History로 인한 백버튼 안먹는 현상 수정 필요
  _openAlertBeforeClose: function() {
    this._popupService.openModalTypeA(
      '',
      Tw.ALERT_MSG_COMMON.BROADBAND_AGREEMENT_CANCEL_ALERT,
      null,
      null,
      $.proxy( function() { this._historyService.goLoad('/common/member/line/skb-svc-agreement') }, this));
  },

  /**
   * @function
   * @desc 더보기
   */
  _showMore: function () {
    this.$container.find('.fe-disagree-line.none').slice(0, 20).removeClass('none');
    if ( this.$container.find('.fe-disagree-line.none').length === 0 ) {
      this.$container.find('.fe-bt-more').addClass('none');
    }
  },

  _confirmAgreement: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0215, {})
      .done( $.proxy(this._openConfirmPopup, this) )
      .fail( $.proxy(this._failedApiCall, this) );
  },

  _openConfirmPopup: function (resp) {
    //if ( resp.code === Tw.API_CODE.CODE_00 ) { // TODO: 테스트용 주석 처리
    if ( true ) {
      this._popupService.open({
        hbs: 'CO_01_02_04_03_SKB_AGREEMENT',
        layer: true
      }, $.proxy(this._confirmPopupOpenCallback, this), null, 'confirm');
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _confirmPopupOpenCallback: function($popupContainer) {
    $popupContainer.on('click', '.fe-bt-confirm', $.proxy( this._goLoadLineManagement, this));
  },

  _goLoadLineManagement: function () {
    this._historyService.goLoad('/common/member/line');
  }
};
