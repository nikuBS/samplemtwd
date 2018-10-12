/**
 * FileName: myt.fare.payment.prepay.change.limit.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.09
 */

Tw.MyTFarePaymentPrepayChangeLimit = function (rootEl, title) {
  this.$container = rootEl;
  this.$title = title;
  this.$isClicked = false;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._historyService = new Tw.HistoryService(rootEl);
  this._init();
};

Tw.MyTFarePaymentPrepayChangeLimit.prototype = {
  _init: function () {
    this._getLimit();
  },
  _getLimit: function () {
    var apiName = this._getLimitApiName();
    this._apiService.request(apiName, {})
      .done($.proxy(this._getLimitSuccess, this))
      .fail($.proxy(this._getLimitFail, this));
  },
  _getLimitApiName: function () {
    var apiName = '';
    if (this.$title === 'micro') {
      apiName = Tw.API_CMD.BFF_05_0080;
    } else {
      apiName = Tw.API_CMD.BFF_05_0066;
    }
    return apiName;
  },
  _getLimitSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._changeLimit(res.result);
    } else {
      this._getLimitFail();
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
      this._historyService.goLoad('/myt/fare');
    }
  },
  _changeLimit: function (result) {
    this._popupService.open({
      'hbs': 'MF_06_02'
    }, $.proxy(this._openChangeLimit, this, result));
  },
  _openChangeLimit: function (result, $layer) {
    this._setLimitData(result, $layer);
    this._setLimitEvent($layer);
  },
  _setLimitData: function (result, $layer) {
    $layer.find('.fe-month').attr('id', result.microPayLimitAmt)
      .text(this._getLittleAmount(result.microPayLimitAmt) + Tw.CURRENCY_UNIT.TEN_THOUSAND);
    $layer.find('.fe-day').attr('id', result.dayLimit)
      .text(this._getLittleAmount(result.dayLimit) + Tw.CURRENCY_UNIT.TEN_THOUSAND);
    $layer.find('.fe-once').attr('id', result.onceLimit)
      .text(this._getLittleAmount(result.onceLimit) + Tw.CURRENCY_UNIT.TEN_THOUSAND);
  },
  _setLimitEvent: function ($layer) {
    $layer.on('click', '.fe-month', $.proxy(this._selectAmount, this));
    $layer.on('click', '.fe-day', $.proxy(this._selectAmount, this));
    $layer.on('click', '.fe-once', $.proxy(this._selectAmount, this));
    $layer.on('click', '.fe-change', $.proxy(this._change, this, $layer));
  },
  _getLittleAmount: function (amount) {
    return amount / 10000;
  },
  _selectAmount: function (event) {
    var $target = $(event.currentTarget);
    var $amount = $target.attr('id');

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_AMOUNT,
      data: Tw.POPUP_TPL.FARE_PAYMENT_LIMIT
    }, $.proxy(this._selectPopupCallback, this, $target, $amount));
  },
  _selectPopupCallback: function ($target, $amount, $layer) {
    this._setLayerData($layer, $amount);
    $layer.on('click', '.amount', $.proxy(this._setSelectedValue, this, $target));
  },
  _setLayerData: function ($layer, $amount) {
    $layer.find('.limit').each(function () {
      var $this = $(this);
      if ($this.attr('id') > $amount) {
        $this.hide();
      }
    });
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.text());

    this._popupService.close();
  },
  _change: function ($layer) {
    var apiName = this._changeLimitApiName();
    var reqData = this._makeRequestData($layer);

    this._apiService.request(apiName, reqData)
      .done($.proxy(this._changeLimitSuccess, this))
      .fail($.proxy(this._changeLimitFail, this));
    this._popupService.close();
  },
  _changeLimitApiName: function () {
    var apiName = '';
    if (this.$title === 'micro') {
      apiName = Tw.API_CMD.BFF_05_0081;
    } else {
      apiName = Tw.API_CMD.BFF_05_0067;
    }
    return apiName;
  },
  _makeRequestData: function ($layer) {
    var reqData = {};

    reqData.chgMLimit = $layer.find('.fe-month').attr('id');
    reqData.chgDLimit = $layer.find('.fe-day').attr('id');
    reqData.chgOLimit = $layer.find('.fe-once').attr('id');

    return reqData;
  },
  _changeLimitSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._commonHelper.toast(Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE_LIMIT);
    } else {
      this._changeLimitFail(res);
    }
  },
  _changeLimitFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  }
};