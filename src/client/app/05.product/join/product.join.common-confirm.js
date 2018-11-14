/**
 * FileName: product.join.common-confirm.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.09
 */

Tw.ProductJoinCommonConfirm = function(isPopup, rootEl, data, applyCallback) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._data = data;
  this._isApply = false;
  this._applyCallback = applyCallback;

  if (isPopup) {
    this._openPop();
  } else {
    this._setContainer(rootEl);
    this._getOverpay();
  }
};

Tw.ProductJoinCommonConfirm.prototype = {

  _cachedElement: function() {
    this.$btnApply = this.$container.find('.fe-btn_apply');
    this.$btnCancelJoin = this.$container.find('.fe-btn_cancel_join');
    this.$btnAgreeView = this.$container.find('.fe-btn_agree_view');
    this.$btnCloseConfirm = this.$container.find('.fe-btn_close_confirm');
    this.$btnComparePlans = this.$container.find('.fe-btn_compare_plans');

    this.$agreeWrap = this.$container.find('.fe-agree_wrap');
    this.$checkboxAgreeAll = this.$container.find('.fe-checkbox_agree_all');
    this.$checkboxAgreeItem = this.$container.find('.fe-checkbox_agree_item');
    this.$overpayGuide = this.$container.find('.fe-overpay_guide');
    this.$overpayWrap = this.$container.find('.fe-overpay_wrap');
    this.$overpayResult = this.$container.find('.fe-overpay_result');
    this.$overPayTmpl = this.$container.find('#fe-templ-plans-overpay');

    this._bindEvent();
  },

  _bindEvent: function() {
    this.$btnApply.on('click', $.proxy(this._openConfirmAlert, this));
    this.$btnAgreeView.on('click', $.proxy(this._openAgreePop, this));
    this.$btnCancelJoin.on('click', $.proxy(this._joinCancel, this));
    this.$btnCloseConfirm.on('click', $.proxy(this._closePop, this));
    this.$btnComparePlans.on('click', $.proxy(this._openComparePlans, this));

    this.$checkboxAgreeAll.on('change', $.proxy(this._agreeAllToggle, this));
    this.$checkboxAgreeItem.on('change', $.proxy(this._agreeItemToggle, this));

    this._init();
  },

  _init: function() {
    if (this.$agreeWrap.length < 1) {
      this._toggleApplyBtn(true);
    }

    if (this.$overPayTmpl.length > 0) {
      this._template = Handlebars.compile(this.$overPayTmpl.html());
    }

    this._joinConfirmAlert = this._data.joinConfirmAlert || Tw.ALERT_MSG_PRODUCT.ALERT_3_A3;
  },

  _openPop: function() {
    this._popupService.open($.extend(this._data, {
      hbs: 'product_join_confirm',
      layer: true
    }, this._data), $.proxy(this._setContainer, this), $.proxy(this._closePop, this), 'join_confirm');
  },

  _setContainer: function($container) {
    this.$container = $container;
    this._cachedElement();
  },

  _joinCancel: function() {
    this._popupService.openModalTypeA(Tw.ALERT_MSG_PRODUCT.ALERT_3_A1.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A1.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A1.BUTTON, $.proxy(this._bindJoinCancelPopupEvent, this),
      null, $.proxy(this._bindJoinCancelPopupCloseEvent, this));
  },

  _bindJoinCancelPopupEvent: function($popupContainer) {
    $popupContainer.find('.tw-popup-closeBtn').on('click', $.proxy(this._setCancelFlag, this));
  },

  _setCancelFlag: function() {
    this._cancelFlag = true;
  },

  _bindJoinCancelPopupCloseEvent: function() {
    if (!this._cancelFlag) {
      return;
    }

    this._historyService.go(-2);
  },

  _getOverpay: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0010)
      .done($.proxy(this._setOverpay, this));
  },

  _setOverpay: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      this.$overpayGuide.show();
      return;
    }

    var isDataOvrAmt = parseFloat(resp.result.dataOvrAmt) > 0,
      isVoiceOvrAmt = parseFloat(resp.result.voiceOvrAmt) > 0,
      isSmsOvrAmt = parseFloat(resp.result.smsOvrAmt) > 0;

    if (!isDataOvrAmt && !isVoiceOvrAmt && !isSmsOvrAmt) {
      return;
    }

    this.$overpayResult.html(this._template($.extend(resp.result, {
      isDataOvrAmt: isDataOvrAmt,
      isVoiceOvrAmt: isVoiceOvrAmt,
      isSmsOvrAmt: isSmsOvrAmt
    })));

    this.$overpayWrap.show();
  },

  _openAgreePop: function(e) {
    var $parent = $(e.currentTarget).parent();
    this._popupService.open({
      hbs: 'FT_01_03_L01',
      data: {
        title: $parent.find('.mtext').text(),
        html: $parent.find('.fe-agree_full_html').text()
      }
    }, $.proxy(this._bindAgreePop, this), null, 'agree_pop');
  },

  _bindAgreePop: function($popupContainer) {
    $popupContainer.find('.fe-btn_ok').on('click', $.proxy(this._closePop, this));
  },

  _openComparePlans: function() {
    this._popupService.open({
      hbs: 'MP_02_02_01',
      data: {}
    }, null, null, 'compare_plans');
  },

  _closePop: function() {
    this._popupService.close();
  },

  _openConfirmAlert: function() {
    this._popupService.openModalTypeA(this._joinConfirmAlert.TITLE, this._joinConfirmAlert.MSG,
      this._joinConfirmAlert.BUTTON, $.proxy(this._bindConfirmAlert, this), null, $.proxy(this._onCloseConfirmAlert, this));
  },

  _bindConfirmAlert: function($popupContainer) {
    $popupContainer.find('.tw-popup-confirm>button').on('click', $.proxy(this._setConfirmAlertApply, this));
  },

  _setConfirmAlertApply: function() {
    this._isDoCallback = true;
    this._popupService.close();
  },

  _onCloseConfirmAlert: function() {
    if (!this._isDoCallback) {
      return;
    }

    this._doCallback();
  },

  _toggleApplyBtn: function(toggle) {
    if (toggle) {
      this.$btnApply.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnApply.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _doCallback: function() {
    this._applyCallback();
  }

};
