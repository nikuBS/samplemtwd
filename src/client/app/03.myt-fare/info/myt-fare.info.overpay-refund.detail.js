/**
 * FileName: myt-fare.overpay-refund.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018. 9. 17
 */
Tw.MyTFareInfoOverpayRefundDetail = function (rootEl, data) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService(rootEl);

  this.data = data ? JSON.parse(data) : '';

  this._init();
};

Tw.MyTFareInfoOverpayRefundDetail.prototype = {
  _init: function () {
    this.detailData = JSON.parse(Tw.UIService.getLocalStorage('detailData'));

    this._initDetail();
  },
  // detail 정보
  _initDetail: function () {
    this.$template = {
      $reqDate: $('#fe-detail-date'),
      $reqAmt: $('#fe-detail-req-amt'),
      $overAmt: $('#fe-detail-over-amt'),
      $bondAmt: $('#fe-detail-bond-amt'),
      $total: $('#fe-detail-total'),
      $statusIng: $('#fe-detail-ing'),
      $statusEtc: $('#fe-detail-etc'),
      $statusInnerText: $('.fe-detail-status'),
      $refundDoneAmt: $('#fe-detail-refund-total'),
      $refundResultWrapper: $('#fe-detail-overpay-refund-result'),
      $bankName: $('#fe-detail-bank-name'),
      $bankNumber: $('#fe-detail-bank-num'),
      $procDate: $('#fe-detail-proc-date')
    };

    this.$template.$refundResultWrapper.css({'display': this.detailData.rfndStat !== 'ING' ? '' : 'none'});
    this.$template.$statusIng.css({'display': this.detailData.rfndStat !== 'ING' ? 'none' : ''});
    this.$template.$statusEtc.css({'display': this.detailData.rfndStat !== 'ING' ? '' : 'none'});

    this.$template.$reqDate.text(this.detailData.reqDt);
    this.$template.$reqAmt.text(this.detailData.dataAmt);
    this.$template.$overAmt.text(this.detailData.dataOverAmt);
    this.$template.$bondAmt.text(this.detailData.dataBondAmt);
    this.$template.$total.text(this.detailData.dataAmt);

    this.$template.$refundDoneAmt.text(this.detailData.dataAmt);
    this.$template.$bankName.text(this.detailData.rfndBankNm);
    this.$template.$bankNumber.text(this.detailData.rfndBankNum);
    this.$template.$procDate.text(this.detailData.dataDt);

    this.$template.$statusInnerText.text(this.detailData.dataStatus);

    console.log(this.detailData, this.$template);

  }
};