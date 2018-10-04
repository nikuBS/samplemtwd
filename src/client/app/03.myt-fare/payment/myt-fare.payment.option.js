/**
 * FileName: myt-fare.payment.option.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 */

Tw.MyTFarePaymentOption = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._historyService.init('hash');
  this._init();
};

Tw.MyTFarePaymentOption.prototype = {
  _init: function () {
    this._checkIsAfterChange();
    this._bindEvent();
  },
  _checkIsAfterChange: function () {
    var type = Tw.UrlHelper.getQueryParams().type;
    if (type) {
      var message = '';

      if (type === 'new') {
        message = Tw.ALERT_MSG_MYT_FARE.COMPLETE_NEW;
      }
      if (type === 'change') {
        message = Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE;
      }

      if (!this._isBackOrReload() && message !== '') {
        this._commonHelper.toast(message);
      }
    }
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-auto', $.proxy(this._goAutoPayment, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._openCancelAutoPayment, this));
    this.$container.on('click', '.fe-change-date', $.proxy(this._changePaymentDate, this));
    this.$container.on('click', '.fe-change-address', $.proxy(this._changeAddress, this));
  },
  _goAutoPayment: function () {
    this._historyService.goLoad('/myt/fare/payment/auto');
  },
  _openCancelAutoPayment: function () {
    this._popupService.open({
      'hbs':'MF_05_01_02'
    }, $.proxy(this._cancelAutoPayment, this));
  },
  _cancelAutoPayment: function ($layer) {
    new Tw.MyTFarePaymentAutoCancel(this.$container, $layer);
  },
  _changePaymentDate: function () {
    this._popupService.open({
      hbs:'actionsheet_select_a_type',
      layer:true,
      title:Tw.POPUP_TITLE.CHANGE_PAYMENT_DATE,
      data:Tw.POPUP_TPL.FARE_PAYMENT_BANK_DATE
    }, $.proxy(this._selectDatePopupCallback, this));
  },
  _selectDatePopupCallback: function ($layer) {
    $layer.on('click', '.date', $.proxy(this._setSelectedDate, this));
  },
  _setSelectedDate: function (event) {
    var $selectedValue = $(event.currentTarget);
    var code = $selectedValue.attr('id');
    var date = $selectedValue.text().replace(Tw.PERIOD_UNIT.DAYS, '');

    this._apiService.request(Tw.API_CMD.BFF_07_0065, { payCyClCd: code })
      .done($.proxy(this._changeSuccess, this, date))
      .fail($.proxy(this._changeFail, this));

    this._popupService.close();
  },
  _changeSuccess: function (date, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$container.find('.fe-pay-date').text(date);
      this.$container.find('.fe-change-date').hide();

      this._commonHelper.toast(Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE_DATE);
    } else {
      this._changeFail(res);
    }
  },
  _changeFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },
  _changeAddress: function () {
  },
  _isBackOrReload: function () {
    if (window.performance) {
      if (performance.navigation.type === 1 || performance.navigation.type === 2) {
        return true;
      }
    }
  }
};