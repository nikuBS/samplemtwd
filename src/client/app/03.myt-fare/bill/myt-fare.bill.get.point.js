/**
 * FileName: myt-fare.bill.get.point.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2019.01.10
 * Annotation: 포인트 즉시납부 및 OK cashbag 포인트 예약납부 시 카드번호 조회
 */

Tw.MyTFareBillGetPoint = function (rootEl, callbackFunc, e) {
  this.$container = rootEl;
  this.$callback = callbackFunc;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;

  this._openGetPoint(e);
};

Tw.MyTFareBillGetPoint.prototype = {
  _openGetPoint: function (e) {
    this._popupService.open({
      'hbs':'MF_01_03_01'
    }, $.proxy(this._setPoint, this), null, 'get-point', $(e.currentTarget));
  },
  _setPoint: function ($layer) {
    $layer.on('keyup', '.fe-only-number', $.proxy(this._checkNumber, this));
    $layer.on('keyup', '.fe-point-card-number', $.proxy(this._checkIsLayerAbled, this, $layer));
    $layer.on('input', '.fe-point-card-number', $.proxy(this._setMaxValue, this));
    $layer.on('blur', '.fe-point-card-number', $.proxy(this._checkCardNumber, this, $layer));
    $layer.on('change', '.fe-cashbag-agree', $.proxy(this._checkIsLayerAbled, this, $layer));
    $layer.on('click', '.cancel', $.proxy(this._checkIsLayerAbled, this, $layer));
    $layer.on('click', '.fe-get', $.proxy(this._getPoint, this));
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  _checkIsLayerAbled: function ($layer) {
    if ($layer.find('.fe-point-card-number').val() !== '' &&
      $layer.find('.fe-cashbag-agree').hasClass('checked')) {
      $layer.find('.fe-get').removeAttr('disabled');
    } else {
      $layer.find('.fe-get').attr('disabled', 'disabled');
    }
  },
  _setMaxValue: function (event) {
    var $target = $(event.currentTarget);
    var maxLength = $target.attr('maxLength');
    if ($target.attr('maxLength')) {
      if ($target.val().length >= maxLength) {
        $target.val($target.val().slice(0, maxLength));
      }
    }
  },
  _checkCardNumber: function ($layer) {
    var $pointCardNumber = $layer.find('.fe-point-card-number');
    this._pointCardNumber = $.trim($pointCardNumber.val());
    this.$isValid = this._validation.showAndHideErrorMsg($pointCardNumber, this._validation.checkMoreLength($pointCardNumber, 16));
  },
  _getPoint: function (e) {
    var $target = $(e.currentTarget);
    if (this.$isValid) {
      this._apiService.request(Tw.API_CMD.BFF_07_0043, { 'ocbCcno': this._pointCardNumber })
        .done($.proxy(this._getSuccess, this, $target))
        .fail($.proxy(this._getFail, this, $target));
    }
  },
  _getSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.close();
      this.$callback(res.result);
    } else {
      this._getFail($target, res);
    }
  },
  _getFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  }
};