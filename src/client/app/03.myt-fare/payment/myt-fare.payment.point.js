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
    this.$getPointBtn = this.$container.find('.fe-get-point-wrapper');
    this.$pointBox = this.$container.find('.fe-point-box');
    this._pointCardNumber = null;

    this.$container.find('.refund-pament-account').hide();
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-get-point', $.proxy(this._openGetPoint, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-select-point', $.proxy(this._selectPoint, this));
    this.$container.on('click', '.fe-find-password', $.proxy(this._goCashbagSite, this));
    this.$container.on('click', '.fe-check-pay', $.proxy(this._checkPay, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._pay, this));
  },
  _openGetPoint: function () {
    this._popupService.open({
      'hbs':'MF_01_03_01'
    }, $.proxy(this._setPoint, this));
  },
  _setPoint: function ($layer) {
    $layer.on('keyup', '.fe-point-card-number', $.proxy(this._checkIsLayerAbled, this, $layer));
    $layer.on('change', '.fe-cashbag-agree', $.proxy(this._checkIsLayerAbled, this, $layer));
    $layer.on('click', '.cancel', $.proxy(this._checkIsLayerAbled, this, $layer));
    $layer.on('click', '.fe-get', $.proxy(this._getPoint, this, $layer));
  },
  _checkIsLayerAbled: function ($layer) {
    if ($layer.find('.fe-point-card-number').val() !== '' &&
      $layer.find('.fe-cashbag-agree').hasClass('checked')) {
      $layer.find('.fe-get').removeAttr('disabled');
    } else {
      $layer.find('.fe-get').attr('disabled', 'disabled');
    }
  },
  _getPoint: function ($layer) {
    this._pointCardNumber = $.trim($layer.find('.fe-point-card-number').val());
    this._apiService.request(Tw.API_CMD.BFF_07_0043, { 'ocbCcno': this._pointCardNumber })
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
    this.$container.find('.fe-cashbag-point').attr('id', result.availPt).text(Tw.FormatHelper.addComma(result.availPt.toString()));
    this.$container.find('.fe-t-point').attr('id', result.availTPt).text(Tw.FormatHelper.addComma(result.availTPt.toString()));
  },
  _checkIsAbled: function () {
    if (this.$point.val() !== '' && this.$pointPw.val() !== '') {
      this.$container.find('.fe-check-pay').removeAttr('disabled');
    } else {
      this.$container.find('.fe-check-pay').attr('disabled', 'disabled');
    }
  },
  _selectPoint: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      hbs:'actionsheet_select_a_type',
      layer:true,
      title:Tw.POPUP_TITLE.SELECT_POINT,
      data:Tw.POPUP_TPL.FARE_PAYMENT_POINT_LIST
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.point-type', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr({
      'id': $selectedValue.attr('id'),
      'data-code': $selectedValue.attr('data-code')
    });
    $target.text($selectedValue.text());

    this._popupService.close();
  },
  _goCashbagSite: function () {
    Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.OKCASHBAG);
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
    return (this._validation.checkEmpty(this.$point.val(), Tw.MSG_PAYMENT.POINT_A07) &&
      this._validation.checkIsAvailablePoint(this.$point.val(),
        parseInt(this.$pointBox.find(className).attr('id'), 10),
        Tw.MSG_PAYMENT.REALTIME_A12) &&
      this._validation.checkIsMore(this.$point.val(), 1000, Tw.MSG_PAYMENT.REALTIME_A08) &&
      this._validation.checkIsTenUnit(this.$point.val(), Tw.MSG_PAYMENT.POINT_A06) &&
      this._validation.checkEmpty(this.$pointPw.val(), Tw.MSG_PAYMENT.AUTO_A04));
  },
  _setData: function () {
    this.$container.find('.fe-check-title').text(this.$pointSelector.text());
    this.$container.find('.fe-payment-option-name').attr('data-code', this.$pointSelector.attr('data-code')).text(this._pointCardNumber);
    this.$container.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this.$point.val().toString()));
  },
  _pay: function () {
    var reqData = this._makeRequestData();
    this._apiService.request(Tw.API_CMD.BFF_07_0087, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _makeRequestData: function () {
    var reqData = {
      ocbCcno: this._pointCardNumber,
      ptClCd: this.$container.find('.fe-payment-option-name').attr('data-code'),
      point: $.trim(this.$point.val().toString().replace(',', '')),
      pwd: $.trim(this.$pointPw.val().toString()),
      count: this._paymentCommon.getBillList().length,
      contents: this._paymentCommon.getBillList()
    };
    return reqData;
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.setHistory();
      this._historyService.goHash('#complete');
    } else {
      this._payFail(res);
    }
  },
  _payFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  }
};