/**
 * FileName: myt-fare.bill.prepay.auto.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.06
 */

Tw.MyTFareBillPrepayAuto = function (rootEl, title, type) {
  this.$container = rootEl;
  this.$title = title;
  this.$type = type;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBillPrepayAuto.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },
  _initVariables: function () {
    this._standardAmountList = [];
    this._prepayAmountList = [];

    this.$standardAmount = this.$container.find('.fe-standard-amount');
    this.$prepayAmount = this.$container.find('.fe-prepay-amount');
    this.$cardBirth = this.$container.find('.fe-card-birth');
    this.$firstCardNum = this.$container.find('.fe-card-num:first');
    this.$lastCardNum = this.$container.find('.fe-card-num:last');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$changeMoneyInfo = this.$container.find('.fe-change-money-info');
    this.$changeCardInfo = this.$container.find('.fe-change-card-info');
    this.$changeType = 'A';
  },
  _bindEvent: function () {
    this.$container.on('change', '.fe-change-type', $.proxy(this._changeType, this));
    this.$container.on('blur', '.fe-card-number', $.proxy(this._getCardCode, this));
    this.$container.on('blur', '.fe-card-m', $.proxy(this._checkCardExpiration, this));
    this.$container.on('blur', '.fe-card-pw', $.proxy(this._checkPassword, this));
    this.$container.on('blur', '.fe-card-birth', $.proxy(this._checkBirthday, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('keyup', '.fe-card-number', $.proxy(this._resetCardInfo, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-standard-amount', $.proxy(this._selectAmount, this, this._standardAmountList));
    this.$container.on('click', '.fe-prepay-amount', $.proxy(this._selectAmount, this, this._prepayAmountList));
    this.$container.on('click', '.fe-amount-info', $.proxy(this._openAmountInfo, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._autoPrepay, this));
  },
  _changeType: function (event) {
    var $target = $(event.target);

    if ($target.hasClass('fe-money')) {
      this.$changeType = 'A';

      this.$changeMoneyInfo.show();
      this.$changeCardInfo.show();
      this.$firstCardNum.show();
      this.$lastCardNum.hide();
    } else if ($target.hasClass('fe-card')) {
      this.$changeType = 'C';

      this.$changeMoneyInfo.hide();
      this.$changeCardInfo.hide();
      this.$firstCardNum.hide();
      this.$lastCardNum.show();
    } else {
      this.$changeType = 'T';

      this.$changeMoneyInfo.show();
      this.$changeCardInfo.hide();
      this.$firstCardNum.hide();
      this.$lastCardNum.show();
    }

    this._checkIsAbled();
  },
  _checkIsAbled: function () {
    var isValid = false;

    if (this.$type === 'change') {
      switch (this.$changeType) {
        case 'A':
          isValid = this.$cardY.val() !== '' && this.$cardM.val() !== '' && this.$cardPw.val() !== '';
          break;
        case 'C':
          isValid = this.$cardNumber.val() !== '' && this.$cardY.val() !== '' &&
            this.$cardM.val() !== '' && this.$cardPw.val() !== '';
          break;
        case 'T':
          isValid = this.$cardNumber.val() !== '' && this.$cardY.val() !== '' &&
            this.$cardM.val() !== '' && this.$cardPw.val() !== '';
          break;
        default:
          isValid = this.$cardY.val() !== '' && this.$cardM.val() !== '' && this.$cardPw.val() !== '';
          break;
      }
    } else {
      isValid = this.$cardBirth.val() !== '' && this.$cardNumber.val() !== '' &&
        this.$cardY.val() !== '' && this.$cardM.val() !== '' && this.$cardPw.val() !== '';
    }

    if (isValid) {
      this.$container.find('.fe-pay').removeAttr('disabled');
    } else {
      this.$container.find('.fe-pay').attr('disabled', 'disabled');
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
  _selectAmount: function ($list, event) {
    var $target = $(event.currentTarget);
    var $amount = $target.attr('id');

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_AMOUNT,
      data: this._getAmountList($list, $amount)
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.amount', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.text());

    this._popupService.close();
  },
  _getAmountList: function ($amountList, $amount) {
    if (Tw.FormatHelper.isEmpty($amountList)) {
      var listObj = {
        'list': []
      };
      var firstAmt = 10000;
      var strdAmt = $amount / firstAmt;

      for (var i = strdAmt; i >= 1; i--) {
        var obj = {
          'option': 'amount',
          'attr': 'id="' + i * firstAmt + '"',
          'value': i + Tw.CURRENCY_UNIT.TEN_THOUSAND
        };
        listObj.list.push(obj);
      }
      $amountList.push(listObj);
    }
    return $amountList;
  },
  _openAmountInfo: function () {
    this._popupService.openAlert(Tw.AMOUNT_INFO[this.$title.toUpperCase() + '_CONTENTS'], Tw.AMOUNT_INFO.TITLE, Tw.BUTTON_LABEL.CONFIRM);
  },
  _autoPrepay: function () {
    if (this._isValid()) {
      this._pay();
    }
  },
  _isValid: function () {
    if (this.$isValid) {
      return this._validation.showAndHideErrorMsg(this.$prepayAmount, this._validation.checkIsMoreAndSet(this.$standardAmount, this.$prepayAmount));
    }
    return false;
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
  _checkBirthday: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 6));
  },
  _checkCardExpiration: function () {
    this.$isValid = this._validation.checkExpiration(this.$cardY, this.$cardM);
  },
  _checkPassword: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 2));
  },
  _pay: function () {
    var reqData = this._makeRequestData();
    var apiName = this._getApiName();

    this._apiService.request(apiName, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _makeRequestData: function () {
    var reqData = {
      checkAuto: 'N',
      autoChrgStrdAmt: this.$standardAmount.attr('id'),
      autoChrgAmt: this.$prepayAmount.attr('id'),
      cardEffYM: $.trim(this.$cardY.val())+ $.trim(this.$cardM.val()),
      cardPwd: $.trim(this.$cardPw.val())
    };

    if (this.$type === 'auto') {
      reqData.cardBirth = $.trim(this.$cardBirth.val());
    } else {
      reqData.checkRadio = this.$changeType;
    }

    if (!(this.$type === 'change' && this.$changeType === 'A')) {
      reqData.cardNum = $.trim(this.$cardNumber.val());
      reqData.cardType = this.$cardNumber.attr('data-code');
      reqData.cardNm = this.$cardNumber.attr('data-name');
    }
    return reqData;
  },
  _getApiName: function () {
    var apiName = '';
    if (this.$title === 'small') {
      apiName = Tw.API_CMD.BFF_07_0076;
    } else {
      apiName = Tw.API_CMD.BFF_07_0083;
    }
    return apiName;
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/pay-complete?type=' + this.$title + '&sub=' + this.$type);
    } else {
      this._payFail(res);
    }
  },
  _payFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};