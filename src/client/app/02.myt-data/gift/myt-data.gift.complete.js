/**
 * FileName: myt-data.gift.complete.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTDataGiftComplete = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGiftComplete.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
  }
};