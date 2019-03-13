/**
 * FileName: product.wireplan.setting.lettering.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.02.14
 */

Tw.ProductWireplanSettingLettering = function(rootEl, prodId, displayId, btnData) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._btnData = JSON.parse(window.unescape(btnData));

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductWireplanSettingLettering.prototype = {

  _cachedElement: function() {
    this.$inputText = this.$container.find('.fe-input_text');

    this.$btnClear = this.$container.find('.fe-btn_clear');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$inputText.on('keyup input', $.proxy(this._detectInputText, this));

    this.$btnClear.on('click', $.proxy(this._clear, this));
    this.$btnSetupOk.on('click', $.proxy(this._procConfirm, this));
  },

  _detectInputText: function() {
    if (this.$inputText.val().length > 16) {
      this.$inputText.val(this.$inputText.val().substr(0, 16));
    }

    this._toggleSetupButton(this.$inputText.val().length > 0);
    this._toggleClearBtn();
  },

  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _clear: function() {
    this.$inputText.val('');
    this.$btnClear.hide().attr('aria-hidden', 'true');
    this._toggleSetupButton(false);
  },

  _toggleClearBtn: function() {
    if (this.$inputText.val().length > 0) {
      this.$btnClear.show().attr('aria-hidden', 'false');
    } else {
      this.$btnClear.hide().attr('aria-hidden', 'true');
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
      opCtt1: this.$inputText.val()
    }, {}, [this._prodId]).done($.proxy(this._procSettingRes, this))
      .fail(Tw.CommonHelper.endLoading('.container'));
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
