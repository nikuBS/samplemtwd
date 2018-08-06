/**
 * FileName: customer.email.service.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerEmailService = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailService.prototype = {
  _init: function () {
    // this._apiService.request(Tw.API_CMD.BFF_08_0010, {}).done($.proxy(this._setServiceCategory, this));
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-email-cancel', $.proxy(this._onCancelEmail, this));
    this.$container.on('click', '.fe-email-register', $.proxy(this._registerEmail, this));
  },

  _onCancelEmail: function () {
    this._popupService.openConfirm(
      Tw.BUTTON_LABEL.CONFIRM,
      Tw.MSG_CUSTOMER.EMAIL_A01,
      null,
      null,
      $.proxy(this._goCustomerMain, this),
      this._popupService.close);
  },

  _registerEmail: function(){

  },

  _goCustomerMain: function () {
    this._popupService.close();
    this._history.goBack();
  }
};

