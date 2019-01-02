/**
 * FileName: product.mobileplan.setting.tplan.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

Tw.ProductMobileplanSettingTplan = function(rootEl, prodId, displayId, currentBenefitProdId) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._prodId = prodId;
  this._displayId = displayId;
  this._currentBenefitProdId = currentBenefitProdId;

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductMobileplanSettingTplan.prototype = {

  _init: function() {
    if (Tw.FormatHelper.isEmpty(this._currentBenefitProdId)) {
      return;
    }

    this.$container.find('input[value="' + this._currentBenefitProdId + '"]').trigger('click');
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

    if (this._currentBenefitProdId === $checked.val()) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0014, {
      beforeTDiyGrCd: this._currentBenefitProdId,
      afterTDiyGrCd: $checked.val()
    }, {}, [$checked.val()]).done($.proxy(this._procSetupOkRes, this));
  },

  _procSetupOkRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code === 'ZCOLE0001') {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A46.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A46.TITLE);
    }

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
  },

  _closePop: function() {
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }
  
};
