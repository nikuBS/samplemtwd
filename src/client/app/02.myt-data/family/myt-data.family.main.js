/**
 * FileName: myt-data.family.main.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.01
 */

Tw.MyTDataFamilyMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilyMain.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
  }
};
