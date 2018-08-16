/**
 * FileName: customer.event.main.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.17
 */

Tw.CustomerEventMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();
  this._bindEvent();
};

Tw.CustomerEventMain.prototype = {
  _init: function () {
  },
  _bindEvent: function () {
  }
};

