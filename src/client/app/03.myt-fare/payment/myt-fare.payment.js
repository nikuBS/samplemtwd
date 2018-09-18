/**
 * FileName: myt-fare.payment.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFarePayment = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

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
      hbs:'actionsheet_link_b_type',// hbs의 파일명
      layer:true,
      title:Tw.POPUP_TITLE.SELECT_PAYMENT_OPTION,
      data:Tw.POPUP_TPL.FARE_PAYMENT_LAYER_DATA
    }, $.proxy(this._bindEvent, this, isTarget));
  },
  _bindEvent: function (isTarget, $layer) {
    if (isTarget) {
      $layer.find('.fe-auto').parents('div.cont-box').show();
      $layer.on('click', '.fe-auto', $.proxy(this._goAuto, this));
    } else {
      $layer.find('.fe-auto').parents('div.cont-box').hide();
    }
    $layer.on('click', '.fe-account', $.proxy(this._goAccount, this));
    $layer.on('click', '.fe-card', $.proxy(this._goCard, this));
    $layer.on('click', '.fe-point', $.proxy(this._goPoint, this));
    $layer.on('click', '.fe-sms', $.proxy(this._goSms, this));
  },
  _goAuto: function () {
    this._popupService.close();
    this._historyService.goLoad('/myt/fare/payment/auto');
  },
  _goAccount: function () {
    this._popupService.close();
    this._historyService.goLoad('/myt/fare/payment/account');
  },
  _goCard: function () {
    this._popupService.close();
    this._historyService.goLoad('/myt/fare/payment/card');
  },
  _goPoint: function () {
    this._popupService.close();
    this._historyService.goLoad('/myt/fare/payment/point');
  },
  _goSms: function () {
    this._popupService.close();
    this._historyService.goLoad('/myt/fare/payment/sms');
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