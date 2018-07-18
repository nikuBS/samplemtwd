/**
 * FileName: myt.bill.guidechange.update-complete.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.16
 */

Tw.MyTBillGuidechangeUpdateComplete = function (rootEl) {
  this.$container = rootEl;
  this.$document = $(document);
  this.$window = window;

  this._history = new Tw.HistoryService();

  this._complete();
  this._assign();
  this._bindEvent();
};

Tw.MyTBillGuidechangeUpdateComplete.prototype = {
  _assign: function () {
    this._$closeStep = this.$container.find('.close-step');
  },

  _bindEvent: function () {
    this._$closeStep.on('click', $.proxy(this._closeStep, this));
  },

  _closeStep: function() {
    window.location.href = '/myt/bill/guidechange';
  },

  _complete: function () {
    this._history.complete();
  }
};