/**
 * @file 혜택/할인 > 해지 > TB끼리 온가족 프리
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-04-01
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param prodNm - 상품명
 */
Tw.BenefitTerminateAllFamilyFree = function(rootEl, prodId, prodNm) {
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this.$container = rootEl;
  this._prodId = prodId;
  this._prodNm = prodNm;

  this._cachedElement();
  this._bindEvent();
};

Tw.BenefitTerminateAllFamilyFree.prototype = {

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$list = this.$container.find('.fe-list');
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$btnCancelJoin = this.$container.find('.fe-btn_cancel_join');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$btnTerminate.on('click', _.debounce($.proxy(this._openConfirmAlert, this), 500));
    this.$btnCancelJoin.on('click', $.proxy(this._joinCancel, this));
  },

  /**
   * @function
   * @desc 해지하기 버튼 클릭시
   * @param e - 클릭 이벤트
   */
  _openConfirmAlert: function(e) {
    this._isTerminate = false;
    var $btn = $(e.currentTarget);

    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.BUTTON, Tw.BUTTON_LABEL.CLOSE, $.proxy(this._bindConfirmAlert, this),
      null, $.proxy(this._onCloseConfirmAlert, this, $btn), 'is_term', $btn);
  },

  /**
   * @function
   * @desc 해지 확인 팝업 이벤트 바인딩
   * @param $popupContainer - 팝업 레이어
   */
  _bindConfirmAlert: function($popupContainer) {
    $popupContainer.find('.tw-popup-confirm>button').on('click', $.proxy(this._setConfirmAlertApply, this));
  },

  /**
   * @function
   * @desc 해지 팝업에서 해지하기 클릭 시
   */
  _setConfirmAlertApply: function() {
    this._isTerminate = true;

    if (this._isPopup) {
      this._popupService.close();
    }
  },

  /**
   * @function
   * @desc 해지 팝업 종료 시
   * @param $btn - 최초 해지하기 버튼 Element
   */
  _onCloseConfirmAlert: function($btn) {
    if (!this._isTerminate) {
      return;
    }

    var svcCd = Tw.FormatHelper.isEmpty($btn.data('svc_cd')) ? '' : $btn.data('svc_cd');

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_05_0144, { svcCd: svcCd }, {}, [this._prodId])
      .done($.proxy(this._resTerminate, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 헤더 닫기 버튼 클릭 시
   */
  _joinCancel: function() {
    this._cancelFlag = false;
    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A74.TITLE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A74.MSG, Tw.BUTTON_LABEL.YES, Tw.BUTTON_LABEL.NO,
      null, $.proxy(this._setCancelFlag, this), $.proxy(this._bindJoinCancelPopupCloseEvent, this));
  },

  /**
   * @function
   * @desc 취소 확인 팝업에서 취소하기 클릭 시
   */
  _setCancelFlag: function() {
    this._cancelFlag = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 취소 확인 팝업 종료 시
   */
  _bindJoinCancelPopupCloseEvent: function() {
    if (!this._cancelFlag) {
      return;
    }

    this._historyService.goBack();
  },

  /**
   * @function
   * @desc 해지 API 응답 처리
   * @param resp - API 응답 값
   * @returns {*}
   */
  _resTerminate: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._openSuccessPop();
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   */
  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        btList: [{ link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.TERMINATE,
        prodCtgNm: Tw.PRODUCT_CTG_NM.COMBINATIONS,
        isBasFeeInfo: false,
        basFeeInfo: null
      }
    }, $.proxy(this._openResPopupEvent, this), $.proxy(this._onClosePop, this), 'terminate_success');
  },

  /**
   * @function
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 레이어
   */
  _openResPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료 팝업 내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 완료 팝업 내 닫기 버튼 클릭 시
   */
  _closePop: function() {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료 팝업 종료 시
   */
  _onClosePop: function() {
    this._historyService.goBack();
  }

};
