/**
 * FileName: myt-fare.payment.cashbag.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.7
 */

Tw.MyTFarePaymentCashbag = function (rootEl, pointType) {
  this.$container = rootEl;
  this.$pointType = pointType;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePaymentCashbag.prototype = {
  _init: function () {
    this._initVariables('tab1');
    this._bindEvent();
  },
  _initVariables: function ($targetId) {
    this.$standardPoint = this.$container.find('.fe-standard-point');
    this.$autoInfo = this.$container.find('.fe-auto-info');
    this.$selectedTab = this.$container.find('#' + $targetId + '-tab');
    this.$pointCardNumber = this.$selectedTab.find('.fe-point-card');
    this.$pointSelector = this.$selectedTab.find('.fe-select-point');
    this.$point = this.$selectedTab.find('.fe-point');
    this.$pointPw = this.$selectedTab.find('.fe-point-pw');
    this.$agree = this.$container.find('.fe-agree');
    this.$payBtn = this.$container.find('.fe-' + $targetId + '-pay');

    this.$payBtn.show();
    this.$payBtn.siblings().hide();
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-tab-selector > li', $.proxy(this._changeTab, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('change', '.fe-agree', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-select-point', $.proxy(this._selectPoint, this));
    this.$container.on('click', '.fe-find-password', $.proxy(this._goCashbagSite, this));
    this.$container.on('click', '.fe-agree-box', $.proxy(this._openAgreePop, this));
    this.$container.on('click', '.fe-tab1-pay', $.proxy(this._onePay, this));
    this.$container.on('click', '.fe-tab2-pay', $.proxy(this._autoPay, this));
  },
  _changeTab: function (event) {
    var $targetId = $(event.currentTarget).attr('id');
    this._initVariables($targetId);
    this._checkIsAbled();
  },
  _checkIsAbled: function () {
    if (this.$selectedTab.attr('id') === 'tab1-tab') {
      if (($.trim(this.$point.val()) !== '') && ($.trim(this.$pointCardNumber.val()) !== '') &&
        ($.trim(this.$pointPw.val()) !== '') && (this.$agree.is(':checked'))) {
        this.$payBtn.removeAttr('disabled');
      } else {
        this.$payBtn.attr('disabled', 'disabled');
      }
    } else {
      if ((this.$pointSelector.attr('id') !== '') && ($.trim(this.$pointCardNumber.val()) !== '') &&
        (this.$agree.is(':checked'))) {
        this.$payBtn.removeAttr('disabled');
      } else {
        this.$payBtn.attr('disabled', 'disabled');
      }
    }
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  _selectPoint: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_POINT,
      data: Tw.POPUP_TPL.FARE_PAYMENT_POINT
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.point-type', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($.trim($selectedValue.text()));

    this._checkIsAbled();
    this._popupService.close();
  },
  _goCashbagSite: function () {
    Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.OKCASHBAG);
  },
  _isValidForOne: function () {
    return (this._validation.checkIsAvailablePoint(this.$point.val(),
      parseInt(this.$standardPoint.attr('id'), 10),
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_V27) &&
      this._validation.checkIsMore(this.$point.val(), 1000, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V8) &&
      this._validation.checkIsTenUnit(this.$point.val(), Tw.ALERT_MSG_MYT_FARE.TEN_POINT) &&
      this._validation.checkMoreLength(this.$pointCardNumber.val(), 16, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V26));
  },
  _isValidForAuto: function () {
    return (this._validation.checkIsAvailablePoint(this.$pointSelector.attr('id'),
      parseInt(this.$standardPoint.attr('id'), 10),
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_V27) &&
      this._validation.checkMoreLength(this.$pointCardNumber.val(), 16, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V26));
  },
  _openAgreePop: function (event) {
    event.stopPropagation();
    this._popupService.open({
      hbs: 'MF_01_05_L01'
    },
      $.proxy(this._setClickEvent, this),
      $.proxy(this._setCheck, this),
      'agree');
  },
  _setClickEvent: function ($layer) {
    $layer.on('click', '.fe-agree-btn', $.proxy(this._agree, this));
  },
  _agree: function () {
    this.$isAgree = true;
    this._popupService.close();
  },
  _setCheck: function () {
    if (this.$isAgree) {
      if (!this.$agree.is(':checked')) {
        this.$agree.trigger('click');
      }
    }
  },
  _onePay: function () {
    if (this._isValidForOne()) {
      var reqData = this._makeRequestDataForOne();

      this._apiService.request(Tw.API_CMD.BFF_07_0045, reqData)
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _autoPay: function () {
    if (this._isValidForAuto()) {
      var reqData = this._makeRequestDataForAuto();

      this._apiService.request(Tw.API_CMD.BFF_07_0054, reqData)
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _paySuccess: function (res) {
    var message = this._getCompleteMessage();
    var subMessage = this._getSubMessage();

    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.afterRequestSuccess('/myt/fare/history/point', '/myt/fare',
        Tw.MYT_FARE_PAYMENT_NAME.GO_PAYMENT_HISTORY, message, subMessage);
    } else {
      this._payFail(res);
    }
  },
  _getCompleteMessage: function () {
    var message = '';
    if (this.$pointType === 'CPT') {
      message += Tw.MYT_FARE_PAYMENT_NAME.OK_CASHBAG + ' ' + Tw.MYT_FARE_PAYMENT_NAME.POINT;
    } else {
      message += Tw.MYT_FARE_PAYMENT_NAME.T_POINT;
    }

    if (this.$selectedTab.attr('id') === 'tab1-tab') {
      message += ' ' + Tw.MYT_FARE_PAYMENT_NAME.RESERVATION;
    } else {
      message += ' ' + Tw.MYT_FARE_PAYMENT_NAME.AUTO;
    }
    return message;
  },
  _getSubMessage: function () {
    var message = '';
    if (this.$selectedTab.attr('id') === 'tab1-tab') {
      message += Tw.MYT_FARE_PAYMENT_NAME.RESERVATION + ' ' + Tw.MYT_FARE_PAYMENT_NAME.POINT + ' ' +
        Tw.FormatHelper.addComma($.trim(this.$point.val())) + 'P';
    } else {
      message += Tw.MYT_FARE_PAYMENT_NAME.PAYMENT + ' ' + Tw.MYT_FARE_PAYMENT_NAME.REQUEST + ' ' +
        Tw.MYT_FARE_PAYMENT_NAME.POINT + this.$pointSelector.text();
    }
    return message;
  },
  _payFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _makeRequestDataForOne: function () {
    var reqData = {
      ocbCcno: $.trim(this.$pointCardNumber.val()),
      ptClCd: this.$pointType,
      reqAmt: $.trim(this.$point.val()),
      ocbPwd: $.trim(this.$pointPw.val())
    };
    return reqData;
  },
  _makeRequestDataForAuto: function () {
    var autoType = this._getAutoType();
    var cardNumber = $.trim(this.$pointCardNumber.val());

    if (this.$autoInfo.is(':visible')) {
      cardNumber = this.$pointCardNumber.attr('id');
    }

    var reqData = {
      reqClCd: autoType,
      reqAmt: this.$pointSelector.attr('id'),
      ptClCd: this.$pointType,
      ocbCcno: cardNumber
    };
    return reqData;
  },
  _getAutoType: function () {
    if (this.$autoInfo.is(':visible')) {
      return 2;
    }
    return 1;
  }
};