/**
 * FileName: product.join.common-confirm.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.09
 */

Tw.ProductCommonConfirm = function(isPopup, rootEl, data, applyCallback) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._data = data;
  this._isApply = false;
  this._isPopup = isPopup;
  this._applyCallback = applyCallback;

  if (isPopup) {
    this._openPop();
  } else {
    this._setContainer(false, rootEl);
    this._getOverpay();
  }
};

Tw.ProductCommonConfirm.prototype = {

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

    if (this._data.isWireplan) {
      this.$btnSelectTerminateCause = this.$container.find('.fe-btn_select_terminate_cause');
    }

    this._bindEvent();
  },

  _bindEvent: function() {
    this.$btnApply.on('click', $.proxy(this._openConfirmAlert, this));
    this.$btnAgreeView.on('click', $.proxy(this._openAgreePop, this));
    this.$btnCancelJoin.on('click', $.proxy(this._joinCancel, this));
    this.$btnCloseConfirm.on('click', $.proxy(this._closePop, this));
    this.$btnComparePlans.on('click', $.proxy(this._openComparePlans, this));
    this.$btnSelectTerminateCause.on('click', $.proxy(this._openSelectTerminateCause, this));

    this.$checkboxAgreeAll.on('change', $.proxy(this._agreeAllToggle, this));
    this.$checkboxAgreeItem.on('change', $.proxy(this._agreeItemToggle, this));

    this._init();
  },

  _init: function() {
    if (this._data.isWirePlan) {
      this._termRsnCd = null;
    }

    if (this.$agreeWrap.length < 1) {
      this._toggleApplyBtn(true);
    }

    if (this.$overPayTmpl.length > 0) {
      this._template = Handlebars.compile(this.$overPayTmpl.html());
    }

    this._confirmAlert = this._data.confirmAlert || Tw.ALERT_MSG_PRODUCT.ALERT_3_A3;
  },

  _openPop: function() {
    this._popupService.open($.extend(this._data, {
      hbs: 'product_common_confirm',
      layer: true,
      title: Tw.PRODUCT_TYPE_NM.JOIN,
      applyBtnText: Tw.BUTTON_LABEL.JOIN
    }), $.proxy(this._setContainer, this, true), $.proxy(this._closePop, this), 'join_confirm');
  },

  _setContainer: function(isPopup, $container) {
    this.$container = $container;
    this._cachedElement();

    if (this._data.isWidgetInit) {
      skt_landing.widgets.widget_init();
    }
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
    if (this._data.isOverPayReqYn !== 'Y') {
      return;
    }

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

  _openSelectTerminateCause: function() {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_FAMILY_TYPE,
      data: [{
        'list': [
          { value: Tw.WIREPLAN_TERMINATE_CAUSE.CS00, option: (this._termRsnCd === 'CS00') ? 'checked' : '', attr: 'data-term_rsn_cd="CS00"' },
          { value: Tw.WIREPLAN_TERMINATE_CAUSE.CS01, option: (this._termRsnCd === 'CS01') ? 'checked' : '', attr: 'data-term_rsn_cd="CS01"' },
          { value: Tw.WIREPLAN_TERMINATE_CAUSE.CS02, option: (this._termRsnCd === 'CS02') ? 'checked' : '', attr: 'data-term_rsn_cd="CS02"' },
          { value: Tw.WIREPLAN_TERMINATE_CAUSE.CS03, option: (this._termRsnCd === 'CS03') ? 'checked' : '', attr: 'data-term_rsn_cd="CS03"' },
          { value: Tw.WIREPLAN_TERMINATE_CAUSE.CS04, option: (this._termRsnCd === 'CS04') ? 'checked' : '', attr: 'data-term_rsn_cd="CS04"' },
          { value: Tw.WIREPLAN_TERMINATE_CAUSE.CS05, option: (this._termRsnCd === 'CS05') ? 'checked' : '', attr: 'data-term_rsn_cd="CS05"' },
          { value: Tw.WIREPLAN_TERMINATE_CAUSE.CS06, option: (this._termRsnCd === 'CS06') ? 'checked' : '', attr: 'data-term_rsn_cd="CS06"' },
          { value: Tw.WIREPLAN_TERMINATE_CAUSE.CS07, option: (this._termRsnCd === 'CS07') ? 'checked' : '', attr: 'data-term_rsn_cd="CS07"' },
          { value: Tw.WIREPLAN_TERMINATE_CAUSE.CS08, option: (this._termRsnCd === 'CS08') ? 'checked' : '', attr: 'data-term_rsn_cd="CS08"' }
        ]
      }]
    }, $.proxy(this._bindSelectTerminateCause, this), null, 'select_term_rsn_cd');
  },

  _bindSelectTerminateCause: function($popupContainer) {
    $popupContainer.on('click', '[data-term_rsn_cd]', $.proxy(this._setTermRsnCd, this));
  },

  _setTermRsnCd: function(e) {
    this._termRsnCd = $(e.currentTarget).data('term_rsn_cd');
    this.$btnSelectTerminateCause.html(Tw.WIREPLAN_TERMINATE_CAUSE[this._termRsnCd] +
      $('<div\>').append(this.$btnSelectTerminateCause.find('.ico')).html());
    this._procApplyBtnActivate();

    this._popupService.close();
  },

  _agreeAllToggle: function() {
    var isAllCheckboxChecked = this.$checkboxAgreeAll.is(':checked');

    this.$checkboxAgreeItem.prop('checked', isAllCheckboxChecked);
    this.$checkboxAgreeItem.parents('.fe-checkbox_style').toggleClass('checked', isAllCheckboxChecked)
      .attr('aria-checked', isAllCheckboxChecked);

    this._procApplyBtnActivate();
  },

  _agreeItemToggle: function() {
    var isCheckboxItemChecked = this.$container.find('.fe-checkbox_agree_item:not(:checked)').length < 1;

    this.$checkboxAgreeAll.prop('checked', isCheckboxItemChecked);
    this.$checkboxAgreeAll.parents('.fe-checkbox_style').toggleClass('checked', isCheckboxItemChecked)
      .attr('aria-checked', isCheckboxItemChecked);

    this._procApplyBtnActivate();
  },

  _procApplyBtnActivate: function() {
    this._toggleApplyBtn(this.$container.find('.fe-checkbox_agree_need:not(:checked)').length < 1);
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
    this._popupService.openModalTypeA(this._confirmAlert.TITLE, this._confirmAlert.MSG,
      this._confirmAlert.BUTTON, $.proxy(this._bindConfirmAlert, this), null, $.proxy(this._onCloseConfirmAlert, this));
  },

  _bindConfirmAlert: function($popupContainer) {
    $popupContainer.find('.tw-popup-confirm>button').on('click', $.proxy(this._setConfirmAlertApply, this));
  },

  _setConfirmAlertApply: function() {
    this._isDoCallback = true;

    if (this._isPopup) {
      this._popupService.close();
    }
  },

  _onCloseConfirmAlert: function() {
    if (!this._isDoCallback) {
      return;
    }

    this._doCallback();
  },

  _toggleApplyBtn: function(toggle) {
    if (this._data.isWireplan && this._data.isTerm) {
      toggle = !Tw.FormatHelper.isEmpty(this._termRsnCd);
    }

    if (toggle) {
      this.$btnApply.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnApply.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _doCallback: function() {
    var callbackParams = {};

    if (this._data.isWireplan && this._data.isTerm) {
      callbackParams.termRsnCd = this._termRsnCd;
    }

    this._applyCallback(callbackParams);
  }

};
