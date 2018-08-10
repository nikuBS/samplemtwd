/**
 * FileName: payment.prepay.pay.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.06
 */

Tw.PaymentPrepayPay = function (rootEl, title) {
  this.$container = rootEl;
  this.$title = title;
  this.$window = $(window);
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();
  this._bindEvent();
};

Tw.PaymentPrepayPay.prototype = {
  _init: function () {
    this.$container.find('input[type="text"]').val('');
    this.$container.find('input[type="number"]').val('');

    this._initVariables();
    this._initAutoCardInfo();
  },
  _initVariables: function () {
    this.$maxAmount = this.$container.find('.fe-max-amount');
    this.$cardWrap = this.$container.find('.fe-card-wrap');
    this.$cardNumber = this.$cardWrap.find('.fe-card-number');
    this.$inputPrepayAmount = this.$container.find('.fe-input-prepay-amount');
    this._possibleAmount = this.$maxAmount.attr('data');
    this._instMm = '00';
  },
  _initAutoCardInfo: function () {
    this.$autoPrepayInfoWrap = this.$container.find('.fe-s-card-info');
    this._autoCardNumber = null;
    this._autoCardCode = null;
    this._autoCardName = null;

    if (this.$autoPrepayInfoWrap) {
      this._autoCardNumber = this.$autoPrepayInfoWrap.find('.fe-s-card-number').text();
      this._autoCardCode = this.$autoPrepayInfoWrap.find('.fe-s-card-code').text();
      this._autoCardName = this.$autoPrepayInfoWrap.find('.fe-s-card-name').text();
    }
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.fe-only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('click', '.pay-check-box', $.proxy(this._setAutoInfo, this));
    this.$container.on('click', '.fe-card-type-selector', $.proxy(this._selectCardType, this));
    this.$container.on('click', '.fe-prepay', $.proxy(this._requestPrepay, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
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
      this.$cardNumber.val(this._autoCardNumber);
    } else {
      this.$cardNumber.attr('type', 'number');
      this.$cardNumber.val('').removeAttr('disabled').removeAttr('cardcode').removeAttr('cardname');
    }
  },
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.openChoice(Tw.MSG_PAYMENT.SELECT_CARD_TYPE, Tw.PAYMENT_CARD_TYPE_LIST, 'type2',
      $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr('id', $selectedValue.find('button').attr('id'));
    $target.text($selectedValue.text());

    this._instMm = $selectedValue.find('button').attr('id');
    this._popupService.close();
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
      reqData.cardCorp = res.result.isueCardCd;
      reqData.cardNm = res.result.isueCardName;

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
    $target.find('.fe-complete-title').text(Tw.PAYMENT_PREPAY_TITLE.MICRO_PREPAY);
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
  _go: function (hash) {
    this._history.goHash(hash);
  }
};