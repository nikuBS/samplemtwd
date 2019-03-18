/**
 * FileName: myt-fare.bill.option.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 * Annotation: 자동납부 방법 조회
 */

Tw.MyTFareBillOption = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBillOption.prototype = {
  _init: function () {
    if( !Tw.Environment.init ) {
      $(window).on(Tw.INIT_COMPLETE, $.proxy(this._checkIsAfterChange, this));
    } else {
      this._checkIsAfterChange();
    }
    this._bindEvent();
  },
  _checkIsAfterChange: function () {
    var type = Tw.UrlHelper.getQueryParams().type;
    if (type) {
      var message = '';

      if (type === 'new' || type === 'sms') {
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
    this.$container.on('click', '.fe-cancel', $.proxy(this._cancelAutoPayment, this));
    this.$container.on('click', '.fe-change-date', $.proxy(this._changePaymentDate, this));
    this.$container.on('click', '.fe-change-address', $.proxy(this._changeAddress, this));
  },
  _goAutoPayment: function () {
    this._historyService.goLoad('/myt-fare/bill/option/register');
  },
  _cancelAutoPayment: function () {
    this._historyService.goLoad('/myt-fare/bill/option/cancel');
  },
  _changePaymentDate: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_BANK_DATE,
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectDatePopupCallback, this, $target), null, null, $target);
  },
  _selectDatePopupCallback: function ($target, $layer) {
    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input[data-value="' + $id + '"]').attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedDate, this));
  },
  _setSelectedDate: function (event) {
    var $selectedValue = $(event.target);
    var code = $selectedValue.attr('id');
    var date = $selectedValue.parents('label').text().replace(Tw.PERIOD_UNIT.DAYS, '');

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
    Tw.Error(err.code, err.msg).pop();
  },
  _changeAddress: function () {
    this._historyService.goLoad('/myt-fare/bill/option/change-address');
  },
  _isBackOrReload: function () {
    if (window.performance) {
      if (performance.navigation.type === 1 || performance.navigation.type === 2) {
        return true;
      }
    }
  }
};