/**
 * FileName: myt-fare.payment.prepay.pay.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTFarePaymentPrepayPay = function (rootEl, title, amount, name) {
  this.$container = rootEl;
  this.$title = title;
  this._maxAmount = amount;
  this._name = name;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;

  this._historyService = new Tw.HistoryService(rootEl);
  this._paymentCommon = new Tw.MyTFarePaymentCommon(rootEl);

  this._init();
};

Tw.MyTFarePaymentPrepayPay.prototype = {
  _init: function () {
    this._setInitValue();
    this._initVariables();
    this._bindEvent();
  },
  _setInitValue: function () {
    this.$container.find('.fe-name').val(this._name);
    this.$container.find('.fe-max-amount').attr('id', this._maxAmount).text(Tw.FormatHelper.addComma(this._maxAmount.toString()));
  },
  _initVariables: function () {
    this.$prepayAmount = this.$container.find('.fe-prepay-amount');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardTypeSelector = this.$container.find('.fe-select-card-type');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');

    this._historyUrl = '/myt/fare/history/' + this.$title;
    this._mainUrl = '/myt/fare/payment/' + this.$title;
    this._isPaySuccess = false;
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-select-card-type', $.proxy(this._selectCardType, this));
    this.$container.on('click', '.fe-check-pay', $.proxy(this._checkPay, this));
  },
  _checkIsAbled: function () {
    if (this.$prepayAmount.val() !== '' && this.$cardNumber.val() !== '' &&
      this.$cardY.val() !== '' && this.$cardM.val() !== '' && this.$cardPw.val() !== '') {
      this.$container.find('.fe-check-pay').removeAttr('disabled');
    } else {
      this.$container.find('.fe-check-pay').attr('disabled', 'disabled');
    }
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_CARD_TYPE,
      data: Tw.POPUP_TPL.FARE_PAYMENT_CARD_TYPE_LIST
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.hbs-card-type', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.text());

    this._popupService.close();
  },
  _checkPay: function () {
    if (this._isValid()) {
      this._getCardCode();
    }
  },
  _isValid: function () {
    var _prepayAmount = this.$prepayAmount.val();
    return (
      this._validation.checkIsAvailablePoint(_prepayAmount, this._maxAmount, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V10) &&
      this._validation.checkIsMore(_prepayAmount, 9999, Tw.MSG_PAYMENT.PRE_A11) &&
      this._validation.checkMultiple(_prepayAmount, 10000, Tw.MSG_PAYMENT.PRE_A11) &&
      this._validation.checkMoreLength(this.$cardNumber.val(), 15, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4) &&
      this._validation.checkLength(this.$cardY.val(), 4, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkLength(this.$cardM.val(), 2, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6));
  },
  _getCardCode: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0024, { cardNum: $.trim(this.$cardNumber.val()).substr(0, 6) })
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._getFail, this));
  },
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var cardCode = res.result.prchsCardCd;
      var cardName = res.result.prchsCardName;

      this._goCheck(cardCode, cardName);
    } else {
      this._getFail(res);
    }
  },
  _getFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _goCheck: function (cardCode, cardName) {
    this._popupService.open({
      'hbs': 'MF_06_03_01'
    },
      $.proxy(this._setData, this, cardCode, cardName),
      $.proxy(this._afterPaySuccess, this),
      'check-pay'
    );
  },
  _setData: function (cardCode, cardName, $layer) {
    $layer.find('.fe-payment-option-name').attr('id', cardCode).text(cardName);
    $layer.find('.fe-payment-option-number').text(Tw.StringHelper.masking(this.$cardNumber.val(), '*', 8));
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma($.trim(this.$prepayAmount.val().toString())));
    $layer.find('.fe-mbr-name').text(this._name);
    $layer.find('.fe-payment-type').text(this.$cardTypeSelector.text());

    $layer.on('click', '.fe-pay', $.proxy(this._pay, this, $layer));
  },
  _afterPaySuccess: function () {
    if (this._isPaySuccess) {
      this._historyService.replaceTarget('/myt/fare/payment/' + this.$title + '#pay_P');
      this._paymentCommon.afterPaySuccess(this._historyUrl, this._mainUrl,
        Tw.MYT_FARE_PAYMENT_NAME.GO_PREPAY_HISTORY, Tw.MYT_FARE_PAYMENT_NAME.PREPAY);
    }
  },
  _pay: function ($layer) {
    var apiName = this._getApiName();
    var reqData = this._makeRequestData($layer);

    this._apiService.request(apiName, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _getApiName: function () {
    var apiName = '';
    if (this.$title === 'micro') {
      apiName = Tw.API_CMD.BFF_07_0074;
    } else {
      apiName = Tw.API_CMD.BFF_07_0082;
    }
    return apiName;
  },
  _makeRequestData: function ($layer) {
    var reqData = {
      tmthChrgPsblAmt: this._maxAmount.toString(),
      checkAuto: 'N',
      requestSum: $.trim(this.$prepayAmount.val().toString()),
      cardNumVal: $layer.find('.fe-payment-option-number').text(),
      cardCorp: $layer.find('.fe-payment-option-name').attr('id'),
      cardNm: $layer.find('.fe-payment-option-name').text(),
      cardExpyyVal: $.trim(this.$cardY.val())+ $.trim(this.$cardM.val()),
      instmm: this.$cardTypeSelector.attr('id').toString(),
      cardPwdVal: $.trim(this.$cardPw.val().toString())
    };
    return reqData;
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._isPaySuccess = true;
      this._popupService.close();
    } else {
      this._payFail(res);
    }
  },
  _payFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};