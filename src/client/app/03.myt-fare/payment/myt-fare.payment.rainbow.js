/**
 * FileName: myt-fare.payment.rainbow.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.24
 */

Tw.MyTFarePaymentRainbow = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePaymentRainbow.prototype = {
  _init: function () {
  }
};