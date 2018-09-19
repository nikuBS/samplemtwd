/**
 * FileName: myt-fare.payment.account.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFarePaymentAccount = function (rootEl) {
  this.$container = rootEl;
  this.$selectBank = this.$container.find('.select-bank');
  this._paymentCommon = new Tw.MyTFarePaymentCommon(this.$container);
  this._bankList = new Tw.MyTFarePaymentBankList(this.$container);
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePaymentAccount.prototype = {
  _init: function () {
    this._bindEvent();
  },
  _bindEvent: function () {
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._pay, this));
    this.$container.on('click', '.fe-pay-complete', $.proxy(this._completePay, this));
  },
  _selectBank: function (event) {
    this._bankList.init(event);
  },
  _pay: function () {
    if (Tw.FormatHelper.isEmpty(this.$container.find('.fe-account-number').val())) {
      this._popupService.openAlert('insert account number');
    } else {
      this._historyService.goHash('#check');
      this._setData();
    }
  },
  _setData: function () {
    this.$container.find('.fe-payment-option-name').attr('id', this.$selectBank.attr('id')).text(this.$selectBank.text());
    this.$container.find('.fe-payment-option-number').text(this.$container.find('.fe-account-number').val());
    this.$container.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this._paymentCommon.getAmount().toString()));
  },
  _completePay: function () {
    this._historyService.setHistory();
    this._historyService.goHash('#complete');
  }
};