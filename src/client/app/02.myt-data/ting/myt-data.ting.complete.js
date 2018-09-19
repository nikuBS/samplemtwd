/**
 * FileName: myt-data.ting.complete.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataTingComplete = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataTingComplete.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$btn_ting_close = this.$container.find('.fe-ting_close');
    this.$btn_ting_go_history = this.$container.find('.fe-ting_history');
  },

  _bindEvent: function () {
    this.$btn_ting_go_history.on('click', $.proxy(this._goHistory, this));
    this.$btn_ting_close.on('click', $.proxy(this._closeProcess, this));
  },

  _goHistory: function () {
    // TODO: Goto Ting History
    this._historyService.replaceURL();
  },

  _closeProcess: function () {
    // TODO: Goto MyTsubmain
    this._historyService.replaceURL();
  }
};