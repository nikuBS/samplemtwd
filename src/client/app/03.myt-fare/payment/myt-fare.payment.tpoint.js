/**
 * FileName: myt-fare.payment.tpoint.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.24
 */

Tw.MyTFarePaymentTPoint = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePaymentTPoint.prototype = {
  _init: function () {
  }
};