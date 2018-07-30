/**
 * FileName: customer.email.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerEmail = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerEmail.prototype = {
  _cachedElement: function () {

  },

  _bindEvent: function () {
    // this._apiService.request(Tw.API_CMD.BFF_08_0014, {}).done(function(){});
  }
};