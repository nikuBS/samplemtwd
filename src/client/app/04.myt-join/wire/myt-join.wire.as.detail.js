/**
 * FileName: myt-join.wire.as.detail.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
Tw.MyTJoinWireASDetail = function (rootEl, troubleNum) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._troubleNum = troubleNum;

  this._bindEvent();
};

Tw.MyTJoinWireASDetail.prototype = {

  _troubleNum : null,

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

    this._popupService.openConfirm(
      Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A34_CONF.MSG,
      Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A34_CONF.TITLE,
      $.proxy(function(){

      this._popupService.close();

      skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });

      this._apiService.request(Tw.API_CMD.BFF_05_0150, { troubleNum: this._troubleNum })
        .done($.proxy(function (resp) {

          if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
            skt_landing.action.loading.off({ ta: '.container' });
            Tw.Error(resp.code, resp.msg).pop();
            return ;
          }

          skt_landing.action.loading.off({ ta: '.container' });

          this._popupService.openTypeA(
            Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A34.TITLE,
            Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A34.MSG,
            null,
            null,
            $.proxy(function(){
              this._historyService.goBack();
            }, this)
          );
        }, this))
        .fail(function(err){
          skt_landing.action.loading.off({ ta: '.container' });
          Tw.Error(err.status, err.statusText).pop();
        });
    },this));


  },

  /**
   * 망작업 안내 SMS알람신청 버튼 클릭시
   * @private
   */
  _onclickSmsAlarmReqBtn: function() {
    this._historyService.goLoad('/myt-join/wire/wiredo/sms');
  }
};

