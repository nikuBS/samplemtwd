/**
 * FileName: payment.auto.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.05
 */

Tw.PaymentAuto = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);
  this.$document = $(document);
  this.$amount = 0;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._bindEvent();
};

Tw.PaymentAuto.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.change', $.proxy(this._change, this));
    this.$container.on('click', '.cancel', $.proxy(this._cancel, this));
  },
  _change: function (event) {
    event.preventDefault();

    this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
      .done($.proxy(this._changeSuccess, this))
      .fail($.proxy(this._changeFail, this));
  },
  _cancel: function (event) {
    event.preventDefault();

    this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
      .done($.proxy(this._cancelSuccess, this))
      .fail($.proxy(this._cancelFail, this));
  },
  _changeSuccess: function () {
    this._setHistory();
    this._go('#complete-change');
  },
  _changeFail: function () {
    Tw.Logger.info('change request fail');
  },
  _cancelSuccess: function () {
    this._setHistory();
    this._go('#complete-cancel');
  },
  _cancelFail: function () {
    Tw.Logger.info('cancel request fail');
  },
  _setHistory: function () {
    this._history.setHistory();
  },
  _go: function (hash) {
    window.location.hash = hash;
  }
};