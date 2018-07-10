/**
 * FileName: recharge.cookiz.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeCookiz = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._cachedElement();
  this._bindEvent();
  this._init();
};


Tw.RechargeCookiz.prototype = {
  _init: function () {

  },

  _cachedElement: function () {
    this.$container.on('click', '.btn_go_history', $.proxy(this._goHistory, this));
    this.$container.on('click', '.btn_go_cookiz_process', $.proxy(this._goCookizProcess, this));
    this.$container.on('click', '.btn_cancel_autoRefill', $.proxy(this._cancelAutoRefill, this));
  },

  _bindEvent: function () {

  },

  _cancelAutoRefill: function () {

  },

  _goCookizProcess: function () {
    this._go('#step1');
  },

  _goHistory: function () {
    this._goLoad('/recharge/cookiz/history');
  },

  _goLoad: function (url) {
    location.href = url;
  },

  _go: function (hash) {
    window.location.hash = hash;
  }
};
