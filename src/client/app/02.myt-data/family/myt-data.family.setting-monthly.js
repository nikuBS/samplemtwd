/**
 * FileName: myt-data.family.setting-monthly.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTDataFamilySettingMonthly = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilySettingMonthly.prototype = {
  _init: function () {
  },

  _cachedElement: function () {

  },

  _bindEvent: function () {

  }
};
