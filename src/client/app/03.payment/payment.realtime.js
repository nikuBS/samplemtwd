/**
 * FileName: payment.realtime.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.23
 */

Tw.PaymentRealtime = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);

  this._apiService = new Tw.ApiService();
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');
  this._bindEvent();
};

Tw.PaymentRealtime.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.btn', $.proxy(this._toggleEvent, this));
    this.$container.on('click', '.pay', $.proxy(this._pay, this));
  },
  _pay: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));
  },
  _success: function () {
    this._setHistory();
    this._go('#process-complete');
  },
  _fail: function () {
    Tw.Logger.info('pay request fail');
  },
  _setHistory: function () {
    this._history.setHistory();
  },
  _toggleEvent: function (event) {
    Tw.UIService.toggle($(event.currentTarget));
  },
  _go: function (hash) {
    window.location.hash = hash;
  }
};