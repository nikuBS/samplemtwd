/**
 * FileName: payment.auto.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.05
 */

Tw.PaymentAuto = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._bankList = new Tw.BankList(this.$container);
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._initVariables();
  this._bindEvent();
};

Tw.PaymentAuto.prototype = {
  _initVariables: function () {
    this.$bankSelector = this.$container.find('.select-bank');
    this.$accountNumber = this.$container.find('.account-number');
    this.$phoneNumber = this.$container.find('.phone-number');
  },
  _bindEvent: function () {
    this.$container.on('click', '.change-date', $.proxy(this._changeDate, this));
    this.$container.on('keyup', '.only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.change', $.proxy(this._change, this));
    this.$container.on('click', '.cancel', $.proxy(this._cancel, this));
  },
  _bindPopupEvent: function () {

  },
  _openChangeDate: function () {
    this._popupService.open({
      hbs:'PA_03_02_L01'
    });
  },
  _changeDate: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0065, { payCyclCd: 0 })
      .done($.proxy(this._changeDateSuccess, this))
      .fail($.proxy(this._changeDateFail, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _isValid: function () {
    return (this._validation.checkIsSelected(this.$bankSelector, Tw.MSG_PAYMENT.REALTIME_A02) &&
      this._validation.checkEmpty(this.$accountNumber.val(), Tw.MSG_PAYMENT.AUTO_A03) &&
      this._validation.checkEmpty(this.$phoneNumber.val(), Tw.MSG_PAYMENT.AUTO_A02));
  },
  _selectBank: function (event) {
    this._bankList.init(event);
  },
  _change: function (event) {
    event.preventDefault();

    if (this._isValid()) {
      this._apiService.request(Tw.API_CMD.BFF_07_0061, {})
        .done($.proxy(this._changeSuccess, this))
        .fail($.proxy(this._changeFail, this));
    }
  },
  _cancel: function (event) {
    event.preventDefault();

    this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
      .done($.proxy(this._cancelSuccess, this))
      .fail($.proxy(this._cancelFail, this));
  },
  _changeDateSuccess: function (res) {
    console.log(res);
  },
  _changeDateFail: function () {
    Tw.Logger.info('change request fail');
  },
  _changeSuccess: function () {
    this._history.setHistory();
    this._go('#complete-change');
  },
  _changeFail: function () {
    Tw.Logger.info('change request fail');
  },
  _cancelSuccess: function () {
    this._history.setHistory();
    this._go('#complete-cancel');
  },
  _cancelFail: function () {
    Tw.Logger.info('cancel request fail');
  },
  _go: function (hash) {
    window.location.hash = hash;
  }
};