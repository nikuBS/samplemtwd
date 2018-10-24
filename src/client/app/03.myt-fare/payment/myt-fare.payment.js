/**
 * FileName: myt-fare.payment.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFarePayment = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePayment.prototype = {
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
      title: Tw.POPUP_TITLE.SELECT_PAYMENT_OPTION,
      data: Tw.POPUP_TPL.FARE_PAYMENT_LAYER_DATA
    },
      $.proxy(this._onOpenPopup, this),
      $.proxy(this._goLoad, this));
  },
  _onOpenPopup: function ($layer) {
    this.$layer = $layer;

    this._setAutoField();
    this._setPointInfo();
    this._bindEvent();
  },
  _setAutoField: function () {
    if (this._isAutoTarget) {
      this.$layer.find('.fe-auto').parents('div.cont-box').show();
      this.$layer.on('click', '.fe-auto', $.proxy(this._setEvent, this, 'auto'));
    } else {
      this.$layer.find('.fe-auto').parents('div.cont-box').hide();
    }
  },
  _setPointInfo: function () {
    var cashbag, tpoint, rainbow = '';

    if (!this._isPointTarget) {
      cashbag = Tw.MYT_FARE_PAYMENT_NAME.OK_CASHBAG + ' ' + Tw.MYT_FARE_PAYMENT_NAME.INQUIRE;
      tpoint = Tw.MYT_FARE_PAYMENT_NAME.T_POINT + ' ' + Tw.MYT_FARE_PAYMENT_NAME.INQUIRE;
      rainbow = Tw.MYT_FARE_PAYMENT_NAME.RAINBOW_POINT + ' ' + Tw.MYT_FARE_PAYMENT_NAME.INQUIRE;
    } else {
      cashbag = Tw.MYT_FARE_PAYMENT_NAME.OK_CASHBAG + ' (' +
        Tw.FormatHelper.addComma(this._okCashbag) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT + ')';
      tpoint = Tw.MYT_FARE_PAYMENT_NAME.T_POINT + ' (' +
        Tw.FormatHelper.addComma(this._tPoint) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT + ')';
      rainbow = Tw.MYT_FARE_PAYMENT_NAME.RAINBOW_POINT + ' (' +
        Tw.FormatHelper.addComma(this._rainbowPoint) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT + ')';

      this._setPointClass(this._okCashbag, '.fe-ok-cashbag');
      this._setPointClass(this._tPoint, '.fe-t-point');
      this._setPointClass(this._rainbowPoint, '.fe-rainbow-point');
    }
    this.$layer.find('.fe-ok-cashbag').find('.fe-text').text(cashbag);
    this.$layer.find('.fe-t-point').find('.fe-text').text(tpoint);
    this.$layer.find('.fe-rainbow-point').find('.fe-text').text(rainbow);
  },
  _setPointClass: function (point, className) {
    if (point < 500) {
      this.$layer.find(className).addClass('fe-less');
    }
  },
  _bindEvent: function () {
    this.$layer.on('click', '.fe-account', $.proxy(this._setEvent, this, 'account'));
    this.$layer.on('click', '.fe-card', $.proxy(this._setEvent, this, 'card'));
    this.$layer.on('click', '.fe-point', $.proxy(this._setEvent, this, 'point'));
    this.$layer.on('click', '.fe-sms', $.proxy(this._setEvent, this, 'sms'));

    // point bind event
    this.$layer.on('click', '.fe-ok-cashbag', $.proxy(this._setPointEvent, this, 'cashbag'));
    this.$layer.on('click', '.fe-t-point', $.proxy(this._setPointEvent, this, 'tpoint'));
    this.$layer.on('click', '.fe-rainbow-point', $.proxy(this._setPointEvent, this, 'rainbow'));
  },
  _setEvent: function (uri) {
    this.$uri = uri;
    this._popupService.close();
  },
  _setPointEvent: function (uri, event) {
    var $target = $(event.currentTarget);
    if ($target.hasClass('fe-less')) {
      var messageName = this._getPointErrorMessage($target);
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE[messageName]);
    } else {
      this.$uri = uri;
      this._popupService.close();
    }
  },
  _getPointErrorMessage: function ($target) {
    var messageName = '';
    if ($target.hasClass('fe-ok-cashbag')) {
      messageName = 'ALERT_2_A74';
    } else if ($target.hasClass('fe-t-point')) {
      messageName = 'ALERT_2_A75';
    } else {
      messageName = 'ALERT_2_A76';
    }
    return messageName;
  },
  _goLoad: function () {
    if (this.$uri !== null) {
      this._historyService.goLoad('/myt/fare/payment/' + this.$uri);
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
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setPointTarget(res.result.svcYN);
      this._pointComplete = true;
      this._okCashbag = res.result.availPt;
      this._tPoint = res.result.availTPt;

      this._isAllComplete();
    } else {
      this._fail(res);
    }
  },
  _rainbowSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._rainbowComplete = true;
      this._rainbowPoint = res.result.usableRbpPt;

      this._isAllComplete();
    } else {
      this._fail(res);
    }
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