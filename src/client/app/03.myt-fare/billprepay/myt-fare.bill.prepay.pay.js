/**
 * FileName: myt-fare.bill.prepay.pay.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTFareBillPrepayPay = function (rootEl, title, amount, name) {
  this.$container = rootEl;
  this.$title = title;
  this._maxAmount = amount;
  this._name = name;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-check-pay'));
  this._historyService = new Tw.HistoryService(rootEl);
  this._backAlert = new Tw.BackAlert(rootEl);

  this._init();
};

Tw.MyTFareBillPrepayPay.prototype = {
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
    this.$isValid = false;
    this.$isCardValid = false;

    this._isPaySuccess = false;
  },
  _bindEvent: function () {
    this.$container.on('input', '.required-input-field', $.proxy(this._setMaxValue, this));
    this.$container.on('click', '.fe-select-card-type', $.proxy(this._selectCardType, this));
    this.$container.on('click', '.fe-check-pay', $.proxy(this._checkPay, this));
    this.$container.on('click', '.fe-popup-close', $.proxy(this._onClose, this));
  },
  _setMaxValue: function (event) {
    var $target = $(event.currentTarget);
    var maxLength = $target.attr('maxLength');
    if ($target.attr('maxLength')) {
      if ($target.val().length >= maxLength) {
        $target.val($target.val().slice(0, maxLength));
      }
    }
  },
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_CARD_TYPE_LIST,
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.parents('label').text());

    this._popupService.close();
  },
  _checkPay: function () {
    if (this._validationService.isAllValid()) {
      this._goCheck();
    }
  },
  _onClose: function () {
    this._backAlert.onClose();
  },
  _closePop: function () {
    this._popupService.closeAll();
  },
  _goCheck: function () {
    this._popupService.open({
      'hbs': 'MF_06_03_01'
    },
      $.proxy(this._setData, this),
      $.proxy(this._afterPaySuccess, this),
      'check-pay'
    );
  },
  _setData: function ($layer) {
    $layer.find('.fe-payment-option-name').attr('id', this.$cardNumber.attr('data-code')).text(this.$cardNumber.attr('data-name'));
    $layer.find('.fe-payment-option-number').text(this.$cardNumber.val());
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma($.trim(this.$prepayAmount.val().toString())));
    $layer.find('.fe-mbr-name').text(this._name);
    $layer.find('.fe-payment-type').text(this.$cardTypeSelector.text());

    $layer.on('click', '.fe-pay', $.proxy(this._pay, this, $layer));
    $layer.on('click', '.fe-close', $.proxy(this._close, this));
  },
  _afterPaySuccess: function () {
    if (this._isPaySuccess) {
      this._historyService.replaceURL('/myt-fare/bill/pay-complete?type=' + this.$title);
    }
  },
  _close: function () {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.TITLE,
      $.proxy(this._closePop, this), null, null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.BUTTON);
  },
  _pay: function ($layer) {
    var apiName = this._getApiName();
    var reqData = this._makeRequestData($layer);

    this._apiService.request(apiName, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _getApiName: function () {
    var apiName = '';
    if (this.$title === 'small') {
      apiName = Tw.API_CMD.BFF_07_0074;
    } else {
      apiName = Tw.API_CMD.BFF_07_0082;
    }
    return apiName;
  },
  _makeRequestData: function ($layer) {
    var reqData = {
      tmthChrgPsblAmt: this._maxAmount.toString(),
      checkAuto: 'N',
      requestSum: $.trim(this.$prepayAmount.val().toString()),
      cardNumVal: $layer.find('.fe-payment-option-number').text(),
      cardCorp: $layer.find('.fe-payment-option-name').attr('id'),
      cardNm: $layer.find('.fe-payment-option-name').text(),
      cardExpyyVal: $.trim(this.$cardY.val())+ $.trim(this.$cardM.val()),
      instMm: this.$cardTypeSelector.attr('id').toString(),
      cardPwdVal: $.trim(this.$cardPw.val().toString())
    };
    return reqData;
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._isPaySuccess = true;
      this._popupService.closeAll();
    } else {
      this._payFail(res);
    }
  },
  _payFail: function (err) {
    if (err.code === 'BIL0006') {
      this._popupService.openAlert(err.msg, Tw.POPUP_TITLE.NOTIFY);
    } else {
      Tw.Error(err.code, err.msg).pop();
    }
  }
};