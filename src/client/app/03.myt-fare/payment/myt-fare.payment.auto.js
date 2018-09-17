/**
 * FileName: myt-fare.payment.auto.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFarePaymentAuto = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
  this._bindEvent();
};

Tw.MyTFarePaymentAuto.prototype = {
  _init: function () {
    this.$container.find('.fe-data').empty();
    this._getAutoPaymentOption();
  },
  _bindEvent: function () {
    
  },
  _getAutoPaymentOption: function () {

  }
};