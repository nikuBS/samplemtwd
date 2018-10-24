/**
 * FileName: myt.fare.payment.prepay.main.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTFarePaymentPrepayMain = function (rootEl, title) {
  this.$container = rootEl;
  this.$title = title;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._historyService = new Tw.HistoryService(rootEl);

  this._initVariables();
  this._setButtonVisibility();
  this._bindEvent();
};

Tw.MyTFarePaymentPrepayMain.prototype = {
  _initVariables: function () {
    this._maxAmount = this.$container.find('.fe-max-amount').attr('id');
    this._name = this.$container.find('.fe-name').text();

    this._monthAmountList = [];
    this._dayAmountList = [];
    this._onceAmountList = [];

    this.$setPasswordBtn = this.$container.find('.fe-set-password');
  },
  _setButtonVisibility: function () {
    if (this.$title === 'micro') {
      if (this.$setPasswordBtn.attr('data-cpin') === undefined || this.$setPasswordBtn.attr('data-cpin') === null ||
        this.$setPasswordBtn.attr('data-cpin') === '' || this.$setPasswordBtn.attr('data-cpin') === 'IC') {
        this.$setPasswordBtn.after().hide();
      }
    }
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-max-amount', $.proxy(this._prepayHistoryMonth, this));
    this.$container.on('click', '.fe-history', $.proxy(this._prepayHistory, this));
    this.$container.on('click', '.fe-change-limit', $.proxy(this._changeLimit, this));
    this.$container.on('click', '.fe-prepay', $.proxy(this._prepay, this));
    this.$container.on('click', '.fe-auto-prepay', $.proxy(this._autoPrepay, this));
    this.$container.on('click', '.fe-auto-prepay-change', $.proxy(this._autoPrepayInfo, this));
    this.$container.on('click', '.fe-auto-pay-info', $.proxy(this._openAutoPayInfo, this));
    this.$container.on('change', '.fe-set-use', $.proxy(this._changeUseStatus, this));
    this.$container.on('click', '.fe-set-password', $.proxy(this._setPassword, this));
  },
  _prepayHistoryMonth: function () {
    this._historyService.goLoad('/myt/fare/history/' + this.$title + '/monthly');
  },
  _prepayHistory: function () {
    this._historyService.goLoad('/myt/fare/history/' + this.$title);
  },
  _changeLimit: function () {
    new Tw.MyTFarePaymentPrepayChangeLimit(this.$container, this.$title);
  },
  _prepay: function () {
    this._popupService.open({
      'hbs': 'MF_06_03'
    },
      $.proxy(this._goPrepay, this),
      null,
      'pay');
  },
  _goPrepay: function ($layer) {
    new Tw.MyTFarePaymentPrepayPay($layer, this.$title, this._maxAmount, this._name);
  },
  _autoPrepay: function () {
    this._historyService.goLoad('/myt/fare/payment/' + this.$title + '/auto');
  },
  _autoPrepayInfo: function () {
    this._historyService.goLoad('/myt/fare/payment/' + this.$title + '/auto/info');
  },
  _openAutoPayInfo: function () {
    this._popupService.openAlert(Tw.AUTO_PAY_INFO['CONTENTS_' + this.$title.toUpperCase()], Tw.AUTO_PAY_INFO.TITLE, Tw.BUTTON_LABEL.CONFIRM);
  },
  _changeUseStatus: function (event) {
    new Tw.MyTFarePaymentMicroSetUse(this.$container, $(event.target));
  },
  _setPassword: function () {
    new Tw.MyTFarePaymentMicroSetPassword(this.$container, this.$setPasswordBtn);
  }
};