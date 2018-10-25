/**
 * FileName: myt-join.mgmt.numchg-alarm.ext.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.22
 */
Tw.MyTJoinMgmtNumchgAlarmExt = function (rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
};

Tw.MyTJoinMgmtNumchgAlarmExt.prototype = {

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '.bt-red1', $.proxy(this._onclickBtnOk, this));
    this.$container.on('click', '.prev-step', $.proxy(this._onclickBtnCancel, this));
    this.$container.on('change', '#rbt-alramtype', $.proxy(this._onchangeUiCondition, this));
    this.$container.on('change', '#input-period', $.proxy(this._onchangeUiCondition, this));
  },

  /**
   * 신청버튼 클릭시
   * @private
   */
  _onclickBtnOk: function(){
    // 신청/변경
    // BFF_05_0182
    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    var param = {
      guidReqSvcNum : '',     // 변경전 서비스번호
      firstNumGuidStaDt : '', // 최초로 번호안내서비스 받은 일자
      wDateChargFrom : '',    // 과금시작일
      numGuidOptYn : $('#rbt-alramtype').val()  // 알림유형
    };
    // 신청/변경 : BFF_05_0182
    // 해지 : BFF_05_0183
    //this._apiService.request(Tw.API_CMD.BFF_05_0182, param)
    this._apiService.request(Tw.API_CMD.BFF_05_0150, param)
      .done($.proxy(function (resp) {

        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          skt_landing.action.loading.off({ ta: this.$container });
          return ;
        }

        skt_landing.action.loading.off({ ta: this.$container });
        // TODO
        // ok alert
        // popup close??

      }, this))
      .fail(function(err){
        Tw.Error(err.status, err.statusText).pop();
        skt_landing.action.loading.off({ ta: '#container' });
      });
  },


  /**
   * 취소버튼 클릭시
   * @private
   */
  _onclickBtnCancel: function(){
    // this popup close
  },


  /**
   * 신청 조건 변경시(기간선택, 알람유형 선택시)
   * @private
   */
  _onchangeUiCondition: function(){
    // #hdn-period 알림 기간
    // #rbt-alramtype 알림 유형
    var btnDisabled = (!$('#hdn-period').val() && !$('#rbt-alramtype').val());
    $('.bt-red1 button').attr('disabled', btnDisabled);
  }
};
