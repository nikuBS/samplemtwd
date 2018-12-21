/**
 * FileName: myt-fare.bill.prepay.pay.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTFareBillPrepayPay = function (rootEl, title, amount, name) {
  this.$container = rootEl;
  this.$title = title;
  this._maxAmount = amount;
  this._name = name;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBillPrepayPay.prototype = {
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
    this.$isValid = false;

    this._isPaySuccess = false;
    this._isClose = false;
  },
  _bindEvent: function () {
    this.$container.on('blur', '.fe-prepay-amount', $.proxy(this._checkAmount, this));
    this.$container.on('blur', '.fe-card-number', $.proxy(this._getCardCode, this));
    this.$container.on('blur', '.fe-card-m', $.proxy(this._checkCardExpiration, this));
    this.$container.on('blur', '.fe-card-pw', $.proxy(this._checkPassword, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('keyup', '.fe-card-number', $.proxy(this._resetCardInfo, this));
    this.$container.on('keypress', '.required-input-field', $.proxy(this._setMaxValue, this));
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
  _resetCardInfo: function () {
    this.$cardNumber.removeAttr('data-code');
    this.$cardNumber.removeAttr('data-name');
  },
  _setMaxValue: function (event) {
    var $target = $(event.currentTarget);
    return $target.val().length < $target.attr('maxLength');
  },
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
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
    if (this.$isValid) {
      this._goCheck();
    }
  },
  _checkAmount: function () {
    var isValid = false;
    var $message = this.$prepayAmount.siblings('.fe-error-msg');
    $message.empty();

    var _prepayAmount = this.$prepayAmount.val();
    if (!this._validation.checkIsAvailablePoint(_prepayAmount, this._maxAmount)) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V10);
    } else if (!this._validation.checkIsMore(_prepayAmount, 9999)) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.TEN_THOUSAND);
    } else if (!this._validation.checkMultiple(_prepayAmount, 10000)) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.TEN_THOUSAND);
    } else {
      isValid = true;
    }

    this.$isValid = this._validation.showAndHideErrorMsg(this.$prepayAmount, isValid);
  },
  _getCardCode: function () {
    if (this.$cardNumber.val() !== '') {
      if (this._validation.showAndHideErrorMsg(this.$cardNumber, this._validation.checkMoreLength(this.$cardNumber, 15))) {
        this._apiService.request(Tw.API_CMD.BFF_07_0024, {cardNum: $.trim(this.$cardNumber.val()).substr(0, 6)})
          .done($.proxy(this._getSuccess, this))
          .fail($.proxy(this._getFail, this));
      }
    }
  },
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var cardCode = res.result.prchsCardCd;
      var cardName = res.result.prchsCardName;

      this.$cardNumber.attr({ 'data-code': cardCode, 'data-name': cardName });
      this.$cardNumber.siblings('.fe-error-msg').hide();
      this.$isValid = true;

      if (Tw.FormatHelper.isEmpty(cardCode)) {
        this._getFail();
      }
    } else {
      this._getFail();
    }
  },
  _getFail: function () {
    this.$cardNumber.siblings('.fe-error-msg').show();
    this.$cardNumber.focus();
    this.$isValid = false;
  },
  _checkCardExpiration: function () {
    this.$isValid = this._validation.checkExpiration(this.$cardY, this.$cardM);
  },
  _checkPassword: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 2));
  },
  _goCheck: function () {
    this._popupService.open({
      'hbs': 'MF_06_03_01'
    },
      $.proxy(this._setData, this),
      $.proxy(this._afterPaySuccess, this),
      'check-pay'
    );
  },
  _setData: function ($layer) {
    $layer.find('.fe-payment-option-name').attr('id', this.$cardNumber.attr('data-code')).text(this.$cardNumber.attr('data-name'));
    $layer.find('.fe-payment-option-number').text(Tw.StringHelper.masking(this.$cardNumber.val(), '*', 8));
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma($.trim(this.$prepayAmount.val().toString())));
    $layer.find('.fe-mbr-name').text(this._name);
    $layer.find('.fe-payment-type').text(this.$cardTypeSelector.text());

    $layer.on('click', '.fe-pay', $.proxy(this._pay, this, $layer));
    $layer.on('click', '.fe-close', $.proxy(this._close, this));
  },
  _afterPaySuccess: function () {
    if (this._isPaySuccess) {
      this._historyService.replaceURL('/myt-fare/bill/pay-complete?type=' + this.$title);
    }
  },
  _close: function () {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.TITLE,
      $.proxy(this._closePop, this), $.proxy(this._afterClose, this), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.BUTTON);
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.closeAll();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._popupService.close();
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
    if (this.$title === 'small') {
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