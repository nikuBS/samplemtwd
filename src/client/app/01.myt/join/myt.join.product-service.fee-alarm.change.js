/**
 * FileName: myt.join.product-service.fee-alarm.change.js
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.08.17
 */

Tw.MyTJoinProductServiceFeeAlarmChange = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvents();
};

Tw.MyTJoinProductServiceFeeAlarmChange.prototype = {

  _cachedElement: function() {
    this.$btnBack = this.$container.find('.fe-btn_back');
    this.$btnDelete = this.$container.find('.fe-btn_delete');
    this.$btnPut = this.$container.find('.fe-btn_put');
  },

  _bindEvents: function() {
    this.$btnBack.on('click', $.proxy(this._closeStep, this));
    this.$btnDelete.on('click', $.proxy(this._delete, this));
    this.$btnPut.on('click', $.proxy(this._put, this));
  },

  _closeStep: function() {
    this._historyService.go(-2);
  },

  _delete: function() {
    this._apiService.request('BFF_05_0126', {})
      .done($.proxy(this._deletedAlarm, this));
  },

  _deletedAlarm: function() {
    //
  },

  _put: function() {
    this._apiService.request('BFF_05_0127', {})
        .done($.proxy(this._putedAlarm, this));
  },

  _putedAlarm: function() {}

};