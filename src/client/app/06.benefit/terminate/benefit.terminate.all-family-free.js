/**
 * FileName: benefit.terminate.all-family-free.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.04.01
 */

Tw.BenefitTerminateAllFamilyFree = function(rootEl, prodId, prodNm, svcCd) {
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this.$container = rootEl;
  this._prodId = prodId;
  this._prodNm = prodNm;
  this._svcCd = svcCd;

  this._cachedElement();
  this._bindEvent();
};

Tw.BenefitTerminateAllFamilyFree.prototype = {

  _cachedElement: function() {
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$btnCancelJoin = this.$container.find('.fe-btn_cancel_join');
  },

  _bindEvent: function() {
    this.$btnTerminate.on('click', $.proxy(this._openConfirmAlert, this));
    this.$btnCancelJoin.on('click', $.proxy(this._joinCancel, this));
  },

  _openConfirmAlert: function() {
    this._isTerminate = false;
    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.BUTTON, Tw.BUTTON_LABEL.CLOSE, $.proxy(this._bindConfirmAlert, this),
      null, $.proxy(this._onCloseConfirmAlert, this));
  },

  _bindConfirmAlert: function($popupContainer) {
    $popupContainer.find('.tw-popup-confirm>button').on('click', $.proxy(this._setConfirmAlertApply, this));
  },

  _setConfirmAlertApply: function() {
    this._isTerminate = true;

    if (this._isPopup) {
      this._popupService.close();
    }
  },

  _onCloseConfirmAlert: function() {
    if (!this._isTerminate) {
      return;
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_05_0144, { svcCd: this._svcCd }, {}, [this._prodId])
      .done($.proxy(this._resTerminate, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _joinCancel: function() {
    this._cancelFlag = false;
    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A74.TITLE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A74.MSG, Tw.BUTTON_LABEL.YES, Tw.BUTTON_LABEL.NO,
      null, $.proxy(this._setCancelFlag, this), $.proxy(this._bindJoinCancelPopupCloseEvent, this));
  },

  _setCancelFlag: function() {
    this._cancelFlag = true;
    this._popupService.close();
  },

  _bindJoinCancelPopupCloseEvent: function() {
    if (!this._cancelFlag) {
      return;
    }

    this._historyService.goBack();
  },

  _resTerminate: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0038, {}, {}, [this._prodId])
      .done($.proxy(this._openSuccessPop, this));
  },

  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        btList: [{ link: '/myt-join/combinations', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.COMBINE }],
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

  _openResPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  _closePop: function() {
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
