/**
 * FileName: myt-fare.bill.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFareBill = function (rootEl, svcAttrCd) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init(svcAttrCd);
};

Tw.MyTFareBill.prototype = {
  _init: function (svcAttrCd) {
    this._initVariables(svcAttrCd);
    this._getAutoPayment();
    this._getSmsList();

    if (this.$isMobile) {
      this._getPoint();
      this._getRainbowPoint();
    }
  },
  _initVariables: function (svcAttrCd) {
    this.$isMobile = true;

    this._autoComplete = false;
    this._isAutoTarget = false;
    this._isPointTarget = true;
    this._isSmsTarget = false;
    this._isSmsComplete = false;
    this._okCashbag = 0;
    this._tPoint = 0;
    this._rainbowPoint = 0;

    if (!Tw.FormatHelper.isEmpty(svcAttrCd)) {
      this.$isMobile = svcAttrCd.indexOf('M') !== -1;
    }

    if (this.$isMobile) {
      this._pointComplete = false;
      this._rainbowComplete = false;
    } else {
      this._pointComplete = true;
      this._rainbowComplete = true;
    }
  },
  _getAutoPayment: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0058, {})
      .done($.proxy(this._autoSuccess, this))
      .fail($.proxy(this._autoFail, this));
  },
  _getSmsList: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0026, {})
      .done($.proxy(this._smsSuccess, this))
      .fail($.proxy(this._smsFail, this));
  },
  _getPoint: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0041, {})
      .done($.proxy(this._pointSuccess, this))
      .fail($.proxy(this._pointFail, this));
  },
  _getRainbowPoint: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0132, {})
      .done($.proxy(this._rainbowSuccess, this))
      .fail($.proxy(this._rainbowFail, this));
  },
  _isAllComplete: function () {
    if (this._autoComplete && this._isSmsComplete &&
      this._pointComplete && this._rainbowComplete) {
      this._openPaymentOption();
    }
  },
  _openPaymentOption: function () {
    var data = Tw.POPUP_TPL.FARE_PAYMENT_LAYER_DATA;
    if (!this.$isMobile) {
      data = Tw.POPUP_TPL.FARE_PAYMENT_LAYER_DATA_EXCEPT_POINT;
    }

    this._popupService.open({
      url: '/hbs/',
      hbs: 'MF_01',// hbs의 파일명
      layer: true,
      data: data,
      lineManagement: { 'txt': Tw.MYT_FARE_PAYMENT_NAME.AUTO_PAYMENT, 'spot': Tw.MYT_FARE_PAYMENT_NAME.REQUEST },
      btnfloating: { 'txt': Tw.BUTTON_LABEL.CLOSE }
    },
      $.proxy(this._onOpenPopup, this), 
      null,
      'paymentselect');
  },
  _onOpenPopup: function ($layer) {
    this.$layer = $layer;

    if (this.$isMobile) {
      this._setPointInfo();
    }
    this._setAutoField();
    this._setSmsField();
    this._bindEvent();
  },
  _setAutoField: function () {
    if (this._isAutoTarget) {
      this.$layer.on('click', '.fe-auto', $.proxy(this._goPage, this, 'auto'));
    } else {
      this.$layer.find('.fe-auto').find('.spot').text(Tw.MYT_FARE_PAYMENT_NAME.USING);
      this.$layer.on('click', '.fe-auto', $.proxy(this._goPage, this, 'option'));
    }
  },
  _setSmsField: function () {
    if (!this._isSmsTarget) {
      this.$layer.find('.fe-sms').parent().hide();
    }
  },
  _setPointInfo: function () {
    var $cashbagSelector = this.$layer.find('.fe-ok-cashbag');
    var $tpointSelector = this.$layer.find('.fe-t-point');
    var $rainbowSelector = this.$layer.find('.fe-rainbow-point');

    if (this._isPointTarget) {
      $cashbagSelector.find('.spot').text(Tw.FormatHelper.addComma(this._okCashbag) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT);
      $tpointSelector.find('.spot').text(Tw.FormatHelper.addComma(this._tPoint) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT);
    }
    $rainbowSelector.find('.spot').text(Tw.FormatHelper.addComma(this._rainbowPoint) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT);
  },
  _bindEvent: function () {
    this.$layer.on('click', '.fe-account', $.proxy(this._goPage, this, 'account'));
    this.$layer.on('click', '.fe-card', $.proxy(this._goPage, this, 'card'));
    this.$layer.on('click', '.fe-point', $.proxy(this._goPage, this, 'point'));
    this.$layer.on('click', '.fe-sms', $.proxy(this._goPage, this, 'sms'));

    // point bind event
    this.$layer.on('click', '.fe-ok-cashbag', $.proxy(this._goPage, this, 'cashbag'));
    this.$layer.on('click', '.fe-t-point', $.proxy(this._goPage, this, 'tpoint'));
    this.$layer.on('click', '.fe-rainbow-point', $.proxy(this._goPage, this, 'rainbow'));
  },
  _goPage: function ($uri) {
    if ($uri !== null) {
      var fullUrl = '/myt-fare/bill/' + $uri;
      if ($uri === 'auto') {
        fullUrl = '/myt-fare/bill/option/register';
      }
      this._historyService.replaceURL(fullUrl);
    }
  },
  _autoSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setAutoPaymentTarget(res.result.payMthdCd);
      this._autoComplete = true;

      this._isAllComplete();
    } else {
      this._autoFail();
    }
  },
  _autoFail: function () {
    this._isAutoTarget = false;
    this._autoComplete = true;

    this._isAllComplete();
  },
  _smsSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setSmsTarget(res.result.virtualBankList);
      this._isSmsComplete = true;

      this._isAllComplete();
    } else {
      this._smsFail();
    }
  },
  _smsFail: function () {
    this._isSmsTarget = false;
    this._isSmsComplete = true;

    this._isAllComplete();
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
  _pointFail: function () {
    this._isPointTarget = false;
    this._pointComplete = true;

    this._isAllComplete();
  },
  _rainbowSuccess: function (res) {
    this._rainbowComplete = true;
    if (res.code === Tw.API_CODE.CODE_00) {
      this._rainbowPoint = res.result.usblPoint;
    } else {
      this._rainbowFail(res);
    }
    this._isAllComplete();
  },
  _rainbowFail: function () {
    this._rainbowComplete = true;

    this._isAllComplete();
  },
  _setAutoPaymentTarget: function (code) {
    if (code !== '01' && code !== '02') {
      this._isAutoTarget = true;
    }
  },
  _setSmsTarget: function (list) {
    if (list.length > 0) {
      this._isSmsTarget = true;
    }
  },
  _setPointTarget: function (svcYn) {
    if (svcYn === 'N') {
      this._isPointTarget = false;
    }
  }
};