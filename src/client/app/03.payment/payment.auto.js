/**
 * FileName: payment.auto.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.05
 */

Tw.PaymentAuto = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);
  this.$document = $(document);

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
    this.$dataSet = this.$container.find('#data-set');
    this.$bankSelector = this.$container.find('.select-bank');
    this.$accountNumber = this.$container.find('.account-number');
    this.$cardNumber = this.$container.find('.card-number');
    this.$cardY = this.$container.find('.card-y');
    this.$cardM = this.$container.find('.card-m');
    this.$accountPhoneNumber = this.$container.find('.account-phone-number');
    this.$cardPhoneNumber = this.$container.find('.card-phone-number');
    this.$cardDate = this.$container.find('.card-date');
    this.$apiName = Tw.API_CMD.BFF_07_0062;
  },
  _bindEvent: function () {
    this.$container.on('click', '.go-change', $.proxy(this._goInput, this));
    this.$container.on('click', '.radiobox', $.proxy(this._changeField, this));
    this.$container.on('click', '.change-date', $.proxy(this._openChangeDate, this));
    this.$container.on('keyup', '.only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.change', $.proxy(this._change, this));
    this.$container.on('click', '.cancel', $.proxy(this._cancel, this));
  },
  _goInput: function (event) {
    event.preventDefault();
    if ($(event.currentTarget).hasClass('new')) {
      this.$apiName = Tw.API_CMD.BFF_07_0061;
    }
    this.$container.find('.first-radio-box').addClass('checked');
    this._go('#step1-change');
  },
  _changeField: function (event) {
    var $target = $(event.currentTarget);
    if ($target.hasClass('first-radio-box')) {
      this.$container.find('.account').show();
      this.$container.find('.card').hide();
    } else {
      this.$container.find('.card').show();
      this.$container.find('.account').hide();
    }
  },
  _openChangeDate: function () {
    this._popupService.open({
      hbs:'PA_03_02_L01'
    }, $.proxy(this._setChangeDateEvent, this));
  },
  _setChangeDateEvent: function ($layer) {
    $layer.on('click', 'button', $.proxy(this._changeDate, this, $layer));
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
    if (!$target.hasClass('first')) {
      if ($target.hasClass('last')) {
        value = Tw.PAYMENT_DATE_VALUE.TWENTY_THREE;
      } else {
        value = Tw.PAYMENT_DATE_VALUE.TWENTY_ONE;
      }
    }
    return value;
  },
  _changeDateRequest: function (value) {
    this._apiService.request(Tw.API_CMD.BFF_07_0065, {}, {}, value)
      .done($.proxy(this._changeDateSuccess, this))
      .fail($.proxy(this._changeDateFail, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
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
      this._validation.checkYear(this.$cardY.val(), Tw.MSG_PAYMENT.REALTIME_A05) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A05));
  },
  _selectBank: function (event) {
    this._bankList.init(event);
  },
  _change: function (event) {
    event.preventDefault();
    var code = this.$container.find('.radiobox.checked').data('code').toString();

    if (this._isValid(code)) {
      var reqData = this._makeAccountRequestData(code);
      if (code === Tw.PAYMENT_AUTO_CODE.BANK) {
        this._changeRequest(reqData);
      } else {
        this._getCardCode(reqData);
      }
    }
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
  _changeRequest: function (reqData) {
    this._apiService.request(this.$apiName, reqData)
      .done($.proxy(this._changeSuccess, this))
      .fail($.proxy(this._changeFail, this));
  },
  _makeAccountRequestData: function (code) {
    var reqData = {};
    reqData.payMthdCd = code;

    if (code === Tw.PAYMENT_AUTO_CODE.BANK) {
      reqData.bankCardNum = $.trim(this.$accountNumber.val());
      reqData.bankCardCoCd = $.trim(this.$bankSelector.attr('id'));
      reqData.cntcNum = $.trim(this.$accountPhoneNumber.val());
    } else {
      reqData.bankCardNum = $.trim(this.$cardNumber.val());
      reqData.cardEffYm = $.trim(this.$cardY.val())  + $.trim(this.$cardM.val());
      reqData.cntcNum = $.trim(this.$cardPhoneNumber.val());
      reqData.drwts = this.$cardDate.find('.checked').data('code');
    }

    this.$dataSet.find('span').each(function () {
      var $this = $(this);
      reqData[$this.attr('id')] = $this.text();
    });
    return reqData;
  },
  _cancel: function (event) {
    event.preventDefault();

    this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
      .done($.proxy(this._cancelSuccess, this))
      .fail($.proxy(this._cancelFail, this));
  },
  _changeDateSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.close();
      window.location.reload();
    }
  },
  _changeDateFail: function () {
    Tw.Logger.info('change request fail');
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
  _cancelSuccess: function () {
    this._history.setHistory();
    this._go('#complete-cancel');
  },
  _cancelFail: function () {
    Tw.Logger.info('cancel request fail');
  },
  _go: function (hash) {
    window.location.hash = hash;
  }
};