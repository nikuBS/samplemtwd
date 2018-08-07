/**
 * FileName: payment.prepay.history.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.25
 */

Tw.PaymentPrepayHistory = function (rootEl, title) {
  this.$container = rootEl;
  this.$title = title;
  this.$window = $(window);
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.PaymentPrepayHistory.prototype = {
  _bindEvent: function () {
  }
};