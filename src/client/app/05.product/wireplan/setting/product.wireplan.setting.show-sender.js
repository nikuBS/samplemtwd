/**
 * @file product.wireplan.setting.show-sender.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019.02.14
 */

Tw.ProductWireplanSettingShowSender = function(rootEl, prodId, displayId, opCtt1) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._opCtt1 = opCtt1;

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._init();

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductWireplanSettingShowSender.prototype = {

  _init: function() {
    this.$container.find('input[type=radio][value="' + this._opCtt1 + '"]')
      .attr('checked', 'checked').prop('checked', true);
  },

  _cachedElement: function() {
    this.$inputRadio = this.$container.find('.fe-radio');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$inputRadio.on('change', $.proxy(this._checkSetupButton, this));
    this.$btnSetupOk.on('click', $.proxy(this._procConfirm, this));
  },

  _checkSetupButton: function() {
    this._toggleSetupButton(this.$container.find('input[type=radio]:checked').length > 0);
  },

  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _procConfirm: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0137, {
      addInfoExistYn: this._btnData.addInfoExistYn,
      addInfoRelScrnId: this._btnData.addInfoRelScrnId,
      addSvcAddYn: this._btnData.addSvcAddYn,
      cntcPlcInfoRgstYn: this._btnData.cntcPlcInfoRgstYn,
      svcProdGrpCd: this._btnData.svcProdGrpCd,
      opCtt1: this.$container.find('input[type=radio]:checked').val()
    }, {}, [this._prodId]).done($.proxy(this._procSettingRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _procSettingRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    setTimeout($.proxy(this._openSuccessPop, this), 100);
  },

  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
        typeNm: Tw.PRODUCT_TYPE_NM.CHANGE,
        btList: [],
        btClass: 'item-one'
      }
    }, $.proxy(this._bindSettingResPopup, this), $.proxy(this._onClosePop, this), 'setting_success');
  },

  _bindSettingResPopup: function($popupContainer) {
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
