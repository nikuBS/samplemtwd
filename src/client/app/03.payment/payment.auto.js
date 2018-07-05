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
    this.$container.on('click', '.pay', $.proxy(this._pay, this));
  },
  _pay: function (event) {
    event.preventDefault();

    this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _paySuccess: function () {
    this._setHistory();
    this._go('#complete');
  },
  _payFail: function () {
    Tw.Logger.info('pay request fail');
  },
  _setHistory: function () {
    this._history.setHistory();
  },
  _go: function (hash) {
    window.location.hash = hash;
  }
};