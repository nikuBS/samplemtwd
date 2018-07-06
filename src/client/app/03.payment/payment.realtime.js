/**
 * FileName: payment.realtime.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.23
 */

Tw.PaymentRealtime = function (rootEl) {
  this.$container = rootEl;
  this.$bankList = [];
  this.$selectedBank = {};
  this.$window = $(window);
  this.$document = $(document);
  this.$amount = 0;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._bindEvent();
};

Tw.PaymentRealtime.prototype = {
  _bindEvent: function () {
    this.$container.on('change', '.checkbox-main', $.proxy(this._sumCheckedAmount, this));
    this.$container.on('click', '.select-payment-option', $.proxy(this._isCheckedAmount, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.pay', $.proxy(this._pay, this));
    this.$document.on('click', '.hbs-bank-list', $.proxy(this._getSelectedBank, this));
  },
  _sumCheckedAmount: function (event) {
    var $target = $(event.target);
    var $amount = $target.data('value');
    if ($target.is(':checked')) {
      this.$amount += $amount;
    }
    else {
      this.$amount -= $amount;
    }
    this.$container.find('.total-amount').text(Tw.FormatHelper.addComma(this.$amount.toString()));
  },
  _isCheckedAmount: function (event) {
    event.preventDefault();

    var checkedLength = this.$container.find('.checked').length;
    if (checkedLength === 0) {
      this._popupService.openAlert(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_PAYMENT.REALTIME_A01);
    }
    else {
      this._go('#step1');
    }
  },
  _selectBank: function () {
    if (this._isNotExistBankList()) {
      this._getBankList();
    }
    else {
      this._openBank();
    }
  },
  _getBankList: function () {
    $.ajax('/mock/payment.bank-list.json')
//    this._apiService.request(Tw.API_CMD.BFF_07_0022, {})
      .done($.proxy(this._getBankListSuccess, this))
      .fail($.proxy(this._getBankListFail, this));
  },
  _isNotExistBankList: function () {
    return Tw.FormatHelper.isEmpty(this.$bankList);
  },
  _openBank: function () {
    this._popupService.openBank(this.$bankList);
  },
  _getSelectedBank: function (event) {
    var $target = $(event.currentTarget);
    this.$selectedBank[$target.data('value')] = $target.text();
    this._popupService.close();
  },
  _pay: function (event) {
    event.preventDefault();

    this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _getBankListSuccess: function (res) {
    if (res.code === '00') {
      this._setBankList(res);
    }
  },
  _getBankListFail: function () {
    Tw.Logger.info('pay request fail');
  },
  _setBankList: function (res) {
    var bankList = res.result.bnkcrdlist2;
    for (var i = 0; i < bankList.length; i++) {
      var bankObj = {
        key: bankList[i].commCdVal,
        value: bankList[i].commCdValNm
      };
      this.$bankList.push(bankObj);
    }
    this._openBank();
  },
  _paySuccess: function () {
    this._history.setHistory();
    this._go('#complete');
  },
  _payFail: function () {
    Tw.Logger.info('pay request fail');
  },
  _go: function (hash) {
    window.location.hash = hash;
  }
};