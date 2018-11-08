/**
 * FileName: myt-fare.payment.auto.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 */

Tw.MyTFarePaymentAuto = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);
  this._bankList = new Tw.MyTFarePaymentBankList(this.$container);

  this._init();
};

Tw.MyTFarePaymentAuto.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },
  _initVariables: function () {
    this.$radioBox = this.$container.find('.fe-radio-box');
    this.$infoWrap = this.$container.find('.fe-info-wrap');
    this.$selectedWrap = this.$container.find('.fe-bank-wrap');
    this.$bankWrap = this.$container.find('.fe-bank-wrap');
    this.$cardWrap = this.$container.find('.fe-card-wrap');
    this.$selectBank = this.$bankWrap.find('.fe-select-bank');
    this.$accountNumber = this.$bankWrap.find('.fe-account-number');
    this.$accountPhoneNumber = this.$bankWrap.find('.fe-phone-number');
    this.$cardPhoneNumber = this.$cardWrap.find('.fe-phone-number');
    this.$cardNumber = this.$cardWrap.find('.fe-card-number');
    this.$cardY = this.$cardWrap.find('.fe-card-y');
    this.$cardM = this.$cardWrap.find('.fe-card-m');
    this.$paymentDate = this.$cardWrap.find('.fe-payment-date');
  },
  _bindEvent: function () {
    this.$radioBox.on('change', $.proxy(this._changeRadioBox, this));
    this.$container.on('click', '.fe-select-bank', $.proxy(this._selectBank, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-payment-date', $.proxy(this._changePaymentDate, this));
    this.$container.on('click', '.fe-submit', $.proxy(this._submit, this));
  },
  _changeRadioBox: function (event) {
    var $target = $(event.target);
    this.$selectedWrap = this.$container.find('.' + $target.attr('class') + '-wrap');

    this.$selectedWrap.show();
    this.$selectedWrap.siblings('.fe-wrap').hide();
  },
  _selectBank: function (event) {
    this._bankList.init(event, $.proxy(this._checkIsAbled, this));
  },
  _checkIsAbled: function () {
    if (this._getIsAbledForWrap()) {
      this.$container.find('.fe-submit').removeAttr('disabled');
    } else {
      this.$container.find('.fe-submit').attr('disabled', 'disabled');
    }
  },
  _getIsAbledForWrap: function () {
    var isAbled = false;
    if (this.$selectedWrap.hasClass('fe-bank-wrap')) {
      isAbled = this.$accountPhoneNumber.val() !== '' && this.$selectBank.attr('id') !== undefined && this.$accountNumber.val() !== '';
    } else {
      isAbled = this.$cardPhoneNumber.val() !== '' && this.$cardNumber.val() !== '' &&
        this.$cardY.val() !== '' && this.$cardM.val() !== '';
    }
    return isAbled;
  },
  _changePaymentDate: function (event) {
    var $target = $(event.currentTarget);
    var title = this._getTitle();

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: title,
      data: Tw.POPUP_TPL.FARE_PAYMENT_CARD_DATE
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _getTitle: function () {
    var title = '';
    if (this.$infoWrap.attr('id') === 'new') {
      title = Tw.POPUP_TITLE.SELECT_PAYMENT_DATE;
    } else {
      title = Tw.POPUP_TITLE.CHANGE_PAYMENT_DATE;
    }
    return title;
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.date', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.text());

    this._popupService.close();
  },
  _submit: function () {
    if (this._isValid()) {
      var reqData = this._makeRequestData();
      var apiName = this._getApiName();
      this._apiService.request(apiName, reqData)
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    }
  },
  _success: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.goLoad('/myt/fare/payment/option?type=' + this.$infoWrap.attr('id'));
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _isValid: function () {
    var isValid = false;
    if (this.$selectedWrap.hasClass('fe-bank-wrap')) {
      isValid = this._isValidForBank();
    } else {
      isValid = this._isValidForCard();
    }
    return isValid;
  },
  _isValidForBank: function () {
    return this._validation.checkMoreLength(this.$accountPhoneNumber.val(), 10, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V18);
  },
  _isValidForCard: function () {
    return (this._validation.checkMoreLength(this.$accountPhoneNumber.val(), 10, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V18) &&
      this._validation.checkMoreLength(this.$cardNumber.val(), 15, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4) &&
      this._validation.checkLength(this.$cardY.val(), 4, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkLength(this.$cardM.val(), 2, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6));
  },
  _makeRequestData: function () {
    var reqData = {};
    reqData.acntNum = this.$infoWrap.attr('data-acnt-num');
    reqData.payMthdCd = this.$selectedWrap.attr('id');
    reqData.payerNumClCd = this.$infoWrap.attr('data-payer-num-cl-cd');
    reqData.serNum = this.$infoWrap.attr('data-ser-num');
    reqData.authReqSerNum = this.$infoWrap.attr('data-auth-req-ser-num');
    reqData.rltmSerNum = this.$infoWrap.attr('data-rltm-ser-num');

    if (this.$selectedWrap.hasClass('fe-bank-wrap')) {
      reqData.bankCardNum = $.trim(this.$accountNumber.val());
      reqData.bankCardCoCd = this.$selectBank.attr('id').toString();
      reqData.cntcNum = $.trim(this.$accountPhoneNumber.val());
    } else {
      reqData.bankCardNum = $.trim(this.$cardNumber.val());
      reqData.cardEffYm = $.trim(this.$cardY.val())  + $.trim(this.$cardM.val());
      reqData.cntcNum = $.trim(this.$cardPhoneNumber.val());
      reqData.drwts = this.$paymentDate.attr('id').toString();
    }

    if (this.$infoWrap.attr('id') === 'new') {
      reqData.fstDrwSchdDt = this.$infoWrap.attr('data-fst-drw-schd-dt');
    }
    return reqData;
  },
  _getApiName: function () {
    var apiName = '';
    if (this.$infoWrap.attr('id') === 'new') {
      apiName = Tw.API_CMD.BFF_07_0061;
    } else {
      apiName = Tw.API_CMD.BFF_07_0062;
    }
    return apiName;
  }
};