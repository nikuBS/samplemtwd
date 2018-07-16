/**
 * FileName: payment.realtime.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.23
 */

Tw.PaymentRealtime = function (rootEl) {
  this.$container = rootEl;
  this.$bankList = [];
  this.$window = $(window);
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._bankList = new Tw.BankList(this.$container);
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._initVariables();
  this._bindEvent();
};

Tw.PaymentRealtime.prototype = {
  _initVariables: function () {
    this.$amount = 0;
    this.$autoPayInfo = this.$container.find('.auto-pay-info');
    this.$isAutoInfo = null;
    this.$autoWrap = this.$container.find('.pay-info.auto');
    this.$refundWrap = this.$container.find('.pay-info.refund');
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('change', '.checkbox-main', $.proxy(this._sumCheckedAmount, this));
    this.$container.on('click', '.select-payment-option', $.proxy(this._isCheckedAmount, this));
    this.$container.on('click', '.select-account', $.proxy(this._getAutoInfo, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.pay-check-box', $.proxy(this._setAutoInfo, this));
    this.$container.on('click', '.get-point', $.proxy(this._getPoint, this));
    this.$container.on('click', '.get-cashbag-point', $.proxy(this._getCashbagPoint, this));
    this.$container.on('click', '.pay', $.proxy(this._pay, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
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
      this._popupService.openAlert(Tw.MSG_PAYMENT.REALTIME_A01);
    }
    else {
      this._go('#step1');
    }
  },
  _getAutoInfo: function (event) {
    event.preventDefault();
    if (this.$isAutoInfo === null) {
      this._apiService.request(Tw.API_CMD.BFF_07_0022, {})
        .done($.proxy(this._getAutoSuccess, this))
        .fail($.proxy(this._getAutoFail, this));
    }
  },
  _getAutoSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (res.result.autoPayEnable === 'Y') {
        var $autoPayBank = res.result.autoPayBank;
        this.$autoPayInfo.attr('id', $autoPayBank.bankCardCoCd).attr('num', $autoPayBank.bankCardNum).text($autoPayBank.bankCardCoNm);
        this.$container.find('.auto-info-checkbox').removeClass('none');
        this.$isAutoInfo = true;
      } else {
        this.$isAutoInfo = false;
      }
    }
    this._go('step2-account');
  },
  _getAutoFail: function () {
    Tw.Logger.info('get auto info fail');
  },
  _setAutoInfo: function (event) {
    var $target = $(event.currentTarget);
    var bankId, bankName, bankNum, $wrapper = null;
    if ($target.hasClass('auto-info')) {
      bankId = this.$autoPayInfo.attr('id');
      bankName = this.$autoPayInfo.text();
      bankNum = this.$autoPayInfo.attr('num');
      $wrapper = this.$autoWrap;
    } else {
      bankId = this.$autoWrap.find('.select-bank').attr('id');
      bankName = this.$autoWrap.find('.select-bank').text();
      bankNum = this.$autoWrap.find('.select-bank').attr('num');
      $wrapper = this.$refundWrap;
    }

    if ($target.hasClass('checked')) {
      $wrapper.find('.select-bank').attr('id', bankId).text(bankName);
      $wrapper.find('.account-number').val(bankNum);
    } else {
      $wrapper.find('.select-bank').removeAttr('id').text(Tw.PAYMENT_STRING.BANK_NAME);
      $wrapper.find('.account-number').val('');
    }
  },
  _selectBank: function (event) {
    this._bankList.init(event);
  },
  _getPoint: function () {
    this._popupService.open({
      hbs: 'PA_05_04_L01'
    });
  },
  _getCashbagPoint: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0028, {})
      .done($.proxy(this._pointSuccess, this))
      .fail($.proxy(this._pointFail, this));
  },
  _pointSuccess: function (res) {
    this._popupService._popupClose();
    console.log(res.result.availPt, res.result.availTPt);
  },
  _pointFail: function () {
    Tw.Logger.info('point request fail');
  },
  _pay: function (event) {
    event.preventDefault();

    this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
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