/**
 * FileName: myt-fare.bill.account.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFareBillAccount = function (rootEl) {
  this.$container = rootEl;

  this._paymentCommon = new Tw.MyTFareBillCommon(this.$container);
  this._bankList = new Tw.MyTFareBillBankList(this.$container);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBillAccount.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
    this._checkIsAuto();
    this._checkIsPopup();
  },
  _initVariables: function () {
    this.$selectBank = this.$container.find('.fe-select-bank');
    this.$refundBank = this.$container.find('.fe-select-refund-bank');
    this.$accountNumber = this.$container.find('.fe-account-number');
    this.$refundNumber = this.$container.find('.fe-refund-account-number');
    this.$refundBox = this.$container.find('.fe-refund-box');
    this.$accountInputBox = this.$container.find('.fe-account-input');
    this.$refundInputBox = this.$container.find('.fe-refund-input');
    this.$payBtn = this.$container.find('.fe-check-pay');
    this.$isValid = true;
    this.$isSelectValid = true;
    this.$isChanged = false;

    this._bankAutoYn = 'N';
    this._refundAutoYn = 'N';
    this._isPaySuccess = false;
  },
  _bindEvent: function () {
    this.$container.on('change', '.fe-auto-info > li', $.proxy(this._onChangeOption, this));
    this.$container.on('change', '.fe-auto-info', $.proxy(this._checkIsAbled, this));
    this.$container.on('change', '.fe-refund-check-btn input', $.proxy(this._showAndHideAccount, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('blur', '.required-input-field', $.proxy(this._checkAccountNumber, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
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
  _onChangeOption: function (event) {
    var $target = $(event.currentTarget);
    var $bankTarget = null;
    var $numberTarget = null;
    var $isAccountInfo = $target.parent().hasClass('fe-account-info');

    if ($isAccountInfo) {
      $bankTarget = this.$selectBank;
      $numberTarget = this.$accountNumber;
    } else {
      $bankTarget = this.$refundBank;
      $numberTarget = this.$refundNumber;
    }

    if ($target.hasClass('fe-manual-input')) {
      $target.addClass('checked');
      $bankTarget.removeAttr('disabled');
      $numberTarget.removeAttr('disabled');
    } else {
      $target.siblings().removeClass('checked');
      $bankTarget.attr('disabled', 'disabled');
      $numberTarget.attr('disabled', 'disabled');
      $numberTarget.siblings('.fe-error-msg').hide();
      $numberTarget.parents('.fe-bank-wrap').find('.fe-bank-error-msg').hide();
    }
    this.$isChanged = true;
  },
  _showAndHideAccount: function (event) {
    var $target = $(event.currentTarget);
    var $parentTarget = $target.parents('.fe-refund-check-btn');

    if ($target.is(':checked')) {
      $parentTarget.addClass('on');
    } else {
      $parentTarget.removeClass('on');
    }
    this.$isChanged = true;
  },
  _selectBank: function (event) {
    var $target = $(event.currentTarget);
    this._bankList.init(event, $.proxy(this._checkBank, this, $target));
  },
  _checkBank: function ($target) {
    if (!Tw.FormatHelper.isEmpty($target.attr('id'))) {
      this.$isChanged = true;
    }
    this._checkIsAbled();
  },
  _checkIsAbled: function () {
    if (this._checkIsAbledWithInputVisibility()) {
      this.$payBtn.removeAttr('disabled');
    } else {
      this.$payBtn.attr('disabled', 'disabled');
    }
  },
  _checkIsAbledWithInputVisibility: function () {
    var isAbled = true;

    if (this.$accountInputBox.hasClass('checked')) {
      if (this.$selectBank.attr('id') === undefined || this.$accountNumber.val() === '') {
        this.$isSelectValid = false;
        isAbled = false;
      } else {
        this.$isSelectValid = true;
      }
    }

    if (this.$refundInputBox.hasClass('checked')) {
      if (this.$refundBank.attr('id') === undefined || this.$refundNumber.val() === '') {
        this.$isSelectValid = false;
        isAbled = false;
      } else {
        this.$isSelectValid = true;
      }
    }
    return isAbled;
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  _checkAccountNumber: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkEmpty($target.val()));
  },
  _onClose: function () {
    if (!this.$isChanged) {
      if (this.$accountNumber.attr('disabled') !== 'disabled') {
        if (this.$accountNumber.val() !== '') {
          this.$isChanged = true;
        }
      }

      if (this.$refundNumber.attr('disabled') !== 'disabled') {
        if (this.$refundNumber.val() !== '') {
          this.$isChanged = true;
        }
      }
    }

    if (this.$isChanged) {
      this._popupService.openConfirmButton(null, Tw.ALERT_MSG_CUSTOMER.ALERT_PRAISE_CANCEL.TITLE,
        $.proxy(this._closePop, this), $.proxy(this._afterClose, this));
    } else {
      this._historyService.goBack();
    }
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.closeAll();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.goBack();
    }
  },
  _checkPay: function () {
    if (this.$isValid && this.$isSelectValid) {
      this._popupService.open({
          'hbs': 'MF_01_01_01',
          'title': Tw.MYT_FARE_PAYMENT_NAME.ACCOUNT,
          'unit': Tw.CURRENCY_UNIT.WON
        },
        $.proxy(this._openCheckPay, this),
        $.proxy(this._afterPaySuccess, this),
        'check-pay'
      );
    }
  },
  _openCheckPay: function ($layer) {
    this._setData($layer);
    this._paymentCommon.getListData($layer);

    $layer.on('click', '.fe-popup-close', $.proxy(this._checkClose, this));
    $layer.on('click', '.fe-pay', $.proxy(this._pay, this));
  },
  _setData: function ($layer) {
    var data = this._getData();

    $layer.find('.fe-payment-option-name').attr('id', data.bankCd).text(data.bankNm);
    $layer.find('.fe-payment-option-number').attr('id', data.accountNum)
      .text(Tw.StringHelper.masking(data.accountNum, '*', 8));
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this._paymentCommon.getAmount().toString()));
    $layer.find('.fe-payment-refund').attr('id', data.refundCd).attr('data-num', data.refundNum)
      .text(data.refundNm + ' ' + Tw.StringHelper.masking(data.refundNum, '*', 8));
  },
  _getData: function () {
    var isAccountInput = this.$accountInputBox.hasClass('checked');
    var isRefundInput = this.$refundInputBox.hasClass('checked');

    var data = {};
    if (isAccountInput) {
      data.bankCd = this.$selectBank.attr('id');
      data.bankNm = this.$selectBank.text();
      data.accountNum = this.$accountNumber.val();
      this._bankAutoYn = 'N';
    } else {
      data.bankCd = this.$container.find('.fe-auto-account-bank').attr('data-code');
      data.bankNm = this.$container.find('.fe-auto-account-bank').attr('data-name');
      data.accountNum = this.$container.find('.fe-auto-account-number').text();
      this._bankAutoYn  = 'Y';
    }

    if (isRefundInput) {
      data.refundCd = this.$refundBank.attr('id');
      data.refundNm = this.$refundBank.text();
      data.refundNum = this.$refundNumber.val();
      this._refundAutoYn = 'N';
    } else {
      data.refundCd = this.$container.find('.fe-auto-refund-bank').attr('data-code');
      data.refundNm = this.$container.find('.fe-auto-refund-bank').attr('data-name');
      data.refundNum = this.$container.find('.fe-auto-refund-number').text();
      this._refundAutoYn = 'Y';
    }
    return data;
  },
  _afterPaySuccess: function () {
    if (this._isPaySuccess) {
      this._historyService.replaceURL('/myt-fare/bill/pay-complete');
    }
  },
  _checkClose: function () {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.TITLE,
      $.proxy(this._closePop, this), $.proxy(this._afterClose, this), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.BUTTON);
  },
  _pay: function () {
    var reqData = this._makeRequestData();
    this._apiService.request(Tw.API_CMD.BFF_07_0023, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _makeRequestData: function () {
    var reqData = {
      payOvrAutoYn: this._refundAutoYn,
      payOvrBankCd: this.$container.find('.fe-payment-refund').attr('id'),
      payOvrBankNum: this.$container.find('.fe-payment-refund').attr('data-num'),
      payOvrCustNm: $.trim(this.$container.find('.fe-name').text()),
      bankAutoYn: this._bankAutoYn,
      bankOrCardCode: this.$container.find('.fe-payment-option-name').attr('id'),
      bankOrCardName: $.trim(this.$container.find('.fe-payment-option-name').text()),
      bankOrCardAccn: this.$container.find('.fe-payment-option-number').attr('id'),
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