/**
 * FileName: payment.auto.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.05
 */

Tw.PaymentAuto = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._bankList = new Tw.BankList(this.$container);
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._initVariables();
  this._bindEvent();
};

Tw.PaymentAuto.prototype = {
  _initVariables: function () {
    this.$dataSet = this.$container.find('#fe-data-set');
    this.$bankSelector = this.$container.find('.select-bank');
    this.$accountNumber = this.$container.find('.fe-account-number');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$accountPhoneNumber = this.$container.find('.fe-account-phone-number');
    this.$cardPhoneNumber = this.$container.find('.fe-card-phone-number');
    this.$cardDate = this.$container.find('.fe-card-date');
    this.$apiName = Tw.API_CMD.BFF_07_0062;
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-go-change', $.proxy(this._goInput, this));
    this.$container.on('click', '.fe-go-cancel', $.proxy(this._goCancel, this));
    this.$container.on('click', '.fe-change-radiobox', $.proxy(this._changeField, this));
    this.$container.on('click', '.fe-change-date', $.proxy(this._openChangeDate, this));
    this.$container.on('keyup', '.fe-only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.fe-change', $.proxy(this._change, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._cancel, this));
    this.$container.on('click', '.fe-sms-get-confirm', $.proxy(this._showAlert, this));
  },
  _goInput: function (event) {
    event.preventDefault();
    if ($(event.currentTarget).hasClass('fe-new')) {
      this.$apiName = Tw.API_CMD.BFF_07_0061;
    }
    this._setDefaultRadioChecked('fe-change-first-radio-box');
    this._go('#step1-change');
  },
  _goCancel: function (event) {
    event.preventDefault();
    this._setDefaultRadioChecked('fe-cancel-first-radio-box');
    this._go('#step1-cancel');
  },
  _setDefaultRadioChecked: function (targetClassName) {
    this.$container.find('.radiobox').removeClass('checked focus');
    this.$container.find('.radiobox input').removeAttr('checked');
    this.$container.find('.' + targetClassName).addClass('checked');
    this.$container.find('.' + targetClassName + ' > input').attr('checked', 'checked');
    if (targetClassName === 'fe-change-first-radio-box') {
      this.$container.find('.fe-account').show();
      this.$container.find('.fe-card').hide();
    }
  },
  _changeField: function (event) {
    var $target = $(event.currentTarget);
    if ($target.hasClass('fe-change-first-radio-box')) {
      this.$container.find('.fe-account').show();
      this.$container.find('.fe-card').hide();
    } else {
      this.$container.find('.fe-card').show();
      this.$container.find('.fe-account').hide();
    }
  },
  _openChangeDate: function () {
    this._popupService.open({
      hbs:'PA_03_02_L01'
    }, $.proxy(this._setChangeDateEvent, this));
  },
  _setChangeDateEvent: function ($layer) {
    $layer.on('click', '.contents-btn button', $.proxy(this._changeDate, this, $layer));
  },
  _changeDate: function ($layer, event) {
    var $target = $(event.currentTarget);
    if ($target.text() === Tw.BUTTON_LABEL.CANCEL) {
      this._popupService.close();
    } else {
      var $checkedTarget = $layer.find('.checked');
      var $dateValue = this._getDateValue($checkedTarget);
      this._changeDateRequest($dateValue);
    }
  },
  _getDateValue: function ($target) {
    var value =Tw.PAYMENT_DATE_VALUE.FIFTEEN;
    if (!$target.hasClass('top-left')) {
      if ($target.hasClass('top-right')) {
        value = Tw.PAYMENT_DATE_VALUE.TWENTY_THREE;
      } else {
        value = Tw.PAYMENT_DATE_VALUE.TWENTY_ONE;
      }
    }
    return value;
  },
  _changeDateRequest: function (value) {
    this._apiService.request(Tw.API_CMD.BFF_07_0065, {}, {}, '?payCyclCd=' + value)
      .done($.proxy(this._changeDateSuccess, this))
      .fail($.proxy(this._changeDateFail, this));
    this._popupService.close();
  },
  _changeDateSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.AUTO_A12, null, $.proxy(this._reload, this));
    } else {
      this._changeDateFail(res);
    }
  },
  _changeDateFail: function (err) {
    this._popupService.close();
    this._popupService.openAlert(err.error.msg);
  },
  _reload: function () {
    this._popupService.close();
    this._history.reload();
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _selectBank: function (event) {
    this._bankList.init(event);
  },
  _change: function (event) {
    event.preventDefault();
    var code = this.$container.find('.fe-change-radiobox.checked').data('code').toString();

    if (this._isValid(code)) {
      var reqData = this._makeAccountRequestData(code);
      if (code === Tw.PAYMENT_AUTO_CODE.BANK) {
        this._changeRequest(reqData);
      } else {
        this._getCardCode(reqData);
      }
    }
  },
  _isValid: function (code) {
    if (code === Tw.PAYMENT_AUTO_CODE.BANK) {
      return this._isValidForBank();
    } else {
      return this._isValidForCard();
    }
  },
  _isValidForBank: function () {
    return (this._validation.checkIsSelected(this.$bankSelector, Tw.MSG_PAYMENT.REALTIME_A02) &&
      this._validation.checkEmpty(this.$accountNumber.val(), Tw.MSG_PAYMENT.AUTO_A06) &&
      this._validation.checkEmpty(this.$accountPhoneNumber.val(), Tw.MSG_PAYMENT.AUTO_A07));
  },
  _isValidForCard: function () {
    return (this._validation.checkEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A06) &&
      this._validation.checkEmpty(this.$cardY.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardM.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardPhoneNumber.val(), Tw.MSG_PAYMENT.AUTO_A07) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A04));
  },
  _makeAccountRequestData: function (code) {
    var reqData = this._makeDefaultRequestData();
    reqData.payMthdCd = code;

    if (code === Tw.PAYMENT_AUTO_CODE.BANK) {
      reqData.bankCardNum = $.trim(this.$accountNumber.val());
      reqData.bankCardCoCd = $.trim(this.$bankSelector.attr('id'));
      reqData.cntcNum = $.trim(this.$accountPhoneNumber.val());
    } else {
      reqData.bankCardNum = $.trim(this.$cardNumber.val());
      reqData.cardEffYm = $.trim(this.$cardY.val())  + $.trim(this.$cardM.val());
      reqData.cntcNum = $.trim(this.$cardPhoneNumber.val());
      reqData.drwts = this.$cardDate.find('.checked').data('code').toString();
    }
    return reqData;
  },
  _makeDefaultRequestData: function () {
    var reqData = {};
    this.$dataSet.find('span').each(function () {
      var $this = $(this);
      reqData[$this.attr('id')] = $this.text();
    });
    return reqData;
  },
  _changeRequest: function (reqData) {
    this._apiService.request(this.$apiName, reqData)
      .done($.proxy(this._changeSuccess, this))
      .fail($.proxy(this._changeFail, this));
  },
  _changeSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._history.setHistory();
      this._go('#complete-change');
    } else {
      this._go('#error');
    }
  },
  _changeFail: function () {
    Tw.Logger.info('change request fail');
  },
  _getCardCode: function (reqData) {
    this._apiService.request(Tw.API_CMD.BFF_07_0068, {}, {}, $.trim(this.$cardNumber.val()).substr(0,6))
      .done($.proxy(this._getSuccess, this, reqData))
      .fail($.proxy(this._getFail, this));
  },
  _getSuccess: function (reqData, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      reqData.bankCardCoCd = res.result.isueCardCd;
      this._changeRequest(reqData);
    } else {
      this._popupService.openAlert(Tw.MSG_COMMON.SERVER_ERROR);
    }
  },
  _getFail: function () {
    Tw.Logger.info('get card fail');
  },
  _cancel: function (event) {
    event.preventDefault();
    this._popupService.openAlert(Tw.MSG_PAYMENT.AUTO_A08, null, $.proxy(this._cancelRequest, this));
  },
  _cancelRequest: function () {
    this._popupService.close();

    var reqData = this._makeDefaultRequestData();
    reqData.payMthdCd = this.$container.find('.fe-cancel-radiobox.checked').data('code').toString();

    this._apiService.request(Tw.API_CMD.BFF_07_0063, reqData)
      .done($.proxy(this._cancelSuccess, this))
      .fail($.proxy(this._cancelFail, this));
  },
  _cancelSuccess: function () {
    this._history.setHistory();
    this._setDefaultRadioChecked('fe-sms-first-radio-box');
    this._go('#complete-cancel');
  },
  _cancelFail: function () {
    Tw.Logger.info('cancel request fail');
  },
  _showAlert: function () {
    var $bankSelector = this.$container.find('.fe-auto-cancel-select-bank');
    if (this._validation.checkIsSelected($bankSelector, Tw.MSG_PAYMENT.REALTIME_A02)) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.AUTO_A09);
    }
  },
  _go: function (hash) {
    this._history.goHash(hash);
  }
};