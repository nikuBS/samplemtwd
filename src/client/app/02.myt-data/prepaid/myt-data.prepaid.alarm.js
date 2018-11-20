/**
 * FileName: myt-data.prepaid.alarm.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.19
 */

Tw.MyTDataPrepaidAlarm = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidAlarm.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
  },

  _bindEvent: function () {
  }
};