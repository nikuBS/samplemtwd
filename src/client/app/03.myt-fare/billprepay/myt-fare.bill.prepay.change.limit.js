/**
 * FileName: myt.fare.bill.prepay.change.limit.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.09
 * Annotation: 소액결제/콘텐츠이용료 한도변경
 */

Tw.MyTFareBillPrepayChangeLimit = function (rootEl, title) {
  this.$container = rootEl;
  this.$title = title;
  this.$isClicked = false;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._historyService = new Tw.HistoryService(rootEl);
  this._init();
};

Tw.MyTFareBillPrepayChangeLimit.prototype = {
  _init: function () {
    this._getLimit();

    this.$monthSelector = null;
    this.$daySelector = null;
    this.$onceSelector = null;
  },
  _getLimit: function () {
    var apiName = this._getLimitApiName();
    this._apiService.request(apiName, {})
      .done($.proxy(this._getLimitSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _getLimitApiName: function () {
    var apiName = '';
    if (this.$title === 'small') {
      apiName = Tw.API_CMD.BFF_05_0080;
    } else {
      apiName = Tw.API_CMD.BFF_05_0066;
    }
    return apiName;
  },
  _getLimitSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (res.result.isUnpaid === 'Y') {
        this._getLimitFail();
      } else {
        this._changeLimit(res.result);
      }
    } else {
      this._fail(res);
    }
  },
  _getLimitFail: function () {
    this._popupService.openOneBtTypeB(
      Tw.ALERT_MSG_MYT_FARE.NOT_ALLOWED_CHANGE_LIMIT,
      Tw.ALERT_MSG_MYT_FARE.NOT_ALLOWED_INFO_MESSAGE,
      [{
        style_class: 'fe-payment',
        txt: Tw.ALERT_MSG_MYT_FARE.GO_PAYMENT
      }],
      'type1',
      $.proxy(this._openLimitFail, this),
      $.proxy(this._goSubmain, this)
    );
  },
  _openLimitFail: function ($layer) {
    $layer.on('click', '.fe-payment', $.proxy(this._setLinkClickEvent, this));
  },
  _setLinkClickEvent: function () {
    this.$isClicked = true;
    this._popupService.close();
  },
  _goSubmain: function () {
    if (this.$isClicked) {
      this._historyService.goLoad('/myt-fare/submain');
    }
  },
  _changeLimit: function (result) {
    var hbsName = 'MF_06_02';
    if (this.$title === 'contents') {
      hbsName = 'MF_07_02';
    }
    this._popupService.open({
      'hbs': hbsName
    }, $.proxy(this._openChangeLimit, this, result), null, 'change-limit');
  },
  _openChangeLimit: function (result, $layer) {
    this._initLayerVar($layer);
    this._setLimitData(result, $layer);
    this._setLimitEvent($layer);
  },
  _initLayerVar: function ($layer) {
    this.$changeBtn = $layer.find('.fe-change');
  },
  _setLimitData: function (result, $layer) {
    this.$monthSelector = $layer.find('.fe-month');
    this.$daySelector = $layer.find('.fe-day');
    this.$onceSelector = $layer.find('.fe-once');

    var monthLimit = '';
    if (this.$title === 'small') {
      monthLimit = 'microPayLimitAmt';
    } else {
      monthLimit = 'monLimit';
    }

    this.$monthSelector
      .attr({ 'id': result[monthLimit], 'origin-value': result[monthLimit] })
      .text(this._getLittleAmount(result[monthLimit]));
    this.$daySelector
      .attr({ 'id': result.dayLimit, 'origin-value': result.dayLimit })
      .text(this._getLittleAmount(result.dayLimit));
    this.$onceSelector
      .attr({ 'id': result.onceLimit, 'origin-value': result.onceLimit })
      .text(this._getLittleAmount(result.onceLimit));
  },
  _setLimitEvent: function ($layer) {
    $layer.on('click', '.fe-month', $.proxy(this._selectAmount, this));
    $layer.on('click', '.fe-day', $.proxy(this._selectAmount, this));
    $layer.on('click', '.fe-once', $.proxy(this._selectAmount, this));
    $layer.on('click', '.fe-change', $.proxy(this._openChangeConfirm, this));
    // $layer.on('click', '.fe-close', $.proxy(this._onClose, this));
  },
  _getLittleAmount: function (amount) {
    var defaultValue = 50;
    if (amount > 0) {
      defaultValue = amount / 10000;
    }
    return defaultValue + Tw.CURRENCY_UNIT.TEN_THOUSAND;
  },
  _selectAmount: function (event) {
    var $target = $(event.currentTarget);
    var $amount = $target.attr('id');
    var data = Tw.POPUP_TPL.FARE_PAYMENT_SMALL_LIMIT;
    if (this.$title === 'contents') {
      data = Tw.POPUP_TPL.FARE_PAYMENT_CONTENTS_LIMIT;
    }

    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: data,
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target, $amount));
  },
  _selectPopupCallback: function ($target, $amount, $layer) {
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

    this._checkIsChanged();
    this._popupService.close();
  },
  _checkIsChanged: function () {
    if (this._isChanged()) {
      this.$changeBtn.removeAttr('disabled');
    } else {
      this.$changeBtn.attr('disabled', 'disabled');
    }
  },
  _openChangeConfirm: function () {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A96.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A96.TITLE,
      $.proxy(this._onChange, this), $.proxy(this._change, this), Tw.BUTTON_LABEL.CANCEL, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A96.BUTTON);
  },
  _onChange: function () {
    this.$isChange = true;
    this._popupService.close();
  },
  _change: function () {
    if (this.$isChange) {
      var apiName = this._changeLimitApiName();
      var reqData = this._makeRequestData();

      this._apiService.request(apiName, reqData)
        .done($.proxy(this._changeLimitSuccess, this))
        .fail($.proxy(this._fail, this));
    }
  },
  _changeLimitApiName: function () {
    var apiName = '';
    var isUp = this._checkIsUp();

    if (this.$title === 'small') {
      if (isUp) {
        apiName = Tw.API_CMD.BFF_05_0081;
      } else {
        apiName = Tw.API_CMD.BFF_05_0176;
      }
    } else {
      if (isUp) {
        apiName = Tw.API_CMD.BFF_05_0067;
      } else {
        apiName = Tw.API_CMD.BFF_05_0177;
      }
    }
    return apiName;
  },
  _checkIsUp: function () {
    return ((parseInt(this.$monthSelector.attr('id'), 10) > parseInt(this.$monthSelector.attr('origin-value'), 10)) ||
      (parseInt(this.$daySelector.attr('id'), 10) > parseInt(this.$daySelector.attr('origin-value'), 10)) ||
      (parseInt(this.$onceSelector.attr('id'), 10) > parseInt(this.$onceSelector.attr('origin-value'), 10)));
  },
  _makeRequestData: function () {
    var reqData = {};

    reqData.chgMLimit = this.$monthSelector.attr('id');
    reqData.chgDLimit = this.$daySelector.attr('id');
    reqData.chgOLimit = this.$onceSelector.attr('id');

    return reqData;
  },
  _changeLimitSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.close();
      this._commonHelper.toast(Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE_LIMIT);
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _onClose: function () {
    // if (this._isChanged()) {
    //   this._popupService.openConfirmButton(Tw.ALERT_CANCEL, null,
    //     $.proxy(this._closePop, this), null, Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
    // } else {
    //   this._popupService.close();
    // }
  },
  _isChanged: function () {
    return this.$monthSelector.attr('id') !== this.$monthSelector.attr('origin-value') ||
      this.$daySelector.attr('id') !== this.$daySelector.attr('origin-value') ||
      this.$onceSelector.attr('id') !== this.$onceSelector.attr('origin-value');
  },
  _closePop: function () {
    this._popupService.closeAll();
  }
};