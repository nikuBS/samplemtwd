/**
 * FileName: myt-fare.payment.account.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFarePaymentAccount = function (rootEl) {
  this.$container = rootEl;
  this._init();
};

Tw.MyTFarePaymentAccount.prototype = {
  _init: function () {
    var common = new Tw.MyTFarePaymentCommon(this.$container);
    this._bindEvent();
  },
  _bindEvent: function () {

  }
};