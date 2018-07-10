/**
 * FileName: recharge.cookiz.process.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.09
 */

Tw.RechargeCookizProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  // this._cachedElement();
  // this._bindEvent();
  this._init();
};

Tw.RechargeCookizProcess.prototype = {
  _init: function () {

  }
};