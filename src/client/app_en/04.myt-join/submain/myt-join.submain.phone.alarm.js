/**
 * MenuName: 나의 가입정보 > 서브메인 > 번호변경 안내서비스 신청(MS_03_01_03)
 * @file myt-join.submain.phone.alarm.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.22
 * Summary: 번호변경 안내서비스 신청
 */
Tw.MyTJoinPhoneNumChgAlarm = function (rootEl, options) {
  this.$container = rootEl;
  this._options = options;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  $.prototype.checkedVal = function(){ return this.filter(':checked').val(); };

  this._ATTR_DATA_PRD = 'data-prd';

  this._bindEvent();
};

Tw.MyTJoinPhoneNumChgAlarm.prototype = {

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {

    this.$radioAlarmType = $('#ul-alramtype input[type=radio]');
    this.$inputPrd = $('#input-prd');

    this.$container.on('change', this.$radioAlarmType, $.proxy(this._onchangeUiCondition, this));
    this.$container.on('click', '#btn-period', $.proxy(this._onclickBtnPrd, this));
    this.$container.on('click', '#btn-ok', $.proxy(this._onclickBtnOk, this));
    this.$container.on('click', '#fe-prev-step', $.proxy(this._onclickBtnClose, this));
  },

  _onclickBtnClose: function(){
    this._historyService.goLoad('/myt-join/submain');

    //if(this.$inputPrd.val() || this.$radioAlarmType.checkedVal()) {
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
   * 알림 기간 선택 버튼 클릭
   * @private
   */
  _onclickBtnPrd: function(event){
    var $target = $(event.currentTarget);

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TPL.JOIN_INFO_MGMT_PERIOD.title,
      data: Tw.POPUP_TPL.JOIN_INFO_MGMT_PERIOD.data
    }, $.proxy(this._selectPopupCallback, this, $target));
  },

  _selectPopupCallback: function ($target, $layer) {
    $layer.one('click', 'li button', $.proxy(this._setSelectedValue, this, $target));
    $layer.find('['+this._ATTR_DATA_PRD+'=' + $target.attr(this._ATTR_DATA_PRD) + ']').addClass('checked')
      .find(' input[type=radio]').prop('checked', true);
  },

  /**
   * 기간 선택 완료시
   * @param $target
   * @param event
   * @private
   */
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    var prd = $selectedValue.attr(this._ATTR_DATA_PRD);
    $target.attr(this._ATTR_DATA_PRD, prd);
    $target.text($selectedValue.text());
    this.$inputPrd.val(prd);
    this._popupService.close();
    this._onchangeUiCondition();
  },


  /**
   * 신청 조건 변경시(기간선택, 알람유형 선택시)
   * @private
   */
  _onchangeUiCondition: function(){
    var btnDisabled = (!this.$inputPrd.val() || !this.$radioAlarmType.checkedVal());
    $('.bt-red1 button').attr('disabled', btnDisabled);
  },


  /**
   * 신청버튼 클릭시
   * @private
   */
  _onclickBtnOk: function(){
    var prod = this.$inputPrd.val();
    var notiEndDt = new Date();
    notiEndDt.setMonth(notiEndDt.getMonth() + parseInt(prod, 10));

    var param = {
      notiEndDt : Tw.DateHelper.getShortDateWithFormat(notiEndDt, 'YYYYMMDD'),
      notiType : this.$radioAlarmType.checkedVal()  // 선택 알림유형
    };

    // 선택 기간, 선택 알람 유형 validation
    if( !param.notiEndDt || !param.notiType ){
      return;
    }

    Tw.CommonHelper.startLoading('.container', 'grey');
    // 신청/변경 call api
    this._apiService.request(Tw.API_CMD.BFF_05_0182, param)
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

        // 완료화면 호출
        // Tw.Popup.afterRequestSuccess(
        //   '/myt-join/submain/phone/alarm',
        //   '/myt-join/submain',
        //   null,
        //   null,
        //   Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.TOAST_SUC_REG);
        this._goCompletePage({
          compPage: '/myt-join/submain/phone/alarm/complete',
          mainTxt: '',
          subTxt: Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.TOAST_SUC_REG,
          confirmMovPage: '/myt-join/submain'
        });

        // this._popupService.toast(Tw.MYT_JOIN_MGMT_NUMCHG_ALARM.TOAST_SUC_REG);

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
