/**
 * FileName: customer.email.history.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.1
 */

Tw.CustomerEmailHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailHistory.prototype = {
  _init: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_08_0060, { svcDvcClCd: 'M' })
      .done($.proxy(this._onSuccessHistoryList, this));
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
  },

  _onSuccessHistoryList: function (res) {
  }
};