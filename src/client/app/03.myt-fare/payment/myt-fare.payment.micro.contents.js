/**
 * FileName: myt.fare.payment.micro.contents.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTFarePaymentMicroContents = function (rootEl, title) {
  this.$container = rootEl;
  this.$title = title;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._history = new Tw.HistoryService(rootEl);

  this._initVariables();
  this._bindEvent();
};

Tw.MyTFarePaymentMicroContents.prototype = {
  _initVariables: function () {
    this._maxAmount = this.$container.find('.fe-max-amount').attr('id');
    this._name = this.$container.find('.fe-name').text();
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-prepay', $.proxy(this._prepay, this));
    this.$container.on('click', '.fe-auto-prepay', $.proxy(this._autoPrepay, this));
    this.$container.on('click', '.fe-auto-pay-info', $.proxy(this._openAutoPayInfo, this));
    this.$container.on('change', '.fe-set-use', $.proxy(this._changeUseStatus, this));
  },
  _prepay: function () {
    this._popupService.open({
      'hbs': 'MF_06_03'
    }, $.proxy(this._goPrepay, this));
  },
  _goPrepay: function ($layer) {
    new Tw.MyTFarePaymentMicroContentsPay($layer, this.$title, this._maxAmount, this._name);
  },
  _autoPrepay: function () {
    this._popupService.open({
      'hbs': 'MF_06_03'
    }, $.proxy(this._goAutoPrepay, this));
  },
  _goAutoPrepay: function ($layer) {
    new Tw.MyTFarePaymentMicroContentsPay($layer, this.$title, this._maxAmount, this._name);
  },
  _openAutoPayInfo: function () {
    this._popupService.openAlert(Tw.AUTO_PAY_INFO.CONTENTS, Tw.AUTO_PAY_INFO.TITLE, Tw.BUTTON_LABEL.CONFIRM);
  },
  _changeUseStatus: function (event) {
    var $target = $(event.target);
    var id = $target.attr('id');
    var tx = $target.find('.fe-tx:visible').text();

    this._apiService.request(Tw.API_CMD.BFF_05_0083, { rtnUseYn: id })
      .done($.proxy(this._changeSuccess, this, tx))
      .fail($.proxy(this._changeFail, this));
  },
  _changeSuccess: function (tx, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var message = this._getToastMessage(tx);
      this._commonHelper.toast(message);
    } else {
      this._changeFail(res);
    }
  },
  _changeFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },
  _getToastMessage: function (tx) {
    var message = '';

    if (this.$title === 'micro') {
      message += Tw.ALERT_MSG_MYT_FARE.MICRO;
    } else {
      message += Tw.ALERT_MSG_MYT_FARE.CONTENTS;
    }

    if (tx === Tw.ALERT_MSG_MYT_FARE.USABLE) {
      message += ' ' + Tw.ALERT_MSG_MYT_FARE.MSG_ALLOWED
    } else {
      message += ' ' + Tw.ALERT_MSG_MYT_FARE.MSG_PROHIBITED
    }

    return message;
  }
};