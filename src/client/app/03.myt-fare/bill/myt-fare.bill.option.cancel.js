/**
 * FileName: myt-fare.bill.option.cancel.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 * Annotation: 자동납부 해지
 */

Tw.MyTFareBillOptionCancel = function (rootEl) {
  this.$container = rootEl;
  this.$bankList = [];
  this.$infoBox = this.$container.find('.fe-info');

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._isComplete = false;
  this._isClose = false;

  this._bindEvent();
};

Tw.MyTFareBillOptionCancel.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.fe-go-cancel', $.proxy(this._cancel, this));
  },
  _cancel: function () {
    var reqData = this._makeRequestData();

    this._apiService.request(Tw.API_CMD.BFF_07_0063, reqData)
      .done($.proxy(this._cancelSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _makeRequestData: function () {
    var $selectBox = this.$container.find('.fe-select-payment-option');
    var reqData = {
      acntNum: this.$infoBox.attr('data-acnt-num'),
      payerNumClCd: this.$infoBox.attr('data-payer-num-cl-cd'),
      payMthdCd: this.$infoBox.attr('data-pay-mthd-cd'),
      newPayMthdCd: $selectBox.find('.checked').attr('id'),
      bankCardCoCd: this.$infoBox.attr('data-bank-card-co-cd'),
      bankPrtYn: this.$infoBox.attr('data-bank-prt-yn'),
      serNum: this.$infoBox.attr('data-ser-num'),
      authReqSerNum: this.$infoBox.attr('data-auth-req-ser-num'),
      rltmSerNum: this.$infoBox.attr('data-rltm-ser-num')
    };
    return reqData;
  },
  _cancelSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var completeUrl = '/myt-fare/bill/option/cancel-complete';

      if (this.$container.find('.fe-select-payment-option').find('.checked').attr('id') === '04') {
        completeUrl += '?isSms=Y&num=' + this.$infoBox.attr('data-acnt-num');
      }
      this._historyService.replaceURL(completeUrl);
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).page();
  }
};