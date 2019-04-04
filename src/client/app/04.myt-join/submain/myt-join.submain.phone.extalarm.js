/**
 * MenuName: 나의 가입정보 > 서브메인 > 번호변경 안내서비스 연장/해지 신청(MS_03_01_04)
 * @file myt-join.submain.phone.extalarm.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.22
 * Summary: 번호변경 안내서비스 연장/해지
 */
Tw.MyTJoinPhoneNumChgAlarmExt = function (rootEl, options) {
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

  this._userChanged = false;
};

Tw.MyTJoinPhoneNumChgAlarmExt.prototype = {

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {

    this.$radioAlarmType = $('#ul-alramtype input[type=radio]');
    this.$radioSvcType = $('#ul-svctype input[type=radio]');

    this.$container.on('change', this.$radioSvcType, $.proxy(this._onchangeUiCondition, this));
    this.$container.on('change', this.$radioAlarmType, $.proxy(this._onchangeUiCondition, this));
    this.$container.on('click', '#btn-ok', $.proxy(this._onclickBtnOk, this));
    this.$container.on('click', '#fe-prev-step', $.proxy(this._onclickBtnClose, this));
  },


  _onclickBtnClose: function(){
    this._historyService.goLoad('/myt-join/submain');

    //if(this._userChanged) {
    //
    //  this._popupService.openConfirmButton(
    //    Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
    //    Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
    //    $.proxy(function(){
    //      this._historyService.goLoad('/myt-join/submain');
    //    }, this),
    //    null,
    //    Tw.BUTTON_LABEL.NO,
    //    Tw.BUTTON_LABEL.YES);
    //} else {
    //  this._historyService.goBack();
    //}
  },

  /**
   * 신청 조건 변경시(기간선택, 알람유형 선택시)
   * @private
   */
  _onchangeUiCondition: function(){
    this._userChanged = true;

    if(this.$radioSvcType.checkedVal() === this._SVC_TYPE.EXT){
      $('#div-alarmtype').show().attr('aria-hidden', false);
    }else{
      $('#div-alarmtype').hide().attr('aria-hidden', true);
    }

    var btnDisabled = false;
    if(this.$radioSvcType.checkedVal() === this._SVC_TYPE.EXT){
      btnDisabled = (!this.$radioSvcType.checkedVal() || !this.$radioAlarmType.checkedVal());
    }else if(this.$radioSvcType.checkedVal() === this._SVC_TYPE.CAN){
      btnDisabled = (!this.$radioSvcType.checkedVal());
    }

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
      this._requestServices(svcCmd, param, svcType);

    }else if(svcType === this._SVC_TYPE.CAN){   // 해지
      svcCmd = Tw.API_CMD.BFF_05_0183;

      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A3.MSG,
        Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A3.TITLE,
        $.proxy(function(){
          this._popupService.close();
          this._requestServices(svcCmd, param, svcType);
        }, this),
        null,
        null,
        Tw.BUTTON_LABEL.TERMINATE
      );
    }

  },

  /**
   * service request
   * @param svcCmd
   * @param param
   * @private
   */
  _requestServices: function(svcCmd, param, svcType){

    Tw.CommonHelper.startLoading('.container', 'grey');

    // 연장/해지 call api
    this._apiService.request(svcCmd, param)
      .done($.proxy(function (resp) {
        Tw.CommonHelper.endLoading('.container');

        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          var option = {
            ico: 'type2',
            title: Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.ALERT_SVC_DISABLED.TITLE,
            contents: Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.ALERT_SVC_DISABLED.CONTENTS,
            bt: [{
              style_class: 'bt-blue1 tw-popup-closeBtn',
              txt: Tw.BUTTON_LABEL.CLOSE
            }]
          };
          this._popupService._setOpenCallback(null);
          this._popupService._addHash(null, 'disable-service');
          this._popupService._open(option);

          // this._popupService.openTypeA(
          //   Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.ALERT_SVC_DISABLED.TITLE,
          //   Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.ALERT_SVC_DISABLED.CONTENTS
          // );
          //   Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        var compTxt = null;
        if(svcType === this._SVC_TYPE.EXT){    // 연장
          // this._popupService.toast(Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.TOAST_SUC_EXT);
          compTxt = Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.TOAST_SUC_EXT;
        }else if(svcType === this._SVC_TYPE.CAN) {   // 해지
          // this._popupService.toast(Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.TOAST_SUC_CAN);
          compTxt = Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.TOAST_SUC_CAN;
        }

        // 완료화면 호출
        // Tw.Popup.afterRequestSuccess(
        //   '/myt-join/submain/phone/alarm',
        //   '/myt-join/submain',
        //   null,
        //   null,
        //   compTxt);
        this._goCompletePage({
          compPage: '/myt-join/submain/phone/extalarm/complete',
          mainTxt: '',
          subTxt: compTxt,
          confirmMovPage: '/myt-join/submain'
        });

      }, this))
      .fail(function(err){
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });
  },


  /**
   * 완료페이지로 가기
   * @param options
   * @private
   */
  _goCompletePage: function(options){
    var param = '?' +
      'confirmMovPage=' + (options.confirmMovPage||'') + '&' +
      'mainTxt=' + (options.mainTxt||'') + '&' +
      'subTxt=' + (options.subTxt||'') + '&' +
      'linkTxt=' + (options.linkTxt||'') + '&' +
      'linkPage=' + (options.linkPage||'');
    this._historyService.replaceURL(options.compPage + param);
  }



};
