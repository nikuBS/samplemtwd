/**
 * FileName: mmyt-fare.bill.set.complete.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018. 10. 05
 */
Tw.MyTFareBillSetComplete = function (rootEl) {
  this.$container = rootEl;
  this.$window = window;
  this._history = new Tw.HistoryService();
  this._init();
};

Tw.MyTFareBillSetComplete.prototype = {
  _init : function() {
    this._initVariables();
    this._bindEvent();
    this._complete();
  },

  _initVariables: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.complete-closeBtn', $.proxy(this._historyBack,this));
  },

  _historyBack : function () {
    this._history.goBack();
  },

  _goLoad: function (url) {
    this.$window.location.href = url;
  },

  _complete: function () {
    this._history.complete();
  }

};