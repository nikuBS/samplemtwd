/**
 * @file: product.wireplan.join.ocb
 * @file: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * @since: 2019. 8. 2.
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면ID
 * @param confirmOptions - 정보확인 데이터
 * @param btnData - 버튼 데이터
 */
Tw.ProductWireplanJoinOcb = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._bindEvent();

  this.PROD_ID = 'NA00006655';
};

Tw.ProductWireplanJoinOcb.prototype = {
  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function () {
    this.$container.on('change', '.fe-agree-check', $.proxy(this._agreeCheck, this));
    this.$container.on('click', '#fe-bt-agree', $.proxy(this._requestJoin, this));
    this.$container.on('click','.fe-popup-closeBtn',$.proxy(this._onClosePop,this));
  },

  /**
   * @function
   * @desc 체크 변경시 버튼 활성화 체크
   */
  _agreeCheck: function () {
    if ( this.$container.find('.fe-agree-check:not(:checked)').length > 0 ) {
      this.$container.find('#fe-bt-agree').attr('disabled', true);
    } else {
      this.$container.find('#fe-bt-agree').attr('disabled', false);
    }
  },
  /**
   * @function
   * @desc 가입 요청
   */
  _requestJoin: function () {
    // 무선 부가상품 가입 처리
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0035, { /*addCd: '2'*/ }, {}, [this.PROD_ID])
      .done($.proxy(this._onSuccessJoinAddition, this))
      .fail($.proxy(this._onFailJoinAddtion, this));
  },
  /**
   * @function
   * @desc _onSetBandYT() 성공 콜백
   * @param {Object} resp
   */
  _onSuccessJoinAddition: function (resp) {
    Tw.CommonHelper.endLoading('.wrap');
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.open({
        hbs: 'RO_3_7',
        title: Tw.PRODUCT_JOIN_OCB.POPUP
      }, $.proxy(this._bindSuccessPopup, this), $.proxy(this._historyService.goBack, this), 'join_success');
    } else {
      this._onFailJoinAddtion(resp);
    }
  },
  /**
   * @function
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 팝업 컨테이너 레이어
   */
  _bindSuccessPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._historyService.goBack, this));
    $popupContainer.on('click', '.bt-link-tx', $.proxy(this._onClickCharge, this));
  },

   /**
   * @function
   * @desc 과금 팝업 오픈 후 외부 브라우저 랜딩 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickCharge: function ($event) {
    Tw.CommonHelper.showDataCharge($.proxy(this._onClickExternal, this, $event));
  },

  /**
   * @function
   * @desc 외부 브라우저 랜딩 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickExternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    Tw.CommonHelper.openUrlExternal(url);
  },

  /**
   * @function
   * @desc 실패 콜백
   * @param {Object} resp
   */
  _onFailJoinAddtion: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  },
  /**
   * @function
   * @desc Popup 닫힘 처리
   * @private
   */
  _onClosePop: function () {
    this._historyService.goBack();
  }
};
