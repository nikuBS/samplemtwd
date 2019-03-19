/**
 * MyT > 나의 가입정보 > 나의 요금제 > 요금제 변경 가능일 알림 서비스 해지
 * FileName: myt-join.myplan.alarmterminate.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.10
 */

Tw.MyTJoinMyplanAlarmterminate = function(rootEl) {
  // 컨테이너 레이어 설정
  this.$container = rootEl;

  // 공통 모듈 설정
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();
};

Tw.MyTJoinMyplanAlarmterminate.prototype = {

  _cachedElement: function() {
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$btnBack = this.$container.find('.fe-btn_back');
  },

  _bindEvent: function() {
    this.$btnTerminate.on('click', $.proxy(this._alarmTerminate, this));
    this.$btnBack.on('click', $.proxy(this._replaceAlarm, this));
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
      Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A40.TITLE, null, $.proxy(this._replaceMyplan, this));
  },

  _replaceAlarm: function() {
    this._historyService.replaceURL('/myt-join/myplan/alarm');
  },

  _replaceMyplan: function() {
    this._historyService.replaceURL('/myt-join/myplan');
  }

};
