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
  this.$amount = 0;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
    this._bankList = new Tw.BankList(this.$container);
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._bindEvent();
};

Tw.PaymentRealtime.prototype = {
  _bindEvent: function () {
      this.$container.on('keyup', '.only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('change', '.checkbox-main', $.proxy(this._sumCheckedAmount, this));
    this.$container.on('click', '.select-payment-option', $.proxy(this._isCheckedAmount, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
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
      this._popupService.openAlert(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_PAYMENT.REALTIME_A01);
    }
    else {
      this._go('#step1');
    }
  },
    _selectBank: function (event) {
        this._bankList.init(event);
  },
    _getPoint: function () {
        /*
        this._popupService.open({
          hbs: 'PA_05_04_L01'// hbs의 파일명
        });
        */
        this._go('#get-point');
  },
    _getCashbagPoint: function () {
        this._apiService.request(Tw.API_CMD.BFF_07_0028, JSON.stringify({ocbCardNum: '4119057002786952'}))
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