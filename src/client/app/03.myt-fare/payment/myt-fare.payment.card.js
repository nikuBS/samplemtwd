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
    this._checkIsAuto();
    this._checkIsPopup();
  },
  _initVariables: function () {
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardTypeSelector = this.$container.find('.fe-select-card-type');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$refundBank = this.$container.find('.fe-select-refund-bank');
    this.$refundNumber = this.$container.find('.fe-refund-account-number');
    this.$refundBox = this.$container.find('.fe-refund-box');
    this.$refundInputBox = this.$container.find('.fe-refund-input');
    this.$payBtn = this.$container.find('.fe-check-pay');

    this._isPaySuccess = false;
    this._historyUrl = '/myt/fare/history/payment';
    this._mainUrl = '/myt/fare';
  },
  _bindEvent: function () {
    this.$container.on('change', '.fe-auto-info', $.proxy(this._checkIsAbled, this));
    this.$container.on('change', '.refund-account-check-btn', $.proxy(this._showAndHideAccount, this));
    this.$container.on('blur', '.fe-card-number', $.proxy(this._getCardCode, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('keyup', '.fe-card-number', $.proxy(this._resetCardInfo, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-refund-info', $.proxy(this._openRefundInfo, this));
    this.$container.on('click', '.fe-select-card-type', $.proxy(this._selectCardType, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.fe-check-pay', $.proxy(this._checkPay, this));
  },
  _checkIsAuto: function () {
    if (this.$container.find('.fe-auto-info').is(':visible')) {
      this.$payBtn.removeAttr('disabled');
    }
  },
  _checkIsPopup: function () {
    var isCheck = this._historyService.getHash().match('check');

    if (isCheck && this._historyService.isReload()) {
      this._historyService.replace();
      this._checkPay();
    }
  },
  _showAndHideAccount: function (event) {
    var $target = $(event.target);
    if ($target.is(':checked')) {
      this.$refundBox.show();
    } else {
      this.$refundBox.hide();
    }
  },
  _openRefundInfo: function () {
    this._popupService.openAlert(Tw.REFUND_ACCOUNT_INFO.CONTENTS, Tw.REFUND_ACCOUNT_INFO.TITLE, Tw.BUTTON_LABEL.CONFIRM);
  },
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_CARD_TYPE,
      data: Tw.POPUP_TPL.FARE_PAYMENT_CARD_TYPE_LIST
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
    this._bankList.init(event, $.proxy(this._checkIsAbled, this));
  },
  _checkIsAbled: function () {
    if (this._checkIsAbledWithInputVisibility() && this.$cardNumber.val() !== '' &&
      this.$cardY.val() !== '' && this.$cardM.val() !== '' && this.$cardPw.val() !== '') {
      this.$payBtn.removeAttr('disabled');
    } else {
      this.$payBtn.attr('disabled', 'disabled');
    }
  },
  _checkIsAbledWithInputVisibility: function () {
    var isAbled = true;

    if (this.$refundInputBox.hasClass('checked')) {
      if (this.$refundBank.attr('id') === undefined || this.$refundNumber.val() === '') {
        isAbled = false;
      }
    }
    return isAbled;
  },
  _resetCardInfo: function () {
    this.$cardNumber.removeAttr('data-code');
    this.$cardNumber.removeAttr('data-name');
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  _checkPay: function () {
    if (this._isValid()) {
      this._popupService.open({
          'hbs': 'MF_01_01_01',
          'title': Tw.MYT_FARE_PAYMENT_NAME.CARD,
          'unit': Tw.CURRENCY_UNIT.WON
        },
        $.proxy(this._openCheckPay, this),
        $.proxy(this._afterPaySuccess, this),
        'check'
      );
    }
  },
  _getCardCode: function () {
    if (this.$cardNumber.val() !== '') {
      this._apiService.request(Tw.API_CMD.BFF_07_0024, { cardNum: $.trim(this.$cardNumber.val()).substr(0, 6) })
        .done($.proxy(this._getSuccess, this))
        .fail($.proxy(this._getFail, this));
    }
  },
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var cardCode = res.result.prchsCardCd;
      var cardName = res.result.prchsCardName;

      this.$cardNumber.attr({ 'data-code': cardCode, 'data-name': cardName });

      if (Tw.FormatHelper.isEmpty(cardCode)) {
        this._getFail();
      }
    } else {
      this._getFail();
    }
  },
  _getFail: function () {
    this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4);
  },
  _openCheckPay: function ($layer) {
    this._setData($layer);
    this._paymentCommon.getListData($layer);

    $layer.on('click', '.fe-pay', $.proxy(this._pay, this));
  },
  _setData: function ($layer) {
    var data = this._getData();

    $layer.find('.fe-payment-option-name').attr('id', this.$cardNumber.attr('data-code')).text(this.$cardNumber.attr('data-name'));
    $layer.find('.fe-payment-option-number').attr('id', data.cardNum).text(Tw.StringHelper.masking(data.cardNum, '*', 8));
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this._paymentCommon.getAmount().toString()));
    $layer.find('.fe-payment-refund').attr('id', data.refundCd).attr('data-num', data.refundNum)
      .text(data.refundNm + ' ' + Tw.StringHelper.masking(data.refundNum, '*', 8));
  },
  _getData: function () {
    var isRefundAuto = this.$refundInputBox.hasClass('checked');

    var data = {};
    data.cardNum = $.trim(this.$cardNumber.val());

    if (isRefundAuto) {
      data.refundCd = this.$refundBank.attr('id');
      data.refundNm = this.$refundBank.text();
      data.refundNum = this.$refundNumber.val();
    } else {
      data.refundCd = this.$container.find('.fe-auto-refund-bank').attr('data-code');
      data.refundNm = this.$container.find('.fe-auto-refund-bank').text();
      data.refundNum = this.$container.find('.fe-auto-refund-number').text();
    }
    return data;
  },
  _afterPaySuccess: function () {
    if (this._isPaySuccess) {
      this._paymentCommon.afterPaySuccess(this._historyUrl, this._mainUrl,
        Tw.MYT_FARE_PAYMENT_NAME.GO_PAYMENT_HISTORY, Tw.MYT_FARE_PAYMENT_NAME.PAYMENT);
    }
  },
  _isValid: function () {
    var isValid = this._validation.checkMoreLength(this.$cardNumber.val(), 15, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4) &&
      this._validation.checkEmpty(this.$cardNumber.attr('data-code'), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4) &&
      this._validation.checkLength(this.$cardY.val(), 4, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkLength(this.$cardM.val(), 2, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6) &&
      this._validation.checkLength(this.$cardPw.val(), 2, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V7);

    if (isValid) {
      if (this.$refundInputBox.hasClass('checked')) {
        isValid = this._validation.checkIsSelected(this.$refundBank, Tw.MSG_PAYMENT.REALTIME_A02) &&
          this._validation.checkEmpty(this.$refundNumber.val(), Tw.MSG_PAYMENT.AUTO_A03);
      }
    }
    return isValid;
  },
  _pay: function () {
    var reqData = this._makeRequestData();
    this._apiService.request(Tw.API_CMD.BFF_07_0025, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _makeRequestData: function () {
    var reqData = {
      payovrBankCd: this.$container.find('.fe-payment-refund').attr('id'),
      payovrBankNum: this.$container.find('.fe-payment-refund').attr('data-num'),
      payovrCustNm: this.$container.find('.fe-name').val(),
      bankOrCardCode: this.$container.find('.fe-payment-option-name').attr('id'),
      bankOrCardAccn: this.$container.find('.fe-payment-option-number').attr('id'),
      cdexpy: $.trim(this.$cardY.val()),
      cdexpm: $.trim(this.$cardM.val()),
      instmm: this.$cardTypeSelector.attr('id').toString(),
      unpaidBillList: this._paymentCommon.getBillList()
    };
    return reqData;
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._isPaySuccess = true;
      this._popupService.close();
    } else {
      this._payFail(res);
    }
  },
  _payFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};