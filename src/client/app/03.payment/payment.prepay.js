/**
 * FileName: payment.prepay.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.25
 */

Tw.PaymentPrepay = function (rootEl) {
  this.$container = rootEl;
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

Tw.PaymentPrepay.prototype = {
  _init: function () {
    this.$container.find('input[type="text"]').val();
    this.$container.find('input[type="number"]').val();
    this.$container.find('.pay-check-box').hide();

    this._initVariables();
  },
  _initVariables: function () {
    this._mainTitle = this.$container.find('.fe-main-title').text();
    this._amountList = [];
    this._requestGubun = 'Request';
    this._requestCount = 0;
    this._autoCardNumber = null;
    this._autoCardCode = null;
    this._autoCardName = null;
    this.$remainBtnWrap = this.$container.find('.fe-get-remain-btn-wrap');
    this.$remainInfo = this.$container.find('.fe-remain-info');
    this.$remainInfoWrap = this.$container.find('.fe-remain-info-wrap');
    this.$maxAmountWrap = this.$container.find('.fe-max-amount-wrap');
    this.$maxAmount = this.$container.find('.fe-max-amount');
    this.$standardAmount = this.$container.find('.fe-standard-amount');
    this.$getDetailBtn = this.$container.find('.fe-get-detail');
    this.$goPrepayBtn = this.$container.find('.fe-go-prepay');
    this.$autoPrepayBtn = this.$container.find('.fe-auto-prepay');
    this.$inputPrepayAmount = this.$container.find('.fe-input-prepay-amount');
    this.$newCardWrap = this.$container.find('.fe-new-card-wrap');
    this.$autoCardWrap = this.$container.find('.fe-auto-card-wrap');
    this.$changeCardWrap = this.$container.find('.fe-change-card-wrap');
    this.$cardTypeSelector = this.$newCardWrap.find('.fe-card-type-selector');
    this.$autoStandardSelector = this.$container.find('.fe-select-standard-amount');
    this.$autoPrepaySelector = this.$container.find('.fe-select-prepay-amount');
    this.$changeMoneyInfo = this.$container.find('.fe-change-money-info');
    this.$changeCardInfo = this.$container.find('.fe-change-card-info');
    this.$changeCheckbox = this.$container.find('.fe-change-prepay-check-box');
    this.$cardInfo = this.$container.find('.fe-card-info-title');
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.fe-only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('change', '.fe-change-type', $.proxy(this._changeType, this));
    this.$container.on('click', '.fe-get-remain-btn', $.proxy(this._getRemainLimit, this));
    this.$container.on('click', '.fe-change-limit', $.proxy(this._openChangeLimit, this));
    this.$container.on('click', '.fe-standard-amount-info', $.proxy(this._openStandardAmountInfo, this));
    this.$container.on('click', '.fe-get-detail', $.proxy(this._openDetailPrepay, this));
    this.$container.on('click', '.fe-get-detail-auto-prepay', $.proxy(this._getDetailAutoPrepay, this));
    this.$container.on('click', '.fe-change-auto-prepay', $.proxy(this._changeAutoPrepay, this));
    this.$container.on('click', '.fe-go-prepay', $.proxy(this._goPrepay, this));
    this.$container.on('click', '.fe-auto-prepay', $.proxy(this._goAutoPrepay, this));
    this.$container.on('click', '.fe-cancel-auto-prepay', $.proxy(this._confirmCancel, this));
    this.$container.on('click', '.pay-check-box', $.proxy(this._setAutoInfo, this));
    this.$container.on('click', '.fe-prepay', $.proxy(this._requestPrepay, this, 'prepay'));
    this.$container.on('click', '.fe-select-prepay-amount', $.proxy(this._selectPrepayAmount, this));
    this.$container.on('click', '.fe-request-auto-prepay', $.proxy(this._requestPrepay, this, 'auto'));
    this.$container.on('click', '.fe-request-change-prepay', $.proxy(this._requestPrepay, this, 'change'));
    this.$cardTypeSelector.on('click', $.proxy(this._selectCardType, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _changeType: function (event) {
    var $target = $(event.target);
    var $cardNumber = this.$changeCardWrap.find('.fe-card-number');
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
  _getRemainLimit: function () {
    this._getPreRemainLimit();
    // $.ajax('/mock/payment.remain-limit.json')
    //  .done($.proxy(this._getRemainLimitSuccess, this))
    //  .fail($.proxy(this._getRemainLimitFail, this));
  },
  _getPreRemainLimit: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0073, {
      gubun: this._requestGubun,
      requestCnt: this._requestCount
    }).done($.proxy(this._getPreRemainLimitSuccess, this))
      .fail($.proxy(this._getRemainLimitFail, this));
  },
  _getPreRemainLimitSuccess: function (res) {
    if (this._requestCount === 0) {
      this._requestGubun = 'Done';
      this._requestCount++;
      this._getPreRemainLimit();
    } else if (this._requestCount === 1) {
      if (res.code === Tw.API_CODE.CODE_00) {
        this._getRemainLimitSuccess(res);
      } else {
        this._requestGubun = 'Retry';
        this._requestCount++;
        this._getPreRemainLimit();
      }
    } else {
      this._getRemainLimitFail(res);
    }
  },
  _getRemainLimitSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$remainBtnWrap.hide();

      var $result = res.result;
      this._setRemainLimitInfo($result);

      if ($result.autoChrgStCd === Tw.AUTO_CHARGE_CODE.USE) {
        this.$container.find('.fe-auto-prepay-arrow').removeClass('none');
      }
      this.$getDetailBtn.removeAttr('disabled').addClass('on');
      this.$remainInfoWrap.removeClass('none');
      this.$maxAmountWrap.removeClass('none');
    } else {
      this._getRemainLimitFail(res);
    }
  },
  _getRemainLimitFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },
  _setRemainLimitInfo: function ($result) {
    this.$limitAmount = $result.microPayLimitAmt;
    this.$useAmount = $result.tmthUseAmt;
    this.$prepayAmount = $result.tmthChrgAmt;
    this.$possibleAmount = $result.tmthChrgPsblAmt;
    this.$remainAmount = $result.remainUseLimit;

    this.$remainInfo.text(Tw.FormatHelper.addComma(this.$remainAmount));
    this.$maxAmount.text(Tw.FormatHelper.addComma(this.$possibleAmount));

    this.$standardAmountAbbr = this.$limitAmount / 10000;
    this.$standardAmount.text(this.$standardAmountAbbr);
    this.$autoStandardSelector.attr('id', this.$limitAmount).text(this.$standardAmountAbbr + Tw.CURRENCY_UNIT.TEN_THOUSAND);
    this.$autoPrepaySelector.attr('id', this.$limitAmount).text(this.$standardAmountAbbr + Tw.CURRENCY_UNIT.TEN_THOUSAND);

    if (this.$possibleAmount > 0) {
      this.$goPrepayBtn.removeAttr('disabled').removeClass('bt-gray1').addClass('bt-blue1');
      this._setCardTypeDisabled(this.$possibleAmount);
    }
    this.$autoPrepayBtn.removeAttr('disabled').addClass('on');
    this.$autoPrepayBtn.on('click', $.proxy(this._goAutoPrepay, this));
  },
  _getRemainAmount: function () {
    var limitAmount = parseInt(this.$limitAmount, 10);
    var useAmount = parseInt(this.$useAmount, 10);
    var prepayAmount = parseInt(this.$prepayAmount, 10);

    return limitAmount - useAmount + prepayAmount;
  },
  _openChangeLimit: function () {
    this._history.goLoad('/myt/bill/history/contents/limit/change');
  },
  _openStandardAmountInfo: function () {
    this._popupService.open({
      'title': Tw.PAYMENT_STRD_MSG.TITLE_L02,
      'close_bt': true,
      'contents': Tw.PAYMENT_STRD_MSG.CONTENTS_L02
    });
  },
  _openDetailPrepay: function () {
    this._popupService.open({
      hbs: 'PA_08_L01'
    }, $.proxy(this._setDetailPrepay, this));
  },
  _setDetailPrepay: function ($layer) {
    $layer.find('.fe-detail-title').text(this._mainTitle);
    $layer.find('.fe-remain-amount').text(Tw.FormatHelper.addComma(this.$remainAmount));
    $layer.find('.fe-limit-amount').text(Tw.FormatHelper.addComma(this.$limitAmount));
    $layer.find('.fe-use-amount').text(Tw.FormatHelper.addComma(this.$useAmount));
    $layer.find('.fe-prepay-amount').text(Tw.FormatHelper.addComma(this.$prepayAmount));
    $layer.find('.fe-possible-amount').text(Tw.FormatHelper.addComma(this.$possibleAmount));

    $layer.on('click', '.footer-wrap button', $.proxy(this._closePopup, this));
  },
  _getDetailAutoPrepay: function () {
    this._history.goLoad('/payment/prepay/micro/auto/history');
  },
  _goPrepay: function (event) {
    event.preventDefault();
    if ($(event.currentTarget).attr('disabled') === undefined) {
      this._getAutoPrepayInfo('#step1-prepay');
    }
  },
  _goAutoPrepay: function () {
    this._getAutoPrepayInfo('#step1-auto-prepay');
  },
  _changeAutoPrepay: function () {
    this._getAutoPrepayInfo('#step1-change-prepay');
  },
  _getAutoPrepayInfo: function (hash) {
    this._apiService.request(Tw.API_CMD.BFF_05_0089, {})
      .done($.proxy(this._getAutoPrepayInfoSuccess, this, hash))
      .fail($.proxy(this._getAutoPrepayInfoFail, this, hash));
  },
  _getAutoPrepayInfoSuccess: function (hash, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (res.result.payMthdCd === '02') {
        this.$container.find('.pay-check-box').not('.fe-change-prepay-check-box').show();
        this._autoCardNumber = res.result.s_bank_card_num;
        this._autoCardCode = res.result.s_bank_card_co_cd;
        this._autoCardName = res.result.s_bank_card_name;
      } else {
        this._initAutoCardInfo();
      }
    } else {
      this._initAutoCardInfo();
    }
    this._go(hash);
  },
  _getAutoPrepayInfoFail: function (hash) {
    Tw.Logger.info('get auto prepay info fail');
    this._initAutoCardInfo();
    this._go(hash);
  },
  _initAutoCardInfo: function () {
    this._autoCardNumber = null;
    this._autoCardCode = null;
    this._autoCardName = null;
  },
  _confirmCancel: function () {
    this._popupService.openAlert(Tw.MSG_PAYMENT.PRE_A07, null, $.proxy(this._cancelAutoPrepay, this));
  },
  _cancelAutoPrepay: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0077, {})
      .done($.proxy(this._cancelAutoPrepaySuccess, this))
      .fail($.proxy(this._cancelAutoPrepayFail, this));
  },
  _cancelAutoPrepaySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._history.setHistory();
      this._go('#complete-auto-cancel');
    } else {
      this._cancelAutoPrepayFail();
    }
  },
  _cancelAutoPrepayFail: function () {
    Tw.Logger.info('cancel auto prepay fail');
    this._history.setHistory();
    this._go('#error');
  },
  _setAutoInfo: function (event) {
    var $target = $(event.currentTarget);
    var $parent = $target.parents('.pay-info');
    var $cardNum = $parent.find('.fe-card-number');

    if ($target.hasClass('checked')) {
      $cardNum.attr({
        'type': 'text',
        'disabled': 'disabled',
        'cardcode': this._autoCardCode,
        'cardname': this._autoCardName
      });
      $cardNum.val(this._autoCardNumber);
    } else {
      $cardNum.attr('type', 'number');
      $cardNum.val('').removeAttr('disabled').removeAttr('cardcode').removeAttr('cardname');
    }
  },
  _setCardTypeDisabled: function (amount) {
    if (parseInt(amount, 10) <= 50000) {
      this.$cardTypeSelector.attr('disabled', 'disabled');
    } else {
      this.$cardTypeSelector.removeAttr('disabled');
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
  _selectPrepayAmount: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.openChoice(Tw.MSG_PAYMENT.SELECT_AMOUNT, this._getStandardAmountList(), 'type1',
      $.proxy(this._selectPopupCallback, this, $target));
  },
  _requestPrepay: function (type) {
    var $wrap = this.$newCardWrap;
    if (type === 'auto') {
      $wrap = this.$autoCardWrap;
    } else if (type === 'change') {
      $wrap = this.$changeCardWrap;
    }
    if (this._isValid($wrap, type)) {
      var reqData = this._makeRequestData(type);
      var $cardNumber = $wrap.find('.fe-card-number');
      if ($cardNumber.attr('cardcode') === undefined) {
        this._getCardInfo(reqData, $cardNumber, type);
      } else {
        this._prepay(reqData, type);
      }
    }
  },
  _getCardInfo: function (reqData, $cardNumber, type) {
    this._apiService.request(Tw.API_CMD.BFF_07_0068, {}, {}, $.trim($cardNumber.val()).substr(0, 6))
      .done($.proxy(this._getCardSuccess, this, reqData, type))
      .fail($.proxy(this._getCardFail, this));
  },
  _getCardSuccess: function (reqData, type, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (type === 'auto' || type === 'change') {
        reqData.cardType = res.result.isueCardCd;
      } else {
        reqData.cardcorp = res.result.isueCardCd;
      }
      reqData.cardNm = res.result.isueCardName;
      this._prepay(reqData, type);
    } else {
      this._getCardFail();
    }
  },
  _getCardFail: function () {
    this._popupService.openAlert(Tw.MSG_PAYMENT.ERROR_GET_CARD);
  },
  _prepay: function (reqData, type) {
    var $api = Tw.API_CMD.BFF_07_0074;
    if (type === 'auto' || type === 'change') {
      $api = Tw.API_CMD.BFF_07_0076;
    }
    this._apiService.request($api, reqData)
      .done($.proxy(this._prepaySuccess, this, type))
      .fail($.proxy(this._prepayFail, this));
  },
  _prepaySuccess: function (type, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._history.setHistory();
      this._setCompleteTitle(type);
      this._go('#complete-prepay');
    } else {
      this._prepayFail(res);
    }
  },
  _prepayFail: function (err) {
    this._history.setHistory();
    this.$container.find('.fe-error-code').text(err.code);
    this.$container.find('.fe-error-message').text(err.msg);
    this._go('#error');
  },
  _setCompleteTitle: function (type) {
    var $title = this.$container.find('.fe-complete-title');
    var $message = this.$container.find('.fe-complete-message');
    if (type === 'auto') {
      $title.text(Tw.PAYMENT_PREPAY_TITLE.AUTO_PREPAY);
      $message.text(Tw.PAYMENT_PREPAY_TITLE.AUTO_COMPLETE);
    } else if (type === 'cancel') {
      $title.text(Tw.PAYMENT_PREPAY_TITLE.AUTO_PREPAY);
      $message.text(Tw.PAYMENT_PREPAY_TITLE.CANCEL_COMPLETE);
    } else if (type === 'change') {
      $title.text(Tw.PAYMENT_PREPAY_TITLE.CHANGE_MONEY);
      $message.text(Tw.PAYMENT_PREPAY_TITLE.AUTO_COMPLETE);
    } else {
      $title.text(Tw.PAYMENT_PREPAY_TITLE.MICRO_PREPAY);
      $message.text(Tw.PAYMENT_PREPAY_TITLE.PREPAY_COMPLETE);
    }
  },
  _isValid: function ($wrap, type) {
    var isValid = false;
    if (type === 'auto' || type === 'change') {
      isValid = this._isAutoPrepayValid($wrap);
    } else {
      isValid = this._isPrepayValid($wrap);
    }
    return isValid;
  },
  _isPrepayValid: function ($target) {
    var inputAmount = this.$inputPrepayAmount.val();

    return (this._validation.checkEmpty(inputAmount, Tw.MSG_PAYMENT.PRE_A01) &&
      this._validation.checkIsAvailablePoint(inputAmount, this.$possibleAmount, Tw.MSG_PAYMENT.PRE_A08) &&
      this._validation.checkIsMore(inputAmount, 9999, Tw.MSG_PAYMENT.PRE_A11) &&
      this._validation.checkMultiple(inputAmount, 10000, Tw.MSG_PAYMENT.PRE_A11) &&
      this._commonValidationForCard($target));
  },
  _getVariables: function ($target) {
    return {
      cardNumberVal: $target.find('.fe-card-number').val(),
      cardYVal: $target.find('.fe-card-y').val(),
      cardMVal: $target.find('.fe-card-m').val(),
      cardPasswordVal: $target.find('.fe-card-password').val()
    };
  },
  _commonValidationForCard: function ($target) {
    var vars = this._getVariables($target);

    return (this._validation.checkEmpty(vars.cardNumberVal, Tw.MSG_PAYMENT.AUTO_A05) &&
      this._validation.checkIsMore(vars.cardNumberVal, 15, Tw.MSG_PAYMENT.REALTIME_A06) &&
      this._validation.checkEmpty(vars.cardYVal, Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(vars.cardMVal, Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkLength(vars.cardYVal, 4, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkYear(vars.cardYVal, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkLength(vars.cardMVal, 2, Tw.MSG_PAYMENT.REALTIME_A04)) &&
      this._validation.checkMonth(vars.cardMVal, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkEmpty(vars.cardPasswordVal, Tw.MSG_PAYMENT.AUTO_A04) &&
      this._validation.checkLength(vars.cardPasswordVal, 2, Tw.MSG_PAYMENT.REALTIME_A07);
  },
  _makeRequestData: function (type) {
    var requestData = {};
    if (type === 'auto' || type === 'change') {
      requestData = this._makeRequestDataForAutoPrepay(type);
    } else {
      requestData = this._makeRequestDataForPrepay();
    }
    return requestData;
  },
  _makeRequestDataForPrepay: function (type) {
    var $newCardNumber = this.$newCardWrap.find('.fe-card-number');
    var $newCardY = this.$newCardWrap.find('.fe-card-y');
    var $newCardM = this.$newCardWrap.find('.fe-card-m');
    var $newCardPassword = this.$newCardWrap.find('.fe-card-password');
    var isAuto = 'N';
    if ($newCardNumber.attr('cardcode') === this._autoCardCode) {
      isAuto = 'Y';
    }

    return {
      tmthChrgPsblAmt: this.$possibleAmount,
      checkauto: isAuto,
      requestSum: $.trim(this.$inputPrepayAmount.val()),
      ccnoval: $.trim($newCardNumber.val()),
      ccexpyyval: $.trim($newCardY.val()) + $.trim($newCardM.val()),
      instmm: this.$cardTypeSelector.attr('id').toString(),
      ccpwdval: $.trim($newCardPassword.val()),
      cardcorp: $newCardNumber.attr('cardcode'),
      cardNm: $newCardNumber.attr('cardname')
    };
  },
  _isAutoPrepayValid: function ($target) {
    var inputAmount = this.$autoPrepaySelector.attr('id');
    var standardAmount = this.$autoStandardSelector.attr('id');

    return (this._validation.checkIsAvailablePoint(inputAmount, standardAmount, Tw.MSG_PAYMENT.PRE_A08) &&
      this._validation.checkEmpty($target.find('.fe-birth').val(), Tw.MSG_PAYMENT.PRE_A09) &&
      this._commonValidationForCard($target));
  },
  _makeRequestDataForAutoPrepay: function () {
    var $autoCardNumber = this.$autoCardWrap.find('.fe-card-number');
    var $autoCardY = this.$autoCardWrap.find('.fe-card-y');
    var $autoCardM = this.$autoCardWrap.find('.fe-card-m');
    var $autoCardPassword = this.$autoCardWrap.find('.fe-card-password');
    var $autoBirth = this.$autoCardWrap.find('.fe-birth');
    var isAuto = 'N';
    if ($autoCardNumber.attr('cardcode') === this._autoCardCode) {
      isAuto = 'Y';
    }

    return {
      checkauto: isAuto,
      autoChrgStrdAmt: this.$autoStandardSelector.attr('id'),
      autoChrgAmt: this.$autoPrepaySelector.attr('id'),
      cardBirth: $.trim($autoBirth.val()),
      cardNum: $.trim($autoCardNumber.val()),
      cardType: $autoCardNumber.attr('cardcode'),
      cardNm: $autoCardNumber.attr('cardname'),
      cardEffYM: $.trim($autoCardY.val()) + $.trim($autoCardM.val()),
      cardPwd: $.trim($autoCardPassword.val())
    };
  },
  _go: function (hash) {
    this._history.goHash(hash);
  },
  _getStandardAmountList: function () {
    if (Tw.FormatHelper.isEmpty(this._amountList)) {
      var strdAmt = this.$standardAmountAbbr;
      var firstAmt = 10000;
      for (var i = 1; i <= strdAmt; i++) {
        var obj = {
          'attr': 'id="' + i * firstAmt + '"',
          'text': i + Tw.CURRENCY_UNIT.TEN_THOUSAND
        };
        this._amountList.push(obj);
      }
    }
    return this._amountList;
  },
  _closePopup: function () {
    this._popupService.close();
  }
};