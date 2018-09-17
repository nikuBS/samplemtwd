/**
 * FileName: myt-fare.payment.point.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFarePaymentPoint = function (rootEl) {
  this.$container = rootEl;
  this._init();
};

Tw.MyTFarePaymentPoint.prototype = {
  _init: function () {
    console.log('call point');
  }
};