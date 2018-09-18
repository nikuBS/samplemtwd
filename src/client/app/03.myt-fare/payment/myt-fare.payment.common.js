/**
 * FileName: myt-fare.payment.common.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 */

Tw.MyTFarePaymentCommon = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePaymentCommon.prototype = {
  _init: function () {
    this._bindEvent();
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-change-line', $.proxy(this._openChangeLine, this));
  },
  _openChangeLine: function () {

  }
};