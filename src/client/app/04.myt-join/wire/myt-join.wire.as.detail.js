/**
 * FileName: myt-join.wire.as.detail.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
Tw.MyTJoinWireASDetail = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
};

Tw.MyTJoinWireASDetail.prototype = {
  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    $('#btnCancel').click($.proxy(this._onclickAsReqCancelBtn, this));
    $('#btnAlarmReq').click($.proxy(this._onclickSmsAlarmReqBtn, this));
  },

  /**
   * 신청취소버튼 클릭시
   * @private
   */
  _onclickAsReqCancelBtn: function() {
    console.log('== 신청취소 == click');

    //2_A34 alert '장애 A/S 신청이 취소되었습니다.'
  },

  /**
   * 망작업 안내 SMS알람신청 버튼 클릭시
   * @private
   */
  _onclickSmsAlarmReqBtn: function() {
    console.log('== 망작업 안내 SMS알람신청 == click');
    this._historyService.goLoad('#');
  }
};

