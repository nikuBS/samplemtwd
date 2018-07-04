/**
 * FileName: payment.history.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.02
 */

Tw.PaymentHistory = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);

  this._apiService = new Tw.ApiService();
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');
  this._bindEvent();
};

Tw.PaymentHistory.prototype = {
};
