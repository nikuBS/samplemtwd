/**
 * MyT > 나의 가입 정보 > 나의 요금제 > 요금제 변경 가능일 알림 서비스
 * @file myt-join.myplan.alarm.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.10
 */

Tw.MyTJoinMyplanAlarm = function(rootEl) {
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

Tw.MyTJoinMyplanAlarm.prototype = {

  // Element 캐싱
  _cachedElement: function() {
    this.$btnAlarmApply = this.$container.find('.fe-btn_alarm_apply');  // 알림 서비스 가입
    this.$btnTerminate = this.$container.find('.fe-btn_terminate'); // 알림 서비스 해지
  },

  // 이벤트 바인딩
  _bindEvent: function() {
    this.$btnAlarmApply.on('click', $.proxy(this._alarmApply, this)); // 알림 서비스 가입 버튼 클릭시
    this.$btnTerminate.on('click', $.proxy(this._goTerminate, this)); // 알림 서비스 해지 버튼 클릭시
  },

  // 알림 서비스 가입 버튼 클릭 시
  _alarmApply: function() {
    // 가입 요청 API 요청
    this._apiService.request(Tw.API_CMD.BFF_05_0126, {})
      .done($.proxy(this._applyResult, this));
  },

  // 가입 요청 API 응답
  _applyResult: function(resp) {
    // 응답 결과 오류시
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    // 가입 완료 팝업 오픈
    this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A39.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A39.TITLE, null, $.proxy(this._goMyplan, this));
  },

  // 해지 버튼 클릭 시 해지 화면 이동 (히스토리 replace)
  _goTerminate: function() {
    this._historyService.replaceURL('/myt-join/myplan/alarmterminate');
  },

  // 가입 완료 후 나의 요금제 화면으로 back 시킴
  _goMyplan: function() {
    this._historyService.goBack();
  }

};
