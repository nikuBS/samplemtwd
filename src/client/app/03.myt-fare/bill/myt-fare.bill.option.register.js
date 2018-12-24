/**
 * FileName: myt-fare.bill.option.register.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 */

Tw.MyTFareBillOptionRegister = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);
  this._bankList = new Tw.MyTFareBillBankList(this.$container);

  this._init();
};

Tw.MyTFareBillOptionRegister.prototype = {
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
    this.$isValid = false;
  },
  _bindEvent: function () {
    this.$radioBox.on('change', $.proxy(this._changeRadioBox, this));
    this.$container.on('blur', '.fe-phone-number', $.proxy(this._checkPhoneNumber, this));
    this.$container.on('blur', '.fe-card-number', $.proxy(this._getCardCode, this));
    this.$container.on('blur', '.fe-card-m', $.proxy(this._checkCardExpiration, this));
    this.$container.on('click', '.fe-select-bank', $.proxy(this._selectBank, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
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
  _checkPhoneNumber: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 10));
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
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
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
    if (this.$isValid) {
      var reqData = this._makeRequestData();
      var apiName = this._getApiName();

      this._apiService.request(apiName, reqData)
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    }
  },
  _success: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.goLoad('/myt-fare/bill/option?type=' + this.$infoWrap.attr('id'));
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
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
      reqData.cardEffYm = $.trim(this.$cardY.val()).substr(2,2)  + $.trim(this.$cardM.val());
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