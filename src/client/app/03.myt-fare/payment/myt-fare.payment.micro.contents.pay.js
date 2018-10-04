/**
 * FileName: myt-fare.payment.micro.contents.pay.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTFarePaymentMicroContentsPay = function (rootEl, title, amount, name) {
  this.$container = rootEl;
  this.$title = title;
  this._maxAmount = amount;
  this._name = name;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._historyService.init('hash');

  this._init();
};

Tw.MyTFarePaymentMicroContentsPay.prototype = {
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
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-select-card-type', $.proxy(this._selectCardType, this));
    this.$container.on('click', '.fe-check-pay', $.proxy(this._checkPay, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._pay, this));
  },
  _checkIsAbled: function () {
    if (this.$prepayAmount.val() !== '' && this.$cardNumber.val() !== '' &&
      this.$cardY.val() !== '' && this.$cardM.val() !== '' && this.$cardPw.val() !== '') {
      this.$container.find('.fe-check-pay').removeAttr('disabled');
    } else {
      this.$container.find('.fe-check-pay').attr('disabled', 'disabled');
    }
  },
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      hbs:'actionsheet_select_a_type',
      layer:true,
      title:Tw.POPUP_TITLE.SELECT_CARD_TYPE,
      data:Tw.POPUP_TPL.FARE_PAYMENT_CARD_TYPE_LIST
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
    return (
      this._validation.checkEmpty(this._maxAmount, Tw.MSG_PAYMENT.PRE_A01) &&
      this._validation.checkIsAvailablePoint(this._maxAmount, this._possibleAmount, Tw.MSG_PAYMENT.PRE_A12) &&
      this._validation.checkIsMore(this._maxAmount, 9999, Tw.MSG_PAYMENT.PRE_A11) &&
      this._validation.checkMultiple(this._maxAmount, 10000, Tw.MSG_PAYMENT.PRE_A11) &&
      this._validation.checkEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
      this._validation.checkEmpty(this.$cardY.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardM.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardPw.val(), Tw.MSG_PAYMENT.AUTO_A04) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A04));
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

      this._historyService.goHash('#check');
      this._setData(cardCode, cardName);
    } else {
      this._getFail(res.error);
    }
  },
  _getFail: function (err) {
    this._popupService.openAlert(err.message, err.code);
  },
  _setData: function (cardCode, cardName) {
    this.$container.find('.fe-payment-option-name').attr('id', cardCode).text(cardName);
    this.$container.find('.fe-payment-option-number').text(this.$cardNumber.val());
    this.$container.find('.fe-payment-amount').text(Tw.FormatHelper.addComma($.trim(this.$prepayAmount.val().toString())));
    this.$container.find('.fe-payment-type').text(this.$cardTypeSelector.text());
  },
  _pay: function () {
    var reqData = this._makeRequestData();
    this._apiService.request(Tw.API_CMD.BFF_07_0074, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _makeRequestData: function () {
    var reqData = {
      tmthChrgPsblAmt: this._maxAmount.toString(),
      checkAuto: 'N',
      requestSum: $.trim(this.$prepayAmount.val().toString()),
      cardNumVal: this.$container.find('.fe-payment-option-number').text(),
      cardCorp: this.$container.find('.fe-payment-option-name').attr('id'),
      cardNm: this.$container.find('.fe-payment-option-name').text(),
      cardExpyyVal: $.trim(this.$cardY.val())+ $.trim(this.$cardM.val()),
      instmm: this.$cardTypeSelector.attr('id').toString(),
      cardPwdVal: $.trim(this.$cardPw.val().toString())
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
  },



  _setAutoInfo: function (event) {
    var $target = $(event.currentTarget);

    if ($target.hasClass('checked')) {
      this.$cardNumber.attr({
        'type': 'text',
        'disabled': 'disabled',
        'cardcode': this._autoCardCode,
        'cardname': this._autoCardName
      });
      this.$cardNumber.removeAttr('inputmode');
      this.$cardNumber.removeAttr('min');
      this.$cardNumber.removeAttr('pattern');
      this.$cardNumber.val(this._autoCardNumber);
    } else {
      this.$cardNumber
        .attr({
          'type': 'number',
          'inputmode': 'numeric',
          'min': '0',
          'pattern': '[0-9]*'
        });
      this.$cardNumber.val('').removeAttr('disabled').removeAttr('cardcode').removeAttr('cardname');
    }
  },
  _requestPrepay: function () {
    if (this._isValid()) {
      var reqData = this._makeRequestData();
      if (this.$cardNumber.attr('cardcode') === undefined) {
        this._getCardInfo(reqData);
      } else {
        this._prepay(reqData);
      }
    }
  },
  _isValid: function () {
    var inputAmount = this.$inputPrepayAmount.val();
    return (this._validation.checkEmpty(inputAmount, Tw.MSG_PAYMENT.PRE_A01) &&
      this._validation.checkIsAvailablePoint(inputAmount, this._possibleAmount, Tw.MSG_PAYMENT.PRE_A12) &&
      this._validation.checkIsMore(inputAmount, 9999, Tw.MSG_PAYMENT.PRE_A11) &&
      this._validation.checkMultiple(inputAmount, 10000, Tw.MSG_PAYMENT.PRE_A11) &&
      this._commonValidationForCard(this.$cardWrap));
  },
  _commonValidationForCard: function ($target) {
    var vars = this._getVariables($target);

    return (this._validation.checkEmpty(vars.cardNumberVal, Tw.MSG_PAYMENT.AUTO_A05) &&
      this._validation.checkIsMore(vars.cardNumberVal, 15, Tw.MSG_PAYMENT.REALTIME_A06) &&
      this._validation.checkEmpty(vars.cardYVal, Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(vars.cardMVal, Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkLength(vars.cardYVal, 4, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkYear(vars.cardYVal, vars.cardMVal, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkLength(vars.cardMVal, 2, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkMonth(vars.cardMVal, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkEmpty(vars.cardPasswordVal, Tw.MSG_PAYMENT.AUTO_A04) &&
      this._validation.checkLength(vars.cardPasswordVal, 2, Tw.MSG_PAYMENT.REALTIME_A07));
  },
  _getVariables: function ($target) {
    return {
      cardNumberVal: $target.find('.fe-card-number').val(),
      cardYVal: $target.find('.fe-card-y').val(),
      cardMVal: $target.find('.fe-card-m').val(),
      cardPasswordVal: $target.find('.fe-card-password').val()
    };
  },
  _makeRequestData: function () {
    var vars = this._getVariables(this.$cardWrap);
    var isAuto = 'N';
    if (this.$cardNumber.attr('cardcode') === this._autoCardCode) {
      isAuto = 'Y';
    }

    return {
      tmthChrgPsblAmt: this._possibleAmount,
      checkAuto: isAuto,
      requestSum: $.trim(this.$inputPrepayAmount.val()),
      cardNumVal: $.trim(this.$cardNumber.val()),
      cardExpyyVal: $.trim(vars.cardYVal) + $.trim(vars.cardMVal),
      instMm: this._instMm,
      cardPwdVal: $.trim(vars.cardPasswordVal),
      cardCorp: this.$cardNumber.attr('cardcode'),
      cardNm: this.$cardNumber.attr('cardname')
    };
  },
  _getCardInfo: function (reqData) {
    this._apiService.request(Tw.API_CMD.BFF_07_0068, {}, {}, $.trim(this.$cardNumber.val()).substr(0, 6))
      .done($.proxy(this._getCardSuccess, this, reqData))
      .fail($.proxy(this._getCardFail, this));
  },
  _getCardSuccess: function (reqData, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      reqData.cardCorp = res.result.prchsCardCd;
      reqData.cardNm = res.result.prcchsCardName;

      this._prepay(reqData);
    } else {
      this._getCardFail();
    }
  },
  _getCardFail: function () {
    this._popupService.openAlert(Tw.MSG_PAYMENT.ERROR_GET_CARD);
  },
  _prepay: function (reqData) {
    var $api = Tw.API_CMD.BFF_07_0074;
    if (this.$title === 'contents') {
      $api = Tw.API_CMD.BFF_07_0082;
    }
    this._apiService.request($api, reqData)
      .done($.proxy(this._prepaySuccess, this))
      .fail($.proxy(this._prepayFail, this));
  },
  _prepaySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._history.setHistory();

      var $target = this.$container.find('.fe-complete-data-set');
      this._setCompleteTitle($target);
      this._setCompleteData(res.result, $target);

      this._go('#complete');
    } else {
      this._prepayFail(res);
    }
  },
  _prepayFail: function (err) {
    this._popupService.openAlert(err.code + ' ' + err.msg);
  },
  _setCompleteTitle: function ($target) {
    var $title = '';
    if (this.$title === 'micro') {
      $title = Tw.PAYMENT_PREPAY_TITLE.MICRO_PREPAY;
    } else {
      $title = Tw.PAYMENT_PREPAY_TITLE.CONTENTS_PREPAY;
    }
    $target.find('.fe-complete-title').text($title);
    $target.find('.fe-complete-message').text(Tw.PAYMENT_PREPAY_TITLE.PREPAY_COMPLETE);
  },
  _setCompleteData: function ($result, $target) {
    for (var key in $result) {
      $target.find('.fe-' + key).text($result[key]);
    }
    $target.find('.fe-tmthChrgAmt').text(Tw.FormatHelper.addComma($result.tmthChrgAmt));
    $target.find('.fe-instMm').text(this._getInstMm($result.instMm));
  },
  _getInstMm: function (value) {
    var name = '';
    if (value === '00') {
      name = Tw.PAYMENT_CARD_TYPE['000'];
    } else {
      if (value[0] === '0') {
        value = value.replace(value[0], '');
      }
      name = value + Tw.PAYMENT_CARD_TYPE.M;
    }
    return name;
  },
  _openCancel: function () {
    this._popupService.openAlert(Tw.MSG_PAYMENT.PRE_A06, null, $.proxy(this._goBack, this));
  },
  _goBack: function () {
    this._history.go(-2);
  },
  _go: function (hash) {
    this._history.goHash(hash);
  }
};