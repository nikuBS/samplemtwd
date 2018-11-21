/**
 * FileName: main.menu.refund-empty.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.16
 */

Tw.MainMenuRefundEmpty = function (rootEl) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();

  this._bindEvents();
};

Tw.MainMenuRefundEmpty.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '#fe-outlink-smartchoice', $.proxy(this._onOutToSmartChoice, this));
    this.$container.on('click', '#fe-confirm', $.proxy(this._onConfirm, this));
  },
  _onOutToSmartChoice: function () {
    var move = function () { Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.SMART_CHOICE); };

    if (Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.showDataCharge(function () {
        move();
      });
      return;
    }

    move();
  },
  _onConfirm: function () {
    this._historyService.goBack();
  }
};