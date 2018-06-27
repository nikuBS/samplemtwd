/**
 * FileName: payment.realtime.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.23
 */

Tw.PaymentRealtime = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);

  this.history = new Tw.HistoryService(rootEl);
  this.history.init();
  this._bindEvent();
};

Tw.PaymentRealtime.prototype = Object.create(Tw.View.prototype);
Tw.PaymentRealtime.prototype.constructor = Tw.PaymentRealtime;

Tw.PaymentRealtime.prototype = Object.assign(Tw.PaymentRealtime.prototype, {
  _bindEvent: function () {
    this.$container.on('click', '.btn', $.proxy(this._toggleEvent, this));
    this.$container.on('click', '.complete', $.proxy(this._setHistory, this));
  },
  _setHistory: function (event) {
    this.history.setHistory(event);
  },
  _toggleEvent: function (event) {
    Tw.Common.toggle($(event.currentTarget));
  }
});