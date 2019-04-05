/**
 * FileName: product.mobileplan.setting.ting.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

Tw.ProductMobileplanSettingTing = function(rootEl, prodId, displayId, currentTingSettings) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._currentTingSettings = JSON.parse(currentTingSettings);

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._init();

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductMobileplanSettingTing.prototype = {

  _init: function() {
    this.$container.find('input[value="' + this._currentTingSettings.beforeLmtGrCd + '"]').trigger('click');
  },

  _cachedElement: function() {
    this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this));
    this.$btnSetupOk.on('click', $.proxy(this._procSetupOk, this));
  },

  _enableSetupButton: function() {
    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  _procSetupOk: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    if (this._currentTingSettings.beforeLmtGrCd === $checked.val()) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0041, {
      beforeLmtGrCd: this._currentTingSettings.beforeLmtGrCd,
      afterLmtGrCd: $checked.val()
    }, {}, $checked.val()).done($.proxy(this._procSetupOkRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _procSetupOkRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
        typeNm: Tw.PRODUCT_TYPE_NM.CHANGE
      }
    }, $.proxy(this._bindSuccessPopup, this), $.proxy(this._onClosePop, this), 'save_setting_success');
  },

  _bindSuccessPopup: function($popupContainer) {
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
