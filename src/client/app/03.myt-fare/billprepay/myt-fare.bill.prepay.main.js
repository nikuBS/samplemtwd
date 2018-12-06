/**
 * FileName: myt-fare.bill.prepay.main.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTFareBillPrepayMain = function (rootEl, title) {
  this.$container = rootEl;
  this.$title = title;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._historyService = new Tw.HistoryService(rootEl);

  this._initVariables();
  this._setButtonVisibility();
  this._bindEvent();
};

Tw.MyTFareBillPrepayMain.prototype = {
  _initVariables: function () {
    this._maxAmount = this.$container.find('.fe-max-amount').attr('id');
    this._name = this.$container.find('.fe-name').text();
    this._isAndroid = Tw.BrowserHelper.isAndroid();

    this._monthAmountList = [];
    this._dayAmountList = [];
    this._onceAmountList = [];

    this.$setPasswordBtn = this.$container.find('.fe-set-password');
  },
  _setButtonVisibility: function () {
    if (this.$title === 'small') {
      if (this.$setPasswordBtn.attr('data-cpin') === undefined || this.$setPasswordBtn.attr('data-cpin') === null ||
        this.$setPasswordBtn.attr('data-cpin') === '' || this.$setPasswordBtn.attr('data-cpin') === 'IC') {
        this.$setPasswordBtn.after().hide();
      }
    }
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-max-amount', $.proxy(this._prepayHistoryMonth, this));
    this.$container.on('click', '.fe-micro-history', $.proxy(this._microHistory, this));
    this.$container.on('click', '.fe-contents-history', $.proxy(this._contentsHistory, this));
    this.$container.on('click', '.fe-change-limit', $.proxy(this._changeLimit, this));
    this.$container.on('click', '.fe-prepay', $.proxy(this._prepay, this));
    this.$container.on('click', '.fe-auto-prepay', $.proxy(this._autoPrepay, this));
    this.$container.on('click', '.fe-auto-prepay-change', $.proxy(this._autoPrepayInfo, this));
    this.$container.on('click', '.fe-auto-pay-info', $.proxy(this._openAutoPayInfo, this));
    this.$container.on('change', '.fe-set-use', $.proxy(this._changeUseStatus, this));
    this.$container.on('click', '.fe-set-password', $.proxy(this._setPassword, this));
  },
  _prepayHistoryMonth: function () {
    this._historyService.goLoad('/myt-fare/bill/' + this.$title + '/monthly');
  },
  _microHistory: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.HISTORY,
      data: Tw.POPUP_TPL.FARE_PAYMENT_MICRO_HISTORY_LIST
    },
      $.proxy(this._selectPopupCallback, this),
      $.proxy(this._goLoad, this)
    );
  },
  _selectPopupCallback: function ($layer) {
    $layer.on('click', '.go-history', $.proxy(this._setEvent, this));
  },
  _setEvent: function (event) {
    this.$microHistoryUri = $(event.currentTarget).attr('data-link');
    this._popupService.close();
  },
  _contentsHistory: function () {
    this._historyService.goLoad('/myt-fare/bill/contents/history');
  },
  _goLoad: function () {
    this._historyService.goLoad(this.$microHistoryUri);
  },
  _changeLimit: function () {
    new Tw.MyTFareBillPrepayChangeLimit(this.$container, this.$title);
  },
  _prepay: function () {
    if (Tw.BrowserHelper.isApp()) {
      this._popupService.open({
        'hbs': 'MF_06_03'
      }, $.proxy(this._goPrepay, this), null, 'pay');
    } else {
      this._goAppInfo();
    }
  },
  _goPrepay: function ($layer) {
    new Tw.MyTFareBillPrepayPay($layer, this.$title, this._maxAmount, this._name);
  },
  _autoPrepay: function () {
    if (Tw.BrowserHelper.isApp()) {
      this._historyService.goLoad('/myt-fare/bill/' + this.$title + '/auto');
    } else {
      this._goAppInfo();
    }
  },
  _autoPrepayInfo: function () {
    this._historyService.goLoad('/myt-fare/bill/' + this.$title + '/auto/info');
  },
  _openAutoPayInfo: function () {
    this._popupService.openAlert(Tw.AUTO_PAY_INFO['CONTENTS_' + this.$title.toUpperCase()], Tw.AUTO_PAY_INFO.TITLE, Tw.BUTTON_LABEL.CONFIRM);
  },
  _changeUseStatus: function (event) {
    new Tw.MyTFareBillSmallSetUse(this.$container, $(event.target));
  },
  _setPassword: function () {
    new Tw.MyTFareBillSmallSetPassword(this.$container, this.$setPasswordBtn);
  },
  _goAppInfo: function () {
    var isAndroid = Tw.BrowserHelper.isAndroid();
    this._popupService.open({
      'hbs': 'open_app_info',
      'isAndroid': isAndroid
    }, $.proxy(this._onOpenTworld, this));
  },
  _onOpenTworld: function ($layer) {
    new Tw.CommonShareAppInstallInfo($layer);
  }
};