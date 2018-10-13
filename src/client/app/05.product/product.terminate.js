/**
 * FileName: product.terminate.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.13
 */

Tw.ProductTerminate = function(rootEl, prodId, terminateApiCode, displayId) {
  this.$container = rootEl;
  this._prodId = prodId;
  this._terminateApiCode = terminateApiCode;
  this._displayId = displayId;

  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductTerminate.prototype = {

  _init: function() {
    if (this.$agreeWrap.length < 1) {
      this._enableBtnTerminate();
    }

    if (Tw.FormatHelper.isEmpty(this._terminateApiCode) && Tw.FormatHelper.isEmpty(this._displayId)) {
      this._terminateApiCode = 'BFF_10_0036';
    }

    if (Tw.FormatHelper.isEmpty(this._terminateApiCode) && !Tw.FormatHelper.isEmpty(this._displayId)) {
      this._terminateApiCode = 'BFF_10_0022';
    }
  },

  _cachedElement: function() {
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$agreeWrap = this.$container.find('.fe-agree_wrap');
    this.$btnAgreeShow = this.$container.find('.fe-btn_agree_view');

    this.$checkboxAgreeAll = this.$container.find('.fe-checkbox_agree_all');
    this.$checkboxAgreeItem = this.$container.find('.fe-checkbox_agree_item');
  },

  _bindEvent: function() {
    this.$btnTerminate.on('click', $.proxy(this._openConfirmPopup, this));
    this.$btnAgreeShow.on('click', $.proxy(this._openAgreePop, this));

    this.$checkboxAgreeAll.on('change', $.proxy(this._agreeAllToggle, this));
    this.$checkboxAgreeItem.on('change', $.proxy(this._agreeItemToggle, this));
  },

  _agreeAllToggle: function() {
    var isAllCheckboxChecked = this.$checkboxAgreeAll.is(':checked');

    this.$checkboxAgreeItem.prop('checked', isAllCheckboxChecked);
    this.$checkboxAgreeItem.parents('.fe-checkbox_style').toggleClass('checked', isAllCheckboxChecked)
      .attr('aria-checked', isAllCheckboxChecked);

    this._enableBtnTerminate();
  },

  _agreeItemToggle: function() {
    var isCheckboxItemChecked = this.$container.find('.fe-checkbox_agree_item:not(:checked)').length < 1;

    this.$checkboxAgreeAll.prop('checked', isCheckboxItemChecked);
    this.$checkboxAgreeAll.parents('.fe-checkbox_style').toggleClass('checked', isCheckboxItemChecked)
      .attr('aria-checked', isCheckboxItemChecked);

    this._enableBtnTerminate();
  },

  _enableBtnTerminate: function() {
    if (this.$container.find('.fe-checkbox_agree_need:not(:checked)').length > 0) {
      this.$btnTerminate.attr('disabled', 'disabled').prop('disabled', true);
    } else {
      this.$btnTerminate.removeAttr('disabled').prop('disabled', false);
    }
  },

  _openAgreePop: function(e) {
    var $parent = $(e.currentTarget).parent();
    this._popupService.open({
      hbs: 'PFT_01_03_L01',
      data: {
        title: $parent.find('.mtext').text(),
        html: $parent.find('.fe-agree_full_html').text()
      }
    }, null, null, 'agree_pop');
  },

  _openConfirmPopup: function() {
    this._popupService.openModalTypeA(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.TITLE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.BUTTON, null, $.proxy(this._procTerminate, this));
  },

  _procTerminate: function() {
    this._apiService.request(Tw.API_CMD[this._terminateApiCode], {}, {}, this._prodId)
      .done($.proxy(this._procTerminateRes, this));
  },

  _procTerminateRes: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).page();
    }

    var isProdMoney = this.$prodMoney && (this.$prodMoney.length > 0);

    this._popupService.open({
      hbs: 'DC_05_01_end_01_product',
      data: Object.assign(this._successData, {
        prodId: this._prodId,
        prodNm: this.$joinConfirmLayer.data('prod_nm'),
        typeNm: Tw.PRODUCT_TYPE_NM.TERMINATE,
        isBasFeeInfo: isProdMoney,
        basFeeInfo: isProdMoney ? this.$prodMoney.text() : ''
      })
    }, $.proxy(this._bindTerminateResPopup, this), null, 'join_success');
  },

  _bindTerminateResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._goProductDetail, this));
  },

  _goProductDetail: function() {
    this._historyService.goLoad('/product/detail/' + this._prodId);
  }

};
