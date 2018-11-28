/**
 * FileName: myt-fare.bill.cashbag.tpoint.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.7
 */

Tw.MyTFareBillCashbagTpoint = function (rootEl, pointType) {
  this.$container = rootEl;
  this.$pointType = pointType;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBillCashbagTpoint.prototype = {
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
    this.$container.on('keyup', '.fe-only-number', $.proxy(this._checkNumber, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('change', '.fe-agree', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._cancel, this));
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
  _cancel: function () {
    this._popupService.openConfirm(null, Tw.AUTO_PAY_CANCEL.CONFIRM_MESSAGE, $.proxy(this._autoCancel, this));
  },
  _autoCancel: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0054, { reqClCd: '3', ptClCd: this.$pointType })
      .done($.proxy(this._cancelSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _cancelSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=' + this.$pointType + '&type=cancel');
    } else {
      this._fail(res);
    }
  },
  _selectPoint: function (event) {
    var $target = $(event.currentTarget);

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: this._getTitle(),
      data: this._getData()
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _getTitle: function () {
    if (this.$pointType === 'CPT') {
      return Tw.POPUP_TITLE.SELECT_POINT;
    }
    return Tw.POPUP_TITLE.SELECT_TPOINT;
  },
  _getData: function () {
    if (this.$pointType === 'CPT') {
      return Tw.POPUP_TPL.FARE_PAYMENT_POINT;
    }
    return Tw.POPUP_TPL.FARE_PAYMENT_TPOINT;
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
        .done($.proxy(this._paySuccess, this, ''))
        .fail($.proxy(this.fail, this));
    }
  },
  _autoPay: function () {
    if (this._isValidForAuto()) {
      var reqData = this._makeRequestDataForAuto();
      var type = 'auto';
      if (this.$autoInfo.is(':visible')) {
        type = 'change';
      }
      this._apiService.request(Tw.API_CMD.BFF_07_0054, reqData)
        .done($.proxy(this._paySuccess, this, type))
        .fail($.proxy(this.fail, this));
    }
  },
  _paySuccess: function (type, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var point = this._getPointValue(type);
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=' +
        this.$pointType + '&type=' + type + '&point=' + point);
    } else {
      this.fail(res);
    }
  },
  _getPointValue: function (type) {
    var point = $.trim(this.$point.val());
    if (type === 'auto' || type === 'change') {
      point = this.$pointSelector.attr('id');
    }
    return point;
  },
  fail: function (err) {
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