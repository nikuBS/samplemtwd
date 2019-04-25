/**
 * @file 혜택/할인 > 해지 > T끼리 온가족 할인
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-04-01
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param prodNm - 상품명
 * @param isLeaderSvcYn - 대표회선 여부
 */
Tw.BenefitTerminateAllFamily = function(rootEl, prodId, prodNm, isLeaderSvcYn) {
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this.$container = rootEl;
  this._prodId = prodId;
  this._prodNm = prodNm;
  this._isLeaderSvc = isLeaderSvcYn === 'Y';

  this._cachedElement();
  this._bindEvent();
};

Tw.BenefitTerminateAllFamily.prototype = {

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
   * @desc 해지하기 버튼 클릭 시
   * @param e - 해지하기 버튼 클릭 이벤트
   */
  _openConfirmAlert: function(e) {
    this._isTerminate = false;

    var $btn = $(e.currentTarget),
      isLeader = $btn.data('leader') === 'Y',
      confirmAlert = this._getConfirmAlert(isLeader);

    this._popupService.openModalTypeATwoButton(confirmAlert.TITLE, confirmAlert.MSG,
      confirmAlert.BUTTON, Tw.BUTTON_LABEL.CLOSE, $.proxy(this._bindConfirmAlert, this),
      null, $.proxy(this._onCloseConfirmAlert, this), 'is_term', $btn);
  },

  /**
   * @function
   * @desc 해지 확인 팝업 실행
   * @param isLeader - 대표회선 여부
   * @returns {Tw.ALERT_MSG_PRODUCT.ALERT_3_A61|{MSG, BUTTON, TITLE}|Tw.ALERT_MSG_PRODUCT.ALERT_3_A62|{MSG, BUTTON, TITLE}|Tw.ALERT_MSG_PRODUCT.ALERT_3_A63|{MSG, BUTTON, TITLE}|Tw.ALERT_MSG_PRODUCT.ALERT_3_A4|{MSG, BUTTON, TITLE}}
   */
  _getConfirmAlert: function(isLeader) {
    if (isLeader) {
      return Tw.ALERT_MSG_PRODUCT.ALERT_3_A61;
    }

    if (this.$list.find('li').length < 3) {
      return Tw.ALERT_MSG_PRODUCT.ALERT_3_A62;
    }

    if (this.$list.find('li').length > 2) {
      return Tw.ALERT_MSG_PRODUCT.ALERT_3_A63;
    }

    return Tw.ALERT_MSG_PRODUCT.ALERT_3_A4;
  },

  /**
   * @function
   * @desc 해지 확인 팝업 이벤트 바인딩
   * @param $popupContainer - 해지 확인 팝업
   */
  _bindConfirmAlert: function($popupContainer) {
    $popupContainer.find('.tw-popup-confirm>button').on('click', $.proxy(this._setConfirmAlertApply, this));
  },

  /**
   * @function
   * @desc 해지 확인 팝업에서 확인 선택 시
   */
  _setConfirmAlertApply: function() {
    this._isTerminate = true;

    if (this._isPopup) {
      this._popupService.close();
    }
  },

  /**
   * @function
   * @desc 해지 확인 팝업 종료 시
   */
  _onCloseConfirmAlert: function() {
    if (!this._isTerminate) {
      return;
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(this._isLeaderSvc ? Tw.API_CMD.BFF_05_0144 : Tw.API_CMD.BFF_05_0207, { svcCd: '' }, {}, [this._prodId])
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
   * @desc 해지 취소 확인 팝업에서 취소하기 선택 시
   */
  _setCancelFlag: function() {
    this._cancelFlag = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 해지 확인 팝업 종료 시
   */
  _bindJoinCancelPopupCloseEvent: function() {
    if (!this._cancelFlag) {
      return;
    }

    this._historyService.goBack();
  },

  /**
   * @function
   * @desc 해지 처리 API 응답 처리
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
   * @param $popupContainer - 완료 팝업
   */
  _openResPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료팝업 내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 완료 팝업 내 닫기 클릭 시
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
