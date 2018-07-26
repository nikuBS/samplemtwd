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

    this._initVariables();
  },
  _initVariables: function () {
    this.$mainTitle = this.$container.find('.fe-main-title').text();
    this.$remainBtnWrap = this.$container.find('.fe-get-remain-btn-wrap');
    this.$remainInfo = this.$container.find('.fe-remain-info');
    this.$remainInfoWrap = this.$container.find('.fe-remain-info-wrap');
    this.$maxAmountWrap = this.$container.find('.fe-max-amount-wrap');
    this.$maxAmount = this.$container.find('.fe-max-amount');
    this.$getDetailBtn = this.$container.find('.fe-get-detail');
    this.$goPrepayBtn = this.$container.find('.fe-go-prepay');
    this.$autoPrepayInfo = this.$container.find('.fe-auto-prepay-info');
    this.$inputPrepayAmount = this.$container.find('.fe-input-prepay-amount');
    this.$newCardWrap = this.$container.find('.fe-new-card-wrap');
    this.$newCardOwner = this.$newCardWrap.find('.fe-card-owner');
    this.$newCardNumber = this.$newCardWrap.find('.fe-card-number');
    this.$newCardY = this.$newCardWrap.find('.fe-card-y');
    this.$newCardM = this.$newCardWrap.find('.fe-card-m');
    this.$newCardPassword = this.$newCardWrap.find('.fe-card-password');
    this.$cardTypeSelector = this.$newCardWrap.find('.fe-card-type-selector');
    this.$isAutoPrepay = 'N';
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.fe-only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('change', '.fe-change-type', $.proxy(this._changeType, this));
    this.$container.on('click', '.fe-get-remain-btn', $.proxy(this._getRemainLimit, this));
    this.$container.on('click', '.fe-change-limit', $.proxy(this._openChangeLimit, this));
    this.$container.on('click', '.fe-standard-amount-info', $.proxy(this._openStandardAmountInfo, this));
    this.$container.on('click', '.fe-get-detail', $.proxy(this._openDetailPrepay, this));
    this.$container.on('click', '.fe-go-prepay', $.proxy(this._goPrepay, this));
    this.$container.on('click', '.fe-cancel-auto-prepay', $.proxy(this._confirmCancel, this));
    this.$container.on('click', '.fe-prepay-check-box', $.proxy(this._setAutoInfo, this));
    this.$container.on('click', '.fe-prepay', $.proxy(this._prepay, this));
    this.$cardTypeSelector.on('click', $.proxy(this._selectCardType, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _changeType: function () {
    // change type field
  },
  _getRemainLimit: function () {
    this.$getDetailBtn.removeAttr('disabled').addClass('on');
    $.ajax('/mock/payment.remain-limit.json')
    //this._apiService.request(Tw.API_CMD.BFF_07_0073, {})
      .done($.proxy(this._getRemainLimitSuccess, this))
      .fail($.proxy(this._getRemainLimitFail, this));
  },
  _getRemainLimitSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$remainBtnWrap.hide();

      var $result = res.result;
      this._setRemainLimitInfo($result);

      if ($result.autoChrgStCd === Tw.AUTO_CHARGE_CODE.USE) {
        this._setAutoPrepayInfo($result);
      }

      this.$container.on('click', '.fe-change-limit', $.proxy(this._openChangeLimit, this));

      this.$remainInfoWrap.removeClass('none');
      this.$maxAmountWrap.removeClass('none');
    }
  },
  _getRemainLimitFail: function () {
    Tw.Logger.info('get remain limit fail');
  },
  _setRemainLimitInfo: function ($result) {
    this.$limitAmount = $result.microPayLimitAmt;
    this.$useAmount = $result.tmthUseAmt;
    this.$prepayAmount = $result.tmthChrgAmt;
    this.$possibleAmount = $result.tmthChrgPsblAmt;
    this.$remainAmount = $result.remainUseLimit;

    this.$remainInfo.text(Tw.FormatHelper.addComma(this.$remainAmount));
    this.$maxAmount.text(Tw.FormatHelper.addComma(this.$possibleAmount));

    if (this.$possibleAmount > 0) {
      this.$goPrepayBtn.find('button').removeAttr('disabled');
      this.$goPrepayBtn.removeClass('bt-gray1').addClass('bt-blue1');
      this._setCardTypeDisabled(this.$possibleAmount);
    }
  },
  _getRemainAmount: function () {
    var limitAmount = parseInt(this.$limitAmount, 10);
    var useAmount = parseInt(this.$useAmount, 10);
    var prepayAmount = parseInt(this.$prepayAmount, 10);

    return limitAmount - useAmount + prepayAmount;
  },
  _setAutoPrepayInfo: function ($result) {
    this.$isAutoPrepay = 'Y';
    this.$container.find('.fe-auto-charge-amt').text($result.autoChrgAmt);
    this.$container.find('.fe-auto-charge-standard-amt').text($result.autoChrgStrdAmt);
    this.$container.find('.fe-auto-prepay-arrow').removeClass('none');
  },
  _openChangeLimit: function () {
    this._popupService.open('');
  },
  _openStandardAmountInfo: function () {
    this._popupService.open({
      hbs: 'PA_08_02_L02'
    }, $.proxy(this._closePopup, this));
  },
  _openDetailPrepay: function () {
    this._popupService.open({
      hbs: 'PA_08_L01'
    }, $.proxy(this._setDetailPrepay, this));
  },
  _setDetailPrepay: function ($layer) {
    $layer.find('.fe-detail-title').text(this.$mainTitle);
    $layer.find('.fe-remain-amount').text(Tw.FormatHelper.addComma(this.$remainAmount));
    $layer.find('.fe-limit-amount').text(Tw.FormatHelper.addComma(this.$limitAmount));
    $layer.find('.fe-use-amount').text(Tw.FormatHelper.addComma(this.$useAmount));
    $layer.find('.fe-prepay-amount').text(Tw.FormatHelper.addComma(this.$prepayAmount));
    $layer.find('.fe-possible-amount').text(Tw.FormatHelper.addComma(this.$possibleAmount));

    $layer.on('click', 'button', $.proxy(this._closePopup, this));
  },
  _goPrepay: function (event) {
    event.preventDefault();
    this._go('#step1');
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

    if ($target.hasClass('checked')) {
      this.$newCardNumber.attr({ 'type': 'text', 'disabled': 'disabled' });
      this.$newCardNumber.val(this.$autoPrepayInfo.text());
    } else {
      this.$newCardNumber.attr('type', 'number');
      this.$newCardNumber.val('').removeAttr('disabled');
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
    this._popupService.openChoice(Tw.MSG_PAYMENT.SELECT_CARD_TYPE, this._getTypeList(), 'type2', $.proxy(this._selectPopupCallback, this, $target));
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
  _prepay: function () {
    if (this._isPrepayValid()) {
      var reqData = this._makeRequestDataForPrepay();
      this._getCardInfo(reqData);
    }
  },
  _getCardInfo: function (reqData) {
    this._apiService.request(Tw.API_CMD.BFF_07_0068, {}, {}, $.trim(this.$newCardNumber.val()).substr(0,6))
      .done($.proxy(this._getCardSuccess, this, reqData))
      .fail($.proxy(this._getCardFail, this, reqData));
  },
  _getCardSuccess: function (reqData, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      reqData.cardcorp = res.result.isueCardCd;
      reqData.cardNm = res.result.isueCardName;

      this._apiService.request(Tw.API_CMD.BFF_07_0074, reqData)
        .done($.proxy(this._prepaySuccess, this))
        .fail($.proxy(this._prepayFail, this));
    } else {
      this._getCardFail();
    }
  },
  _getCardFail: function () {
    this._popupService.openAlert(Tw.MSG_PAYMENT.ERROR_GET_CARD);
  },
  _prepaySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._history.setHistory();
      this._go('#complete-prepay');
    } else {
      this._prepayFail(res);
    }
  },
  _prepayFail: function (err) {
    this._history.setHistory();
    this.$container.find('.fe-error-code').text(err.error.code);
    this.$container.find('.fe-error-message').text(err.error.message);
    this._go('#error');
  },
  _isPrepayValid: function () {
    return (this._validation.checkEmpty(this.$inputPrepayAmount.val(), Tw.MSG_PAYMENT.PRE_A01) &&
      this._validation.checkIsAvailablePoint(this.$inputPrepayAmount.val(), this.$possibleAmount, Tw.MSG_PAYMENT.PRE_A08) &&
      this._validation.checkIsMore(this.$inputPrepayAmount.val(), 9999, Tw.MSG_PAYMENT.PRE_A11) &&
      this._validation.checkMultiple(this.$inputPrepayAmount.val(), 10000, Tw.MSG_PAYMENT.PRE_A11) &&
      this._validation.checkEmpty(this.$newCardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
      this._validation.checkIsMore(this.$newCardNumber.val(), 15, Tw.MSG_PAYMENT.REALTIME_A06) &&
      this._validation.checkEmpty(this.$newCardY.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$newCardM.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkLength(this.$newCardY.val(), 4, Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkYear(this.$newCardY.val(), Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkLength(this.$newCardM.val(), 2, Tw.MSG_PAYMENT.REALTIME_A04)) &&
      this._validation.checkMonth(this.$newCardM.val(), Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkEmpty(this.$newCardPassword.val(), Tw.MSG_PAYMENT.AUTO_A04) &&
      this._validation.checkLength(this.$newCardPassword.val(), 2, Tw.MSG_PAYMENT.REALTIME_A07);
  },
  _makeRequestDataForPrepay: function () {
    return {
      tmthChrgPsblAmt: this.$possibleAmount,
      checkauto: this.$isAutoPrepay,
      requestSum: $.trim(this.$inputPrepayAmount.val()),
      ccnoval: $.trim(this.$newCardNumber.val()),
      ccexpyyval: $.trim(this.$newCardY.val()) + $.trim(this.$newCardM.val()),
      instmm: this.$cardTypeSelector.attr('id').toString(),
      ccpwdval: $.trim(this.$newCardPassword.val())
    };
  },
  _go: function (hash) {
    window.location.hash = hash;
  },
  _getTypeList: function () {
    return [
      { 'attr': 'id="00"', text: Tw.PAYMENT_TYPE['000'] },
      { 'attr': 'id="01"', text: Tw.PAYMENT_TYPE['001'] },
      { 'attr': 'id="02"', text: Tw.PAYMENT_TYPE['002'] },
      { 'attr': 'id="03"', text: Tw.PAYMENT_TYPE['003'] },
      { 'attr': 'id="04"', text: Tw.PAYMENT_TYPE['004'] },
      { 'attr': 'id="05"', text: Tw.PAYMENT_TYPE['005'] },
      { 'attr': 'id="06"', text: Tw.PAYMENT_TYPE['006'] },
      { 'attr': 'id="07"', text: Tw.PAYMENT_TYPE['007'] },
      { 'attr': 'id="08"', text: Tw.PAYMENT_TYPE['008'] },
      { 'attr': 'id="09"', text: Tw.PAYMENT_TYPE['009'] },
      { 'attr': 'id="10"', text: Tw.PAYMENT_TYPE['010'] },
      { 'attr': 'id="11"', text: Tw.PAYMENT_TYPE['011'] },
      { 'attr': 'id="12"', text: Tw.PAYMENT_TYPE['012'] },
      { 'attr': 'id="24"', text: Tw.PAYMENT_TYPE['024'] }
    ];
  },
  _closePopup: function () {
    this._popupService.close();
  }
};