/**
 * FileName: payment.history.excess-pay.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */
Tw.PaymentHistoryExcessPay = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;
};

Tw.PaymentHistoryExcessPay.prototype = {

};
