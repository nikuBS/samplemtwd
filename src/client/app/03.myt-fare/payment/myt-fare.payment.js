/**
 * FileName: myt-fare.payment.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFarePayment = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._init();
};

Tw.MyTFarePayment.prototype = {
  _init: function () {
    this._getAutoPayment();
  },
  _getAutoPayment: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0058, {})
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));
  },
  _openPaymentOption: function (isTarget) {
    this._popupService.open({
      hbs: 'actionsheet_link_b_type',// hbs의 파일명
      layer: true
    }, $.proxy(this._bindEvent, this, isTarget));
  },
  _bindEvent: function (isTarget, $layer) {
    if (isTarget) {
      $layer.find('button.fe-auto').show();
      $layer.on('click', 'button.fe-auto', $.proxy(this._goAuto, this));
    }
    $layer.on('click', 'button.fe-account', $.proxy(this._goAccount, this));
    $layer.on('click', 'button.fe-card', $.proxy(this._goCard, this));
    $layer.on('click', 'button.fe-point', $.proxy(this._goPoint, this));
    $layer.on('click', 'button.fe-sms', $.proxy(this._goSms, this));
  },
  _goAuto: function () {
    new Tw.MyTFarePaymentAuto();
  },
  _goAccount: function () {
    new Tw.MyTFarePaymentAccount();
  },
  _goCard: function () {
    new Tw.MyTFarePaymentCard();
  },
  _goPoint: function () {
    new Tw.MyTFarePaymentPoint();
  },
  _goSms: function () {
    new Tw.MyTFarePaymentSms();
  },
  _success: function (res) {
    var isTarget = false;
    if (res.code === Tw.API_CODE.CODE_00) {
      isTarget = this._isAutoPaymentTarget(res.result.payMthdCd);
    }
    this._openPaymentOption(isTarget);
  },
  _fail: function () {

  },
  _isAutoPaymentTarget: function (code) {
    if (code !== '01' && code !== '02') {
      return true;
    }
  }
};