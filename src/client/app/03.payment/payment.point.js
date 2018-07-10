/**
 * FileName: payment.point.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.06
 */

Tw.PaymentPoint = function (rootEl) {
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

Tw.PaymentPoint.prototype = {
  _bindEvent: function () {
    this.$container.on('keyup', '.only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('click', '.select-payment-point', $.proxy(this._changeStep, this));
    this.$container.on('click', '.ok-agree', $.proxy(this._openCashbagAgree, this));
    this.$container.on('click', '.pay', $.proxy(this._pay, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _changeStep: function (event) {
    event.preventDefault();

    var $target = $(event.currentTarget);
    this._go($target.data('value'));
  },
  _openCashbagAgree: function (event) {
    var $target = $(event.currentTarget);
    if ($target.find('.checkbox').hasClass('checked')) {
      this._popupService.open({
        hbs:'PA_05_01_L01'
      });
    }
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