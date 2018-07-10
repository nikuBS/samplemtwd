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

  this._initVariables();
  this._bindEvent();
};

Tw.PaymentPoint.prototype = {
  _initVariables: function () {
    this.$cardNumber = this.$container.find('.card-number');
    this.$password = this.$container.find('.password');
    this.$agreement = this.$container.find('.cashbag-agree');
    this.$point = this.$container.find('.pay-point');
    this.$errorContainer = this.$container.find('.error-data');
    this.$pointType = null;
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('click', '.select-payment-point', $.proxy(this._changeStep, this));
    this.$container.on('click', '.select-auto-cashbag-point', $.proxy(this._selectAutoCashbagPoint, this));
    this.$container.on('click', '.cashbag-agree', $.proxy(this._openCashbagAgree, this));
    this.$container.on('click', '.pay-cashbag-one', $.proxy(this._payCashbagOne, this));
    this.$container.on('click', '.pay-cashbag-auto', $.proxy(this._payCashbagAuto, this));
    this.$container.on('click', '.pay-rainbow-one', $.proxy(this._payRainbowOne, this));
    this.$container.on('click', '.pay-rainbow-auto', $.proxy(this._payRainbowAuto, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _changeStep: function (event) {
    event.preventDefault();

    var $target = $(event.currentTarget);
    this._setType($target);
    this._go($target.data('value'));
  },
  _selectAutoCashbagPoint: function () {

  },
  _setType: function ($target) {
    this.$pointType = $target.data('type');
    this.$autoCode = $target.data('code');
    this.$container.find('.point-title').hide();
    this.$container.find('.point-pay-info').hide();
    this.$container.find('.' + this.$pointType + '-title').show();
    this.$container.find('.' + this.$pointType + '-info').show();
  },
  _openCashbagAgree: function () {
    if (this.$agreement.is(':checked')) {
      this._popupService.open({
        hbs:'PA_05_01_L01'
      });
    }
  },
  _payCashbagOne: function (event) {
    event.preventDefault();

    if (this._isValidForCashbagOne()) {
      var reqData = this._makeRequestDataForCashbagOne();
      this._apiService.request(Tw.API_CMD.BFF_07_0045, reqData)
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _makeRequestDataForCashbagOne: function () {
    return {
      ocbCcno: $.trim(this.$cardNumber.val()),
      ptClCd: this.$pointType,
      reqAmt: $.trim(this.$point.val()),
      ocbPwd: $.trim(this.$password.val())
    };
  },
  _payCashbagAuto: function (event) {
    event.preventDefault();

    if (this._isValidForCashbagAuto()) {
      var reqData = this._makeRequestDataForCashbagAuto();
      this._apiService.request(Tw.API_CMD.BFF_07_0054, reqData)
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _makeRequestDataForCashbagAuto: function () {
    var ccno = '';
    if (this.$autoCode === '1') {
      ccno = $.trim(this.$cardNumber.val());
    }
    return {
      reqClCd: this.$autoCode,
      ptClCd: this.$pointType,
      reqAmt: '1000',
      ocbCcno: ccno
    };
  },
  _payRainbowOne: function (event) {
    event.preventDefault();

    if (this._isValidForRainbow()) {
      var reqData = this._makeRequestDataForRainbow();
      this._apiService.request(Tw.API_CMD.BFF_07_0048, reqData)
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _makeRequestDataForRainbow: function () {
    return {
      reqRbpPt: '1000',
      prodId: 'CCBBAE0'
    };
  },
  _payRainbowAuto: function (event) {
    event.preventDefault();

    if (this._isValidForRainbow()) {
      this._apiService.request(Tw.API_CMD.BFF_07_0056, { rbpChgRsnCd: 'A1' })
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setData(res);
      console.log(res.result);
      this._history.setHistory();
      this._go('#complete');
    } else {
      this.$errorContainer.find('.code').text(res.code);
      this.$errorContainer.find('.message').text(res.msg);
      this._go('#error');
    }
  },
  _payFail: function () {
    Tw.Logger.info('pay request fail');
  },
  _setData: function (res) {
    var $target = this.$container.find('.complete-target');
    var $result = res.result;
    for (var key in $result) {
      $target.find('.' + key).text(res[key]);
    }

  },
  _isValidForCashbagOne: function () {
    return (this._checkIsEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
      this._checkLength($.trim(this.$cardNumber.val()), 16, Tw.MSG_PAYMENT.REALTIME_A06) &&
      this._checkIsEmpty(this.$password.val(), Tw.MSG_PAYMENT.AUTO_A04) &&
      this._checkLength($.trim(this.$password.val()), 4, Tw.MSG_PAYMENT.REALTIME_A07) &&
      this._checkIsAgree(this.$agreement, Tw.MSG_PAYMENT.POINT_A03) &&
      this._checkPoint(this.$point.val()));
  },
  _isValidForCashbagAuto: function () {
    return (this._checkIsEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
      this._checkLength($.trim(this.$cardNumber.val()), 16, Tw.MSG_PAYMENT.REALTIME_A06) &&
      this._checkIsAgree(this.$agreement, Tw.MSG_PAYMENT.POINT_A03));
//      this._checkPoint(this.$point.val()));
  },
  _isValidForRainbow: function () {
    return true;
  },
  _checkIsEmpty: function ($value, message) {
    if (Tw.FormatHelper.isEmpty($value)) {
      this._popupService.openAlert(message);
      return false;
    }
    return true;
  },
  _checkLength: function ($value, length, message) {
    if ($value.length !== length) {
      this._popupService.openAlert(message);
      return false;
    }
    return true;
  },
  _checkMinLength: function ($value, length, message) {
    if ($value.length < length) {
      this._popupService.openAlert(message);
      return false;
    }
    return true;
  },
  _checkIsAgree: function ($target, message) {
    if (!$target.is(':checked')) {
      this._popupService.openAlert(message);
      return false;
    }
    return true;
  },
  _checkPoint: function ($value) {
    return (this._checkIsEmpty($value, Tw.MSG_PAYMENT.POINT_A04) &&
      this._checkIsAvailablePoint($.trim($value), Tw.MSG_PAYMENT.REALTIME_A12) &&
      this._checkMinLength($.trim($value), 4, Tw.MSG_PAYMENT.REALTIME_A08) &&
      this._checkMoreThousand($.trim($value), Tw.MSG_PAYMENT.POINT_A06));
  },
  _checkIsAvailablePoint: function ($value, message) {
    var $availablePoint = this.$container.find('.point-title:visible .point-value');
    if (parseInt($value, 10) > parseInt($availablePoint.text().replace(',', ''), 10)) {
      this._popupService.openAlert(message);
      return false;
    }
    return true;
  },
  _checkMoreThousand: function ($value, message) {
    if ($value[$value.length - 1] !== '0') {
      this._popupService.openAlert(message);
      return false;
    }
    return true;
  },
  _checkIsAvailableCard: function ($cardNum) {
    this._apiService.request(Tw.API_CMD.BFF_07_0024, { cardNum: $cardNum })
      .done($.proxy(this._checkSuccess, this))
      .fail($.proxy(this._checkFail, this));
  },
  _checkSuccess: function (res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.POINT_A05);
      return false;
    }
    return true;
  },
  _checkFail: function () {
    Tw.Logger.info('card check request fail');
  },
  _go: function (hash) {
    window.location.hash = hash;
  }
};