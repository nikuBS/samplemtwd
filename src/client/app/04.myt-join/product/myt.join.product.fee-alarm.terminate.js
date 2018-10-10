/**
 * FileName: myt.join.product.fee-alarm.terminate.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.10
 */

Tw.MyTJoinProductFeeAlarmTerminate = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
};

Tw.MyTJoinProductFeeAlarmTerminate.prototype = {

  _cachedElement: function() {
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
  },

  _bindEvent: function() {
    this.$btnTerminate.on('click', $.proxy(this._alarmTerminate, this));
  },

  _alarmTerminate: function() {
    this._apiService.request(Tw.API_CMD.BFF_05_0127, {}, {})
      .done($.proxy(this._alarmTerminateResult, this));
  },

  _alarmTerminateResult: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A40.MSG,
      Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A40.TITLE, null, $.proxy(this._resultPopupClose, this));
  },

  _resultPopupClose: function() {
    this._historyService.replaceURL('/myt/join/product/fee-alarm');
  }

};
