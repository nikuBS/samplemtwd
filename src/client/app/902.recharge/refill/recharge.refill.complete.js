/**
 * FileName: recharge.refill.complete.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.27
 */

Tw.RechargeRefillComplete = function (rootEl) {
  this.$container = rootEl;
  this.$document = $(document);
  this.$window = window;

  this._history = new Tw.HistoryService();

  this._bindEvent();
  this._complete();
};

Tw.RechargeRefillComplete.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.refill-history', $.proxy(this._goHistory, this));
  },
  _goHistory: function () {
    this._goLoad('/recharge/refill/history');
  },
  _goLoad: function (url) {
    this.$window.location.href = url;
  },
  _complete: function () {
    this._history.complete();
  }
};