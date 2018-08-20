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
    this.$btnClose = this.$container.find('.fe-btn_close');
    this.$btnAction = this.$container.find('.fe-btn_action');
  },

  _bindEvents: function() {
    this.$btnClose.on('click', $.proxy(this._close, this));
    this.$btnAction.on('click', 'button', $.proxy(this._procAction, this));
  },

  _close: function() {
    this._historyService.go(-2);
  },

  _procAction: function(e) {
    switch ($(e.currentTarget).data('action')) {
      case 'back': this._historyService.goBack(); break;
      case 'delete': this._delete(); break;
      case 'put': this._put(); break;
    }
  },

  _delete: function() {
    this._apiService.request('BFF_05_0126', {})
      .done($.proxy(this._deletedAlarm, this));
  },

  _deletedAlarm: function() {
  },

  _put: function() {
    this._apiService.request('BFF_05_0127', {})
        .done($.proxy(this._putedAlarm, this));
  },

  _putedAlarm: function() {}

};