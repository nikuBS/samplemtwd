/**
 * @file 상품 > 원장(상세) 리디렉션 지원 스크립트
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-12-04
 */

/**
 * @class
 * @param prodId - 상품코드
 * @param svcMgmtNum - 서비스관리번호
 * @param redirectUrl - 리디렉션할 주소
 */
Tw.ProductCommonCallplanRedirect = function(prodId, svcMgmtNum, redirectUrl) {
  // 공통 모듈 선언
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._bpcpService = Tw.Bpcp;
  this._bpcpService.setData(null, '/product/callplan?prod_id=' + prodId, true, true);
  this._popupService = Tw.Popup;
  // 공통 변수 선언
  this._redirectUrl = redirectUrl;
  this._prodId = prodId;
  this._svcMgmtNum = svcMgmtNum;
  // 컨펌 팝업 실행
  $(window).on(Tw.INIT_COMPLETE, $.proxy(this._openConfirm, this));
};

Tw.ProductCommonCallplanRedirect.prototype = {
  /**
   * @function
   * @desc 과금 팝업 호출 등 처리
   * @returns {*|*|void}
   */
  _openConfirm: function() {
    // 데이터 충전소는 BPCP 이므로 별도 로직 처리
    if (this._prodId === 'TW20000019') {
      return this._openDataCharge();
    }
    // 앱이 아닐 경우 즉시 아웃링크 처리
    if (!Tw.BrowserHelper.isApp()) {
      this._isConfirm = true;
      return this._procRedirect();
    }
    // 공통 과금팝업 처리
    Tw.CommonHelper.showDataCharge($.proxy(this._setConfirm, this), $.proxy(this._procRedirect, this));
  },

  /**
   * @function
   * @desc 과금안내 팝업 확인 클릭시
   */
  _setConfirm: function() {
    this._isConfirm = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 리디렉션 실행
   * @returns {*|void}
   */
  _procRedirect: function() {
    if (!this._isConfirm) {
      return this._historyService.goBack();
    }

    Tw.CommonHelper.openUrlExternal(this._redirectUrl);
    this._back();
  },

  /**
   * @function
   * @desc 데이터충전소 BPCP 연결
   */
  _openDataCharge: function() {
    this._bpcpService.open(Tw.OUTLINK.DATA_COUPON.DATA_FACTORY);
  },

  /**
   * @function
   * @desc 팝업 닫기시 이전 페이지로 이동
   */
  _back: function() {
    setTimeout(function() {
      this._historyService.goBack();
    }.bind(this), 100);
  }

};
