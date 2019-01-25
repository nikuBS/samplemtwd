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
    this.$amountInput = this.$container.find('.fe-amount');
  },

  _bindEvent: function() {
    $('.wrap').on('click', '.prev-step', $.proxy(this._openCancelPopup, this));
    this.$container.on('click', '.fe-submit', $.proxy(this._confirmSubmit, this));
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
  },

  _openCancelPopup: function() {
    this._popupService.openConfirmButton(
      Tw.ALERT_CANCEL,
      null,
      $.proxy(this._goBack, this),
      $.proxy(this._handleAfterClose, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES
    );
  },

  _goBack: function() {
    this._popupService.close();
    this._isClose = true;
  },

  _handleAfterClose: function() {
    if (this._isClose) {
      history.back();
      this._isClose = false;
    }
  }
};
