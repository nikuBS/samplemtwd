/**
 * FileName: payment.realtime.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.23
 */

Tw.PaymentRealtime = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);
  this.$amount = 0;

  this._apiService = Tw.Api;
  this._uiService = Tw.Ui;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');
  this._bindEvent();
};

Tw.PaymentRealtime.prototype = {
  _bindEvent: function () {
    this.$container.on('change', '.checkbox-main', $.proxy(this._sumCheckedAmount, this));
    this.$container.on('click', '.select-payment-option', $.proxy(this._isCheckedAmount, this));
    this.$container.on('click', '.select-bank', $.proxy(this._openBank, this));
    this.$container.on('click', '.btn', $.proxy(this._toggleEvent, this));
    this.$container.on('click', '.pay', $.proxy(this._pay, this));
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
  _openBank: function () {
    // this._popupService.openBank();
  },
  _pay: function (event) {
    event.preventDefault();

    this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));
  },
  _success: function () {
    this._setHistory();
    this._go('#complete');
  },
  _fail: function () {
    Tw.Logger.info('pay request fail');
  },
  _setHistory: function () {
    this._history.setHistory();
  },
  _toggleEvent: function (event) {
    this._uiService.toggle($(event.currentTarget));
  },
  _go: function (hash) {
    window.location.hash = hash;
  }
};