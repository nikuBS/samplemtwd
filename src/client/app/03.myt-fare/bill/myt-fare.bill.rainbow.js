/**
 * FileName: myt-fare.bill.rainbow.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.7
 */

Tw.MyTFareBillRainbow = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBillRainbow.prototype = {
  _init: function () {
    this._initVariables('tab1');
    this._bindEvent();
  },
  _initVariables: function ($targetId) {
    this.$standardPoint = this.$container.find('.fe-standard-point');
    this.$autoInfo = this.$container.find('.fe-auto-info');
    this.$selectedTab = this.$container.find('#' + $targetId + '-tab');
    this.$fareSelector = this.$selectedTab.find('.fe-select-fare');
    this.$point = this.$selectedTab.find('.fe-point');
    this.$payBtn = this.$container.find('.fe-' + $targetId + '-pay');

    this.$payBtn.show();
    this.$payBtn.siblings().hide();
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-tab-selector > li', $.proxy(this._changeTab, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-select-fare', $.proxy(this._selectFare, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._cancel, this));
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
      if ((this.$fareSelector.attr('id') !== '') && ($.trim(this.$point.val()) !== '')) {
        this.$payBtn.removeAttr('disabled');
      } else {
        this.$payBtn.attr('disabled', 'disabled');
      }
    } else {
      if (this.$fareSelector.attr('id') !== '') {
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
    this._apiService.request(Tw.API_CMD.BFF_07_0056, { rbpChgRsnCd: 'T1' })
      .done($.proxy(this._cancelSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _cancelSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=rainbow&type=cancel');
    } else {
      this._fail(res);
    }
  },
  _selectFare: function (event) {
    var $target = $(event.currentTarget);

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_FARE,
      data: Tw.POPUP_TPL.FARE_PAYMENT_RAINBOW
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
  _isValidForOne: function () {
    return (this._validation.checkIsAvailablePoint(this.$point.val(),
      parseInt(this.$standardPoint.attr('id'), 10),
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_V27) &&
      this._validation.checkIsMore(this.$point.val(), 1, Tw.ALERT_MSG_MYT_FARE.UP_TO_ONE) &&
      this._validation.checkIsTenUnit(this.$point.val(), Tw.ALERT_MSG_MYT_FARE.TEN_POINT));
  },
  _isValidForAuto: function () {
    return this._validation.checkIsMore(parseInt(this.$standardPoint.attr('id'), 10), 1000, Tw.ALERT_MSG_MYT_FARE.UP_TO_TEN);
  },
  _onePay: function () {
    if (this._isValidForOne()) {
      var reqData = this._makeRequestDataForOne();
      this._apiService.request(Tw.API_CMD.BFF_07_0048, reqData)
        .done($.proxy(this._paySuccess, this, ''))
        .fail($.proxy(this._fail, this));
    }
  },
  _autoPay: function () {
    if (this._isValidForAuto()) {
      var reqData = this._makeRequestDataForAuto();
      this._apiService.request(Tw.API_CMD.BFF_07_0056, reqData)
        .done($.proxy(this._paySuccess, this, 'auto'))
        .fail($.proxy(this._fail, this));
    }
  },
  _paySuccess: function (type, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=rainbow&type=' + type +
        '&point=' + this._getPointValue(type) + '&add=' + this.$fareSelector.attr('id'));
    } else {
      this._fail(res);
    }
  },
  _getPointValue: function (type) {
    var point = $.trim(this.$point.val());
    if (type === 'auto') {
      point = '';
    }
    return point;
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _makeRequestDataForOne: function () {
    var reqData = {
      reqRbpPt: $.trim(this.$point.val()),
      prodId: this.$fareSelector.attr('id')
    };
    return reqData;
  },
  _makeRequestDataForAuto: function () {
    var reqData = {
      prodId: this.$fareSelector.attr('id'),
      rbpChgRsnCd: 'A1'
    };
    return reqData;
  }
};