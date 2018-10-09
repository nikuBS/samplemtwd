/**
 * FileName: myt-fare.payment.prepay.auto.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.06
 */

Tw.MyTFarePaymentPrepayAuto = function (rootEl, title, type) {
  this.$container = rootEl;
  this.$title = title;
  this.$type = type;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;

  this._init();
};

Tw.MyTFarePaymentPrepayAuto.prototype = {
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
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
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
    console.log('check is abled');

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

      for (var i = strdAmt; i <= 1; i--) {
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
    this._popupService.openAlert(Tw.AMOUNT_INFO[this.$title + '_CONTENTS'], Tw.AMOUNT_INFO.TITLE, Tw.BUTTON_LABEL.CONFIRM);
  },
  _autoPrepay: function () {
    if (this._isValid()) {
      if (this.$type === 'change' && this.$changeType === 'A') {
        this._pay();
      } else {
        this._getCardCode();
      }
    }
  },
  _isValid: function () {
    var isValid = false;
    if (this.$type === 'auto') {
      isValid = this._isValidForNew();
    } else {
      isValid = this._isValidForChange();
    }
    return isValid;
  },
  _isValidForNew: function () {
    return (
      this._validation.checkIsMoreAndSet(this.$standardAmount, this.$prepayAmount, Tw.MSG_PAYMENT.PRE_A08) &&
      this._validation.checkEmpty(this.$cardBirth.val(), Tw.MSG_PAYMENT.PRE_A09) &&
      this._validation.checkEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
      this._commonValidationForCard()
    );
  },
  _isValidForChange: function () {
    if (this.$changeType === 'A') {
      return (
        this._validation.checkIsMoreAndSet(this.$standardAmount, this.$prepayAmount, Tw.MSG_PAYMENT.PRE_A08) &&
        this._commonValidationForCard()
      );
    } else if (this.$changeType === 'C') {
      return (
        this._validation.checkEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
        this._commonValidationForCard()
      );
    } else {
      return (
        this._validation.checkIsMoreAndSet(this.$standardAmount, this.$prepayAmount, Tw.MSG_PAYMENT.PRE_A08) &&
        this._validation.checkEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
        this._commonValidationForCard(this.$cardWrap));
    }
  },
  _commonValidationForCard: function () {
    return (
      this._validation.checkEmpty(this.$cardY.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardM.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardPw.val(), Tw.MSG_PAYMENT.AUTO_A04) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A04)
    );
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

      this._pay(cardCode, cardName);
    } else {
      this._getFail(res.error);
    }
  },
  _getFail: function (err) {
    this._popupService.openAlert(err.message, err.code);
  },
  _pay: function (cardCode, cardName) {
    var reqData = this._makeRequestData(cardCode, cardName);
    var apiName = this._getApiName();

    this._apiService.request(apiName, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _makeRequestData: function (cardCode, cardName) {
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
      reqData.cardType = cardCode;
      reqData.cardNm = cardName;
    }
    return reqData;
  },
  _getApiName: function () {
    var apiName = '';
    if (this.$title === 'MICRO') {
      apiName = Tw.API_CMD.BFF_07_0076;
    } else {
      apiName = Tw.API_CMD.BFF_07_0083;
    }
    return apiName;
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.openAlert('complete');
    } else {
      this._payFail(res);
    }
  },
  _payFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  }
};