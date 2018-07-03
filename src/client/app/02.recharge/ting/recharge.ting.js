/**
 * FileName: recharge.ting.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeTing = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeTing.prototype = {
  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0020, {})
      .done($.proxy(this._onSuccessGetProvider, this))
      .fail($.proxy(this._sendFail, this));
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
  },

  _onSuccessGetProvider: function () {
  },

  _sendFail: function () {
  }
};