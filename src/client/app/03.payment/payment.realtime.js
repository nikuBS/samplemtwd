/**
 * FileName: payment.realtime.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.23
 */

Tw.PaymentRealtime = function (rootEl) {
  this.$container = rootEl;
  this.common = new Tw.Common();

  this._bindEvent();
};

Tw.PaymentRealtime.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.btn', $.proxy(this._toggleEvent, this));
  },
  _toggleEvent: function (event) {
    this.common.toggle($(event.currentTarget));
  }
};