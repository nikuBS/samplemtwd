/**
 * @file [나의요금-환불처리-상세] 관련 처리
 * @author Lee Kirim
 * @since 2018. 9. 17
 */

/**
 * @class 
 * @desc 환불처리 상세를 위한 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - myt-fare.info.overpay-refund.detail.controller.ts 로 부터 전달되어 온 납부내역 정보
 */
Tw.MyTFareInfoOverpayRefundDetail = function (rootEl, data) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService(rootEl);

  this.data = data ? JSON.parse(data) : '';

  this._init();
};

Tw.MyTFareInfoOverpayRefundDetail.prototype = {
  _init: function () {
    this.detailData = this.data;
  }

};