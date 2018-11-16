/**
 * FileName: myt-data.prepaid.voice.auto.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.16
 */

Tw.MyTDataPrepaidVoiceAuto = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidVoiceAuto.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$wrapExampleCard = $('.fe-wrap-example-card');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    // this.$selectAmount =
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-close-example-card', $.proxy(this._onCloseExampleCard, this));
    this.$container.on('click', '.fe-btn-show-example', $.proxy(this._onShowExampleCard, this));
    this.$container.on('click', '.fe-select-amount', $.proxy(this._onShowSelectAmount, this));
    this.$container.on('click', '.fe-request-prepaid-card', $.proxy(this._onRequestPrepaidCard, this));
    this.$container.on('change', '.fe-input_credit', $.proxy(this._validateCreditCard, this));
    this.$container.on('change input blur click', '#tab1-tab [required]', $.proxy(this._validatePrepaidCard, this));
    this.$container.on('change input blur click', '#tab2-tab [required]', $.proxy(this._validateCreditCard, this));
  }
};