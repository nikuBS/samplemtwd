/**
 * FileName: myt-fare.bill.account.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 * Annotation: 계좌이체 즉시납부
 */

Tw.MyTFareBillAccount = function (rootEl) {
  this.$container = rootEl;

  this._paymentCommon = new Tw.MyTFareBillCommon(rootEl);
  this._bankList = new Tw.MyTFareBillBankList(rootEl);
  this._backAlert = new Tw.BackAlert(rootEl, true);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-check-pay'));
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-check-pay'));

  this._init();
};

Tw.MyTFareBillAccount.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
    this._checkIsAuto();
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

    this._bankAutoYn = 'N';
    this._refundAutoYn = 'N';
    this._isPaySuccess = false;
  },
  _bindEvent: function () {
    this.$container.on('change', '.fe-auto-info > li', $.proxy(this._onChangeOption, this));
    this.$container.on('change', '.fe-auto-info', $.proxy(this._checkIsAbled, this));
    this.$container.on('change', '.fe-refund-check-btn input[type="checkbox"]', $.proxy(this._showAndHideAccount, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
    this.$container.on('click', '.fe-check-pay', $.proxy(this._checkPay, this));
  },
  _checkIsAuto: function () {
    if (this.$container.find('.fe-auto-info').is(':visible')) {
      this.$payBtn.removeAttr('disabled');
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
      $numberTarget.parents('.fe-bank-wrap').find('.fe-error-msg').hide().attr('aria-hidden', 'true');
      $numberTarget.parents('.fe-bank-wrap').find('.fe-bank-error-msg').hide().attr('aria-hidden', 'true');
    }
  },
  _showAndHideAccount: function (event) {
    var $target = $(event.currentTarget);
    var $parentTarget = $target.parents('.fe-refund-check-btn');

    if ($target.is(':checked')) {
      $parentTarget.addClass('on');
    } else {
      $parentTarget.removeClass('on');
    }
  },
  _selectBank: function (event) {
    this._bankList.init(event, $.proxy(this._checkIsAbled, this));
  },
  _checkIsAbled: function () {
    if (this.$accountNumber.attr('disabled') === 'disabled' && this.$refundNumber.attr('disabled') === 'disabled') {
      this.$payBtn.removeAttr('disabled');
    } else {
      this._validationService.checkIsAbled();
    }
  },
  _onClose: function () {
    this._backAlert.onClose();
  },
  _checkPay: function (e) {
    if (this._validationService.isAllValid()) {
      this._popupService.open({
          'hbs': 'MF_01_01_01',
          'title': Tw.MYT_FARE_PAYMENT_NAME.ACCOUNT,
          'unit': Tw.CURRENCY_UNIT.WON
        },
        $.proxy(this._openCheckPay, this),
        $.proxy(this._afterPaySuccess, this),
        'check-pay',
        $(e.currentTarget)
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
      .text(data.accountNum);
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this._paymentCommon.getAmount().toString()));
    $layer.find('.fe-payment-refund').attr('id', data.refundCd).attr('data-num', data.refundNum)
      .text(data.refundNm + ' ' + data.refundNum);
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
    } else if (this._isPayFail) {
      Tw.Error(this._err.code, this._err.msg).pop();
    }
  },
  _checkClose: function (e) {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.TITLE,
      $.proxy(this._closePop, this), $.proxy(this._afterClose, this), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.BUTTON, $(e.currentTarget));
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.close();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.resetHistory(-2);
    }
  },
  _pay: function (e) {
    var $target = $(e.currentTarget);
    var reqData = this._makeRequestData();

    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_07_0023, reqData)
      .done($.proxy(this._paySuccess, this, $target))
      .fail($.proxy(this._payFail, this, $target));
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
  _paySuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.container');
      this._isPaySuccess = true;
      this._popupService.close();
    } else {
      this._payFail($target, res);
    }
  },
  _payFail: function ($target, err) {
    Tw.CommonHelper.endLoading('.container');
    this._isPayFail = true;
    this._err = {
      code: err.code,
      msg: err.msg
    };
    this._popupService.close();
  }
};