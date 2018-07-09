/**
 * FileName: recharge.ting.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeLimit = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  // this._cachedElement();
  // this._bindEvent();
  this._init();
};


Tw.RechargeLimit.prototype = {
  _init: function () {
  }
};

