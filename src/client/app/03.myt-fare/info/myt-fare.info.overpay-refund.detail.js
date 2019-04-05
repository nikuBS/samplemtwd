/**
 * @file myt-fare.overpay-refund.detail.js
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018. 9. 17
 */
Tw.MyTFareInfoOverpayRefundDetail = function (rootEl, data) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService(rootEl);

  this.data = data ? JSON.parse(data) : '';

  this._init();
};

Tw.MyTFareInfoOverpayRefundDetail.prototype = {
  _init: function () {
    this.detailData = this.data; // : JSON.parse(Tw.CommonHelper.getLocalStorage('detailData'));
  }

};