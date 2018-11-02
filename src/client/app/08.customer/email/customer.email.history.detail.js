/**
 * FileName: customer.email.history.detail.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.1
 */

Tw.CustomerEmailHistoryDetail = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailHistoryDetail.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
  }
};

