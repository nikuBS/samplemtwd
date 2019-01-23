/**
 * FileName: myt-data.familydata.share.immediately.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTDataFamilyShareImmediately = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  new Tw.MyTDataFamilyShare(rootEl);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilyShareImmediately.prototype = {
  _init: function() {
    this.MAIN_URL = '/myt-data/familydata';
  },

  _cachedElement: function() {
    this.$amountInput = this.$container.find('span.input input');
  },

  _bindEvent: function() {
    this.$container.on('click', '.bt-red1 button', $.proxy(this._confirmSubmit, this));
  },

  _confirmSubmit: function() {
    var POPUP = Tw.MYT_DATA_FAMILY_CONFIRM_SHARE;
    this._popupService.openModalTypeA(
      POPUP.TITLE,
      POPUP.CONTENTS.replace('{data}', this.$amountInput.val()),
      POPUP.BTN_NAME,
      null,
      $.proxy(this._handleSubmit, this)
    );
  },

  _handleSubmit: function() {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_06_0046, { dataQty: this.$amountInput.val() }).done($.proxy(this._handleSuccessSubmit, this));
  },

  _handleSuccessSubmit: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      var ALERT = Tw.MYT_DATA_FAMILY_SUCCESS_SHARE;
      this._popupService.afterRequestSuccess(this.MAIN_URL, this.MAIN_URL, undefined, ALERT.TITLE, undefined);
    }
  }
};
