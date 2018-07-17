/**
 * FileName: payment.get.point.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.16
 */

Tw.PaymentGetPoint = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
};

Tw.PaymentGetPoint.prototype = {
  open: function () {
    console.log(this.$container);
    this._popupService.open({
      hbs: 'PA_05_04_L01'
    }, $.proxy(this._init, this));
  },
  _init: function ($layer) {
    $layer.find('input[type="text"]').val('');
    $layer.find('input[type="checkbox"]').removeAttr('checked');

    this.$cardNumber = $layer.find('.account-wrap input');
    this.$getButton = $layer.find('.footer-wrap button');

    this._bindEvent($layer);
  },
  _bindEvent: function ($layer) {
    this.$cardNumber.on('keyup', $.proxy(this._onlyNumber, this));
    this.$getButton.on('click', $.proxy(this._getPoint, this, $layer));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _getPoint: function ($layer) {
    if (this._isValid($layer)) {
      this._popupService.close();
      this._apiService.request(Tw.API_CMD.BFF_07_0043, { 'ocbCcno': $.trim($layer.find('.account-wrap input').val()) })
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    }
  },
  _success: function (res) {
    var $target = this.$container.find('.point-box');
    $target.find('.cashbag-point').attr('id', res.result.availPt).text(Tw.FormatHelper.addComma(res.result.availPt));
    $target.find('.t-point').attr('id', res.result.availTPt).text(Tw.FormatHelper.addComma(res.result.availTPt));
    $target.find('.point-card-number').attr('id', res.result.ocbCcno).text(Tw.StringHelper.masking(res.result.ocbCcno, '*', 10));
    $target.removeClass('none');
  },
  _fail: function () {
    Tw.Logger.info('get point fail');
  },
  _isValid: function ($layer) {
    return (this._validation.checkEmpty($layer.find('.account-wrap input').val(), Tw.MSG_PAYMENT.AUTO_A05) &&
      this._validation.checkIsAgree($layer.find('input[type="checkbox"]'), Tw.MSG_PAYMENT.POINT_A03));
  }
};
