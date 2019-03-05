/**
 * FileName: myt-join.myplan.alarm.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.10
 */

Tw.MyTJoinMyplanAlarm = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
};

Tw.MyTJoinMyplanAlarm.prototype = {

  _cachedElement: function() {
    this.$btnAlarmApply = this.$container.find('.fe-btn_alarm_apply');
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
  },

  _bindEvent: function() {
    this.$btnAlarmApply.on('click', $.proxy(this._alarmApply, this));
    this.$btnTerminate.on('click', $.proxy(this._goTerminate, this));
  },

  _alarmApply: function() {
    this._apiService.request(Tw.API_CMD.BFF_05_0126, {})
      .done($.proxy(this._applyResult, this));
  },

  _applyResult: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A39.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A39.TITLE, null, $.proxy(this._goMyplan, this));
  },

  _goTerminate: function() {
    this._historyService.replaceURL('/myt-join/myplan/alarmterminate');
  },

  _goMyplan: function() {
    this._historyService.goBack();
  }

};
