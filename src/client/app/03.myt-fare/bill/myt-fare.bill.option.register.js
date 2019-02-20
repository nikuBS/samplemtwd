/**
 * FileName: myt-fare.bill.option.register.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 */

Tw.MyTFareBillOptionRegister = function (rootEl, bankList) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);
  this._backAlert = new Tw.BackAlert(this.$container, true);

  if (!(Tw.FormatHelper.isEmpty(bankList) || bankList === '[]')) {
    bankList = JSON.parse(window.unescape(bankList));
  }
  this._bankList = new Tw.MyTFareBillBankList(rootEl, bankList);

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
    this.$isRadioChanged = false;
    this.$isAccountTabValid = false;
    this.$isCardTabValid = false;
    this.$isCardValid = true;
  },
  _bindEvent: function () {
    this.$radioBox.on('change', $.proxy(this._changeRadioBox, this));
    this.$container.on('blur', '.fe-phone-number', $.proxy(this._checkPhoneNumber, this));
    this.$container.on('blur', '.fe-account-number', $.proxy(this._checkAccountNumber, this));
    this.$container.on('blur', '.fe-card-number', $.proxy(this._checkCardNumber, this));
    this.$container.on('blur', '.fe-card-y', $.proxy(this._checkCardExpiration, this));
    this.$container.on('blur', '.fe-card-m', $.proxy(this._checkCardExpiration, this));
    this.$container.on('click', '.fe-select-bank', $.proxy(this._selectBank, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-payment-date', $.proxy(this._changePaymentDate, this));
    this.$container.on('click', '.fe-submit', $.proxy(this._submit, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
  },
  _changeRadioBox: function (event) {
    this.$isRadioChanged = true;

    var $target = $(event.target);
    var className = $target.attr('class');

    if (className === 'fe-bank') {
      this.$isCardValid = true;
    } else {
      this.$isCardValid = false;
    }
    this.$selectedWrap = this.$container.find('.' + className + '-wrap');

    this.$selectedWrap.show();
    this.$selectedWrap.siblings('.fe-wrap').hide();

    this._checkIsAbled();
  },
  _checkPhoneNumber: function (event) {
    var $target = $(event.currentTarget);
    var isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 10), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V18);

    if (isValid) {
      isValid = this._validation.showAndHideErrorMsg($target, this._validation.isCellPhone($target.val()), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V9);
    }

    if ($target.parents('.fe-wrap').hasClass('fe-bank-wrap')) {
      this.$isAccountTabValid = isValid;
    } else {
      this.$isCardTabValid = isValid;
    }
  },
  _checkAccountNumber: function (event) {
    var $target = $(event.currentTarget);
    this.$isAccountTabValid = this._validation.showAndHideErrorMsg($target, this._validation.checkEmpty($target.val()));
  },
  _checkCardNumber: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._isEmpty($target, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V60) &&
      this._validation.showAndHideErrorMsg(this.$cardNumber,
        this._validation.checkMoreLength(this.$cardNumber, 15),
        Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4);

    if (this.$isValid) {
      this._getCardCode();
    }
  },
  _isEmpty: function ($target, message) {
    return this._validation.showAndHideErrorMsg($target, this._validation.checkEmpty($target.val()), message);
  },
  _getCardCode: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0068, { cardNum: $.trim(this.$cardNumber.val()).substr(0, 6) })
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._getFail, this));
  },
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var cardCode = res.result.bankCardCoCd;
      var cardName = res.result.cardNm;

      this.$cardNumber.attr({ 'data-code': cardCode, 'data-name': cardName });
      this.$cardNumber.parent().siblings('.fe-error-msg').hide();
      this.$isCardValid = true;

      if (Tw.FormatHelper.isEmpty(cardCode)) {
        this._getFail();
      }
    } else {
      this._getFail();
    }
  },
  _getFail: function () {
    this.$cardNumber.parent().siblings('.fe-error-msg').empty().text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V28).show();
    this.$cardNumber.focus();
    this.$isCardValid = false;
  },
  _checkCardExpiration: function (event) {
    var $target = $(event.currentTarget);
    var message = Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5;

    this.$isCardTabValid = this._validation.checkEmpty($target.val());

    if (this.$isCardTabValid) {
      if ($target.hasClass('fe-card-y')) {
        this.$isCardTabValid = this._validation.checkYear(this.$cardY);
      } else {
        this.$isCardTabValid = this._validation.checkMonth(this.$cardM, this.$cardY);
      }
      message = Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6;
    }

    if (this.$isCardTabValid) {
      $target.parents('.fe-exp-wrap').siblings('.fe-error-msg').hide();
    } else {
      $target.parents('.fe-exp-wrap').siblings('.fe-error-msg').text(message).show();
      $target.focus();
    }
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

    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_CARD_DATE
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input[data-value="' + $id + '"]').attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.parents('label').text());

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
  _isValid: function () {
    var isValid = false;
    if (this.$selectedWrap.hasClass('fe-bank-wrap')) {
      isValid = this.$isAccountTabValid && !Tw.FormatHelper.isEmpty(this.$selectBank.attr('id'));
    } else {
      isValid = this.$isCardTabValid && this.$isCardValid;
    }

    return isValid;
  },
  _success: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._aftetSuccessGetOption(res);
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    if (err.code === 'BIL0006') {
      this._popupService.openAlert(err.msg, Tw.POPUP_TITLE.NOTIFY);
    } else {
      Tw.Error(err.code, err.msg).pop();
    }
  },
  _aftetSuccessGetOption: function (res) {
    var reqData = {
      authConfirm: res.result.authConfirm,
      acntNum: this.$infoWrap.attr('data-acnt-num'),
      rltmSerNum: res.result.rltmSerNum
    };

    this._apiService.request(Tw.API_CMD.BFF_07_0060, reqData)
      .done($.proxy(this._afterGetSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _afterGetSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.goLoad('/myt-fare/bill/option?type=' + this.$infoWrap.attr('id'));
    } else {
      this._fail(res);
    }
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
      reqData.cardEffYm = $.trim(this.$cardY.val()) + $.trim(this.$cardM.val());
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
  },
  _onClose: function () {
    this._backAlert.onClose();
    // if (this._isChanged()) {
    //   this._popupService.openConfirmButton(Tw.ALERT_CANCEL, null,
    //     $.proxy(this._closePop, this), $.proxy(this._afterClose, this),
    //     Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
    // } else {
    //   this._historyService.goBack();
    // }
  },
  _isChanged: function () {
    var isValid = this.$isRadioChanged;

    if (!isValid) {
      if (this.$selectedWrap.hasClass('fe-bank-wrap')) {
        isValid = !Tw.FormatHelper.isEmpty(this.$accountPhoneNumber.val()) || !Tw.FormatHelper.isEmpty(this.$accountNumber.val()) ||
          !Tw.FormatHelper.isEmpty(this.$container.find('.fe-select-bank').attr('id'));
      } else {
        isValid = !Tw.FormatHelper.isEmpty(this.$cardPhoneNumber.val()) || !Tw.FormatHelper.isEmpty(this.$cardNumber.val()) ||
          !Tw.FormatHelper.isEmpty(this.$cardY.val()) || !Tw.FormatHelper.isEmpty(this.$cardM.val());
      }
    }
    return isValid;
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.closeAll();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.goBack();
    }
  }
};