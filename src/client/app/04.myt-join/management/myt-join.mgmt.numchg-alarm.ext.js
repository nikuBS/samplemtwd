/**
 * FileName: myt-join.mgmt.numchg-alarm.ext.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.22
 */
Tw.MyTJoinMgmtNumchgAlarmExt = function (rootEl, options) {
  this._SVC_TYPE = {
    EXT : 'E',    // 연장
    CAN : 'C'     // 해지
  };

  this.$container = rootEl;
  this._options = options;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  $.prototype.checkedVal = function(){ return this.filter(':checked').val(); };

  this._bindEvent();
  this._onchangeUiCondition();
};

Tw.MyTJoinMgmtNumchgAlarmExt.prototype = {

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {

    this.$radioAlarmType = $('#ul-alramtype input[type=radio]');
    this.$radioSvcType = $('#ul-svctype input[type=radio]');

    this.$container.on('change', this.$radioAlarmType, $.proxy(this._onchangeUiCondition, this));
    this.$container.on('change', this.$radioSvcType, $.proxy(this._onchangeUiCondition, this));
    this.$container.on('click', '#btn-ok', $.proxy(this._onclickBtnOk, this));
  },


  /**
   * 신청 조건 변경시(기간선택, 알람유형 선택시)
   * @private
   */
  _onchangeUiCondition: function(){
    var btnDisabled = (!this.$radioSvcType.checkedVal() || !this.$radioAlarmType.checkedVal());
    $('#btn-ok').attr('disabled', btnDisabled);
  },


  /**
   * 신청버튼 클릭시
   * @private
   */
  _onclickBtnOk: function(){

    // E:연장, C:해지
    var svcType = this.$radioSvcType.checkedVal();
    var param = {};
    var svcCmd = null;

    if(svcType === this._SVC_TYPE.EXT){    // 연장
      svcCmd = Tw.API_CMD.BFF_05_0182;
      param = {
        notiType : this.$radioAlarmType.checkedVal()  // 선택 알림유형
      };

    }else if(svcType === this._SVC_TYPE.CAN){   // 해지
      svcCmd = Tw.API_CMD.BFF_05_0183;
    }

    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    // 연장/해지 call api
    this._apiService.request(svcCmd, param)
      .done($.proxy(function (resp) {

        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          skt_landing.action.loading.off({ ta: this.$container });
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        skt_landing.action.loading.off({ ta: this.$container });

        if(svcType === this._SVC_TYPE.EXT){    // 연장
          this._popupService.toast(Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.TOAST_SUC_EXT);
        }else if(svcType === this._SVC_TYPE.CAN) {   // 해지
          this._popupService.toast(Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.TOAST_SUC_CAN);
        }

        }, this))
      .fail(function(err){
        skt_landing.action.loading.off({ ta: this.$container });
        Tw.Error(err.status, err.statusText).pop();
      });
  }


};
