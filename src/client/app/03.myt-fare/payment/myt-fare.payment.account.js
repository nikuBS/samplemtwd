/**
 * FileName: myt-fare.payment.account.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFarePaymentAccount = function (rootEl) {
  this.$container = rootEl;
  this.$selectBank = this.$container.find('.fe-select-bank');
  this.$refundBank = this.$container.find('.fe-select-refund-bank');
  this.$accountNumber = this.$container.find('.fe-account-number');
  this.$refundNumber = this.$container.find('.fe-refund-account-number');
  this.$refundBox = this.$container.find('.check-account-radio');

  this._paymentCommon = new Tw.MyTFarePaymentCommon(this.$container);
  this._bankList = new Tw.MyTFarePaymentBankList(this.$container);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePaymentAccount.prototype = {
  _init: function () {
    this._bindEvent();
  },
  _bindEvent: function () {
    this.$container.on('change', '.refund-account-check-btn', $.proxy(this._showAndHideAccount, this));
    this.$container.on('click', '.fe-refund-info', $.proxy(this._openRefundInfo, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.fe-check-pay', $.proxy(this._checkPay, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._pay, this));
  },
  _showAndHideAccount: function (event) {
    var $target = $(event.currentTarget);
    if ($target.hasClass('checked')) {
      this.$refundBox.show();
    } else {
      this.$refundBox.hide();
    }
  },
  _openRefundInfo: function () {
    this._popupService.openAlert(Tw.REFUND_ACCOUNT_INFO.CONTENTS, Tw.REFUND_ACCOUNT_INFO.TITLE);
  },
  _selectBank: function (event) {
    this._bankList.init(event);
  },
  _checkPay: function () {
    if (this._isValid()) {
      this._historyService.goHash('#check');
      this._setData();
    }
  },
  _isValid: function () {
    return (this._validation.checkIsSelected(this.$selectBank, Tw.MSG_PAYMENT.REALTIME_A02) &&
      this._validation.checkEmpty(this.$accountNumber.val(), Tw.MSG_PAYMENT.AUTO_A03) &&
      this._validation.checkIsSelected(this.$refundBank, Tw.MSG_PAYMENT.REALTIME_A02) &&
      this._validation.checkEmpty(this.$refundNumber.val(), Tw.MSG_PAYMENT.AUTO_A03));
  },
  _setData: function () {
    this.$container.find('.fe-payment-option-name').attr('id', this.$selectBank.attr('id')).text(this.$selectBank.text());
    this.$container.find('.fe-payment-option-number').text(this.$accountNumber.val());
    this.$container.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this._paymentCommon.getAmount().toString()));
    this.$container.find('.fe-payment-refund').attr('id', this.$refundBank.attr('id'))
      .text(this.$refundBank.text() + ' ' + this.$refundNumber.val());
  },
  _pay: function () {
    var reqData = this._makeRequestData();
    this._apiService.request(Tw.API_CMD.BFF_07_0023, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _makeRequestData: function () {
    var reqData = {
      payovrBankCd: this.$container.find('.fe-payment-refund').attr('id'),
      payovrBankNum: $.trim(this.$refundNumber.val()),
      payovrCustNm: $.trim(this.$container.find('.fe-name').val()),
      bankOrCardCode: this.$selectBank.attr('id'),
      bankOrCardAccn: $.trim(this.$accountNumber.val()),
      unpaidBillList: this._paymentCommon.getBillList()
    };
    return reqData;
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.setHistory();
      this._historyService.goHash('#complete');
    } else {
      this._payFail(res.error);
    }
  },
  _payFail: function (err) {
    this._popupService.openAlert(err.message, err.code);
  }
};