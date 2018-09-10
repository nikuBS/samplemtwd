/**
 * FileName: myt.join.product-service.fee-alarm.js
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.08.16
 */

Tw.MyTJoinProductServiceFeeAlarm = function (rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvents();
};

Tw.MyTJoinProductServiceFeeAlarm.prototype = {

  _cachedElement: function() {
    this.$btnClose = this.$container.find('.close-step');
  },

  _bindEvents: function() {
    this.$btnClose.on('click', $.proxy(this._closeStep, this));
  },

  _closeStep: function() {
    this._historyService.goBack();
  }

};