/**
 * FileName: myt-fare.payment.point.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFarePaymentPoint = function (rootEl) {
  this.$container = rootEl;

  this._paymentCommon = new Tw.MyTFarePaymentCommon(this.$container);
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePaymentPoint.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },
  _initVariables: function () {
    this.$pointSelector = this.$container.find('.fe-select-point');
    this.$point = this.$container.find('.fe-point');
    this.$pointPw = this.$container.find('.fe-point-pw');
    this.$getPointBtn = this.$container.find('.fe-get-point');
    this.$pointBox = this.$container.find('.fe-point-box');
    this.$pointCardNumber = null;
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-get-point', $.proxy(this._openGetPoint, this));
    this.$container.on('click', '.fe-check-pay', $.proxy(this._checkPay, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._pay, this));
  },
  _openGetPoint: function () {
    this._popupService.open({
      'hbs':'MF_01_03_01'
    }, $.proxy(this._setPoint, this));
  },
  _setPoint: function ($layer) {
    this.$pointCardNumber = $layer.find('.fe-point-card-number').val();
    $layer.on('click', '.fe-get', $.proxy(this._getPoint, this));
  },
  _getPoint: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0043, { 'ocbCcno': this.$pointCardNumber })
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._getFail, this));
  },
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.close();
      this._setPointInfo(res.result);

      this.$pointBox.show();
      this.$getPointBtn.hide();
    } else {
      this._getFail(res);
    }
  },
  _getFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },
  _setPointInfo: function (result) {
    this.$container.find('.fe-cashbag-point').text(result.availPt);
    this.$container.find('.fe-t-point').text(result.availTPt);
  },
  _checkPay: function () {
    if (this._isValid()) {
      this._historyService.goHash('#check');
      this._setData();
    }
  },
  _isValid: function () {
    var $isSelectedPoint = this.$pointSelector.attr('id');
    var className = '.fe-cashbag-point';
    if ( $isSelectedPoint === Tw.PAYMENT_POINT_VALUE.T_POINT ) {
      className = '.fe-t-point';
    }
    return (this._isGetPoint() &&
      this._validation.checkEmpty(this.$point.val(), Tw.MSG_PAYMENT.POINT_A07) &&
      this._validation.checkIsAvailablePoint(this.$point.val(),
        parseInt(this.$pointBox.find(className).attr('id'), 10),
        Tw.MSG_PAYMENT.REALTIME_A12) &&
      this._validation.checkIsMore(this.$point.val(), 1000, Tw.MSG_PAYMENT.REALTIME_A08) &&
      this._validation.checkIsTenUnit(this.$point.val(), Tw.MSG_PAYMENT.POINT_A06) &&
      this._validation.checkEmpty(this.$pointPw.val(), Tw.MSG_PAYMENT.AUTO_A04));
  },
  _isGetPoint: function () {
    if ( this.$pointBox.hasClass('none') ) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.REALTIME_A11);
      return false;
    }
    return true;
  },
  _setData: function () {
    this.$container.find('.fe-payment-option-name').attr('id', this.$selectBank.attr('id')).text(this.$selectBank.text());
    this.$container.find('.fe-payment-option-number').text(this.$accountNumber.val());
    this.$container.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this._paymentCommon.getAmount().toString()));
    this.$container.find('.fe-payment-refund').attr('id', this.$refundBank.attr('id'))
      .text(this.$refundBank.text() + ' ' + this.$refundNumber.val());
  },
  _pay: function () {
    var reqData = this._makeRequestData();
    this._apiService.request(Tw.API_CMD.BFF_07_0023, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _makeRequestData: function () {
    var reqData = {
      payovrBankCd: this.$container.find('.fe-payment-refund').attr('id'),
      payovrBankNum: $.trim(this.$refundNumber.val()),
      payovrCustNm: $.trim(this.$container.find('.fe-name').val()),
      bankOrCardCode: this.$selectBank.attr('id'),
      bankOrCardAccn: $.trim(this.$accountNumber.val()),
      unpaidBillList: this._paymentCommon.getBillList()
    };
    return reqData;
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.setHistory();
      this._historyService.goHash('#complete');
    } else {
      this._payFail(res.error);
    }
  },
  _payFail: function (err) {
    this._popupService.openAlert(err.message, err.code);
  }
};