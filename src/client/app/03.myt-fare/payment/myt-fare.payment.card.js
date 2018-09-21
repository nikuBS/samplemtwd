/**
 * FileName: myt-fare.payment.card.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFarePaymentCard = function (rootEl) {
  this.$container = rootEl;

  this._paymentCommon = new Tw.MyTFarePaymentCommon(this.$container);
  this._bankList = new Tw.MyTFarePaymentBankList(this.$container);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePaymentCard.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },
  _initVariables: function () {
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardTypeSelector = this.$container.find('.fe-select-card-type');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$refundBank = this.$container.find('.fe-select-refund-bank');
    this.$refundNumber = this.$container.find('.fe-refund-account-number');
    this.$refundBox = this.$container.find('.check-account-radio');
  },
  _bindEvent: function () {
    this.$container.on('change', '.refund-account-check-btn', $.proxy(this._showAndHideAccount, this));
    this.$container.on('click', '.fe-select-card-type', $.proxy(this._selectCardType, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.fe-check-pay', $.proxy(this._checkPay, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._pay, this));
  },
  _showAndHideAccount: function (event) {
    var $target = $(event.currentTarget);
    if ($target.hasClass('checked')) {
      this.$refundBox.show();
    } else {
      this.$refundBox.hide();
    }
  },
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      hbs:'actionsheet_select_a_type',
      layer:true,
      title:Tw.POPUP_TITLE.SELECT_CARD_TYPE,
      data:Tw.PAYMENT_CARD_TYPE_LIST
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
  _selectBank: function (event) {
    this._bankList.init(event);
  },
  _checkPay: function () {
    if (this._isValid()) {
      this._getCardCode();
    }
  },
  _isValid: function () {
    return (this._validation.checkEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
      this._validation.checkEmpty(this.$cardY.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardM.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardPw.val(), Tw.MSG_PAYMENT.AUTO_A04) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkIsSelected(this.$refundBank, Tw.MSG_PAYMENT.REALTIME_A02) &&
      this._validation.checkEmpty(this.$refundNumber.val(), Tw.MSG_PAYMENT.AUTO_A03));
  },
  _setData: function (cardCode, cardName) {
    this.$container.find('.fe-payment-option-name').attr('id', cardCode).text(cardName);
    this.$container.find('.fe-payment-option-number').text(this.$cardNumber.val());
    this.$container.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this._paymentCommon.getAmount().toString()));
    this.$container.find('.fe-payment-refund').attr('id', this.$refundBank.attr('id'))
      .text(this.$refundBank.text() + ' ' + this.$refundNumber.val());
  },
  _pay: function () {
    var reqData = this._makeRequestData();
    console.log(reqData);
    this._apiService.request(Tw.API_CMD.BFF_07_0025, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _makeRequestData: function () {
    var reqData = {
      payovrBankCd: this.$container.find('.fe-payment-refund').attr('id'),
      payovrBankNum: $.trim(this.$refundNumber.val()),
      payovrCustNm: $.trim(this.$container.find('.fe-name').val()),
      bankOrCardCode: this.$container.find('.fe-payment-option-name').attr('id'),
      bankOrCardAccn: $.trim(this.$cardNumber.val()),
      cdexpy: $.trim(this.$cardY.val()),
      cdexpm: $.trim(this.$cardM.val()),
      instmm: this.$cardTypeSelector.attr('id').toString(),
      unpaidBillList: this._paymentCommon.getBillList()
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
  }
};