/**
 * FileName: myt.bill.guidechange.change-complete.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.16
 */

Tw.MyTBillGuidechangeChangeComplete = function (rootEl) {
  this.$container = rootEl;
  this.$document = $(document);
  this.$window = window;

  this._history = new Tw.HistoryService();

  this._complete();
};

Tw.MyTBillGuidechangeChangeComplete.prototype = {
  _complete: function () {
    this._history.complete();
  }
};