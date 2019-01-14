/**
 * FileName: myt-fare.bill.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFareBill = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBill.prototype = {
  _init: function () {
    this._initVariables();

    this._getAutoPayment();
    this._getPoint();
    this._getRainbowPoint();
  },
  _initVariables: function () {
    this.$uri = null;
    this._autoComplete = false;
    this._pointComplete = false;
    this._rainbowComplete = false;
    this._isAutoTarget = false;
    this._isPointTarget = true;
    this._okCashbag = 0;
    this._tPoint = 0;
    this._rainbowPoint = 0;
  },
  _getAutoPayment: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0058, {})
      .done($.proxy(this._autoSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _getPoint: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0041, {})
      .done($.proxy(this._pointSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _getRainbowPoint: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0042, {})
      .done($.proxy(this._rainbowSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _isAllComplete: function () {
    if (this._autoComplete && this._pointComplete && this._rainbowComplete) {
      this._openPaymentOption();
    }
  },
  _openPaymentOption: function () {
    this._popupService.open({
      hbs: 'MF_01',// hbs의 파일명
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_LAYER_DATA,
      btnfloating: { 'txt': Tw.BUTTON_LABEL.CLOSE }
    },
      $.proxy(this._onOpenPopup, this),
      $.proxy(this._goLoad, this),
      'paymentselect');
  },
  _onOpenPopup: function ($layer) {
    this.$layer = $layer;

    this._setAutoField();
    this._setPointInfo();
    this._bindEvent();
  },
  _setAutoField: function () {
    if (this._isAutoTarget) {
      this.$layer.on('click', '.fe-auto', $.proxy(this._setEvent, this, 'auto'));
    } else {
      this.$layer.find('.fe-auto').find('.spot').text(Tw.MYT_FARE_PAYMENT_NAME.USING);
      this.$layer.on('click', '.fe-auto', $.proxy(this._setEvent, this, 'option'));
    }
  },
  _setPointInfo: function () {
    var $cashbagSelector = this.$layer.find('.fe-ok-cashbag');
    var $tpointSelector = this.$layer.find('.fe-t-point');
    var $rainbowSelector = this.$layer.find('.fe-rainbow-point');
    var cashbagText = $.trim($cashbagSelector.text());
    var tpointText = $.trim($tpointSelector.text());

    if (this._isPointTarget) {
      $cashbagSelector.find('.spot').text(Tw.FormatHelper.addComma(this._okCashbag) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT);
      $tpointSelector.find('.spot').text(Tw.FormatHelper.addComma(this._tPoint) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT);
    } else {
      $cashbagSelector.text(cashbagText + Tw.MYT_FARE_PAYMENT_NAME.POINT);
      $tpointSelector.text(tpointText);
    }
    $rainbowSelector.find('.spot').text(Tw.FormatHelper.addComma(this._rainbowPoint) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT);
  },
  _bindEvent: function () {
    this.$layer.on('click', '.fe-account', $.proxy(this._setEvent, this, 'account'));
    this.$layer.on('click', '.fe-card', $.proxy(this._setEvent, this, 'card'));
    this.$layer.on('click', '.fe-point', $.proxy(this._setEvent, this, 'point'));
    this.$layer.on('click', '.fe-sms', $.proxy(this._setEvent, this, 'sms'));

    // point bind event
    this.$layer.on('click', '.fe-ok-cashbag', $.proxy(this._setEvent, this, 'cashbag'));
    this.$layer.on('click', '.fe-t-point', $.proxy(this._setEvent, this, 'tpoint'));
    this.$layer.on('click', '.fe-rainbow-point', $.proxy(this._setEvent, this, 'rainbow'));
  },
  _setEvent: function (uri) {
    this.$uri = uri;
    this._popupService.close();
  },
  _goLoad: function () {
    if (this.$uri !== null) {
      var fullUrl = '/myt-fare/bill/' + this.$uri;
      if (this.$uri === 'auto') {
        fullUrl = '/myt-fare/bill/option/register';
      }
      this._historyService.goLoad(fullUrl);
    }
  },
  _autoSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setAutoPaymentTarget(res.result.payMthdCd);
      this._autoComplete = true;

      this._isAllComplete();
    } else {
      this._fail(res);
    }
  },
  _pointSuccess: function (res) {
    this._pointComplete = true;
    var svcYn = 'N';

    if (res.code === Tw.API_CODE.CODE_00) {
      this._okCashbag = res.result.availPt;
      this._tPoint = res.result.availTPt;
      svcYn = res.result.svcYN;
    }
    this._setPointTarget(svcYn);
    this._isAllComplete();
  },
  _rainbowSuccess: function (res) {
    this._rainbowComplete = true;

    if (res.code === Tw.API_CODE.CODE_00) {
      this._rainbowPoint = res.result.usableRbpPt;
    } else {
      this._fail(res);
    }
    this._isAllComplete();
  },
  _setAutoPaymentTarget: function (code) {
    if (code !== '01' && code !== '02') {
      this._isAutoTarget = true;
    }
  },
  _setPointTarget: function (svcYn) {
    if (svcYn === 'N') {
      this._isPointTarget = false;
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};