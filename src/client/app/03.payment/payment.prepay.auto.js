/**
 * FileName: payment.prepay.auto.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.06
 */

Tw.PaymentPrepayAuto = function (rootEl, title) {
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

Tw.PaymentPrepayAuto.prototype = {
  _init: function () {
    this.$container.find('input[type="text"]').val();
    this.$container.find('input[type="number"]').val();

    this._initVariables();
    this._initAutoCardInfo();
  },
  _initVariables: function () {
    this._standardAmountList = [];
    this._prepayAmountList = [];
    this._autoCardNumber = null;
    this._autoCardCode = null;
    this._autoCardName = null;
    this.$cardWrap = this.$container.find('.fe-card-wrap');
    this.$cardNumber = this.$cardWrap.find('.fe-card-number');
    this.$standardSelector = this.$container.find('.fe-select-standard-amount');
    this.$prepaySelector = this.$container.find('.fe-select-prepay-amount');
    this.$changeMoneyInfo = this.$container.find('.fe-change-money-info');
    this.$changeCardInfo = this.$container.find('.fe-change-card-info');
    this.$changeCheckbox = this.$container.find('.fe-change-prepay-check-box');
    this.$cardInfo = this.$container.find('.fe-card-info-title');
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
    this.$container.on('change', '.fe-change-type', $.proxy(this._changeType, this));
    this.$container.on('click', '.fe-standard-amount-info', $.proxy(this._openStandardAmountInfo, this));
    this.$container.on('click', '.pay-check-box', $.proxy(this._setAutoInfo, this));
    this.$container.on('click', '.fe-select-standard-amount', $.proxy(this._selectAmount, this, this._standardAmountList));
    this.$container.on('click', '.fe-select-prepay-amount', $.proxy(this._selectAmount, this, this._prepayAmountList));
    this.$container.on('click', '.fe-request-auto-prepay', $.proxy(this._requestPrepay, this, 'auto'));
    this.$container.on('click', '.fe-request-change-prepay', $.proxy(this._requestPrepay, this, 'change'));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _changeType: function (event) {
    var $target = $(event.target);
    var $cardNumber = this.$cardWrap.find('.fe-card-number');
    this.$changeCheckbox.removeClass('checked').attr('aria-checked', 'false').find('input').removeAttr('checked');

    if ($target.hasClass('fe-money')) {
      this.$changeMoneyInfo.show();
      this.$changeCardInfo.show();
      this.$changeCheckbox.hide();
      this.$cardInfo.hide();

      var cardName = this.$container.find('.fe-auto-cardname').text();
      var cardNum = this.$container.find('.fe-auto-cardnum').text();
      $cardNumber.attr({ 'type': 'text', 'disabled': 'disabled' }).val(cardName + ' ' + cardNum);
    } else if ($target.hasClass('fe-card')) {
      this.$changeMoneyInfo.hide();
      this.$changeCardInfo.hide();
      this.$cardInfo.show();
      if (this._autoCardNumber !== null) {
        this.$changeCheckbox.show();
      }
      $cardNumber.attr('type', 'number').removeAttr('disabled');
    } else {
      this.$changeMoneyInfo.show();
      this.$changeCardInfo.hide();
      this.$cardInfo.show();
      if (this._autoCardNumber !== null) {
        this.$changeCheckbox.show();
      }
      $cardNumber.attr('type', 'number').removeAttr('disabled');
    }
  },
  _openStandardAmountInfo: function () {
    var contents = Tw.PAYMENT_STRD_MSG.CONTENTS_L03_MICRO;
    if (this.$title === 'contents') {
      contents = Tw.PAYMENT_STRD_MSG.CONTENTS_L03_CONTENTS;
    }
    this._popupService.open({
      'title': Tw.PAYMENT_STRD_MSG.TITLE_L03,
      'close_bt': true,
      'contents': contents
    });
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

    this._popupService.close();
  },
  _selectAmount: function ($list, event) {
    var $target = $(event.currentTarget);
    var $amount = $target.attr('id');
    this._popupService.openChoice(Tw.MSG_PAYMENT.SELECT_AMOUNT, this._getAmountList($list, $amount), 'type1',
      $.proxy(this._selectPopupCallback, this, $target));
  },
  _requestPrepay: function () {
    if (this._isValid()) {
      var reqData = this._makeRequestData();
      if (this.$cardNumber.attr('cardcode') === undefined) {
        this._getCardInfo(reqData);
      } else {
        this._autoPrepay(reqData);
      }
    }
  },
  _isValid: function () {
    return (this._validation.checkIsMore(this.$standardSelector.attr('id'), this.$prepaySelector.attr('id'), Tw.MSG_PAYMENT.PRE_A08) &&
      this._commonValidationForCard(this.$cardWrap));
  },
  _commonValidationForCard: function ($target) {
    var vars = this._getVariables($target);

    return (this._validation.checkEmpty(vars.cardBirthVal, Tw.MSG_PAYMENT.PRE_A09) &&
      this._validation.checkEmpty(vars.cardNumberVal, Tw.MSG_PAYMENT.AUTO_A05) &&
      this._validation.checkIsMore(vars.cardNumberVal, 15, Tw.MSG_PAYMENT.REALTIME_A06) &&
      this._validation.checkEmpty(vars.cardYVal, Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(vars.cardMVal, Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkLength(vars.cardYVal, 4, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkYear(vars.cardYVal, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkLength(vars.cardMVal, 2, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkMonth(vars.cardMVal, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkEmpty(vars.cardPasswordVal, Tw.MSG_PAYMENT.AUTO_A04) &&
      this._validation.checkLength(vars.cardPasswordVal, 2, Tw.MSG_PAYMENT.REALTIME_A07));
  },
  _getVariables: function ($target) {
    return {
      cardBirthVal: $target.find('.fe-birth').val(),
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
      checkAuto: isAuto,
      autoChrgStrdAmt: this.$standardSelector.attr('id'),
      autoChrgAmt: this.$prepaySelector.attr('id'),
      cardBirth: $.trim(),
      cardNum: $.trim(this.$cardNumber.val()),
      cardEffYM: $.trim(vars.cardYVal) + $.trim(vars.cardMVal),
      cardPwd: $.trim(vars.cardPasswordVal),
      cardType: this.$cardNumber.attr('cardcode'),
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
      reqData.cardType = res.result.isueCardCd;
      reqData.cardNm = res.result.isueCardName;

      this._autoPrepay(reqData);
    } else {
      this._getCardFail();
    }
  },
  _getCardFail: function () {
    this._popupService.openAlert(Tw.MSG_PAYMENT.ERROR_GET_CARD);
  },
  _autoPrepay: function (reqData) {
    var $api = Tw.API_CMD.BFF_07_0076;
    if (this.$title === 'contents') {
      $api = Tw.API_CMD.BFF_07_0083;
    }
    this._apiService.request($api, reqData)
      .done($.proxy(this._autoPrepaySuccess, this))
      .fail($.proxy(this._autoPrepayFail, this));
  },
  _autoPrepaySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._history.setHistory();
      var $target = this.$container.find('.fe-complete-data-set');
      this._setCompleteTitle($target);
      this._setCompleteData(res.result, $target);
      this._go('#complete');
    } else {
      this._autoPrepayFail(res);
    }
  },
  _autoPrepayFail: function (err) {
    this._popupService.openAlert(err.code + ' ' + err.msg);
  },
  _setCompleteTitle: function ($target) {
    $target.find('.fe-complete-title').text(Tw.PAYMENT_PREPAY_TITLE.AUTO_PREPAY);
    $target.find('.fe-complete-message').text(Tw.PAYMENT_PREPAY_TITLE.AUTO_COMPLETE);
  },
  _setCompleteData: function ($result, $target) {
    for (var key in $result) {
      $target.find('.fe-' + key).text($result[key]);
    }
    $target.find('.fe-autoChrgStrdAmt').text(Tw.FormatHelper.addComma($result.autoChrgStrdAmt));
    $target.find('.fe-autoChrgAmt').text(Tw.FormatHelper.addComma($result.autoChrgAmt));
  },
  _go: function (hash) {
    this._history.goHash(hash);
  },
  _getAmountList: function ($amountList, $amount) {
    if (Tw.FormatHelper.isEmpty($amountList)) {
      var firstAmt = 10000;
      var strdAmt = $amount / firstAmt;
      for (var i = 1; i <= strdAmt; i++) {
        var obj = {
          'attr': 'id="' + i * firstAmt + '"',
          'text': i + Tw.CURRENCY_UNIT.TEN_THOUSAND
        };
        $amountList.push(obj);
      }
    }
    return $amountList;
  }
};