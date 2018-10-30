/**
 * FileName: myt-join.mgmt.numchg-alarm.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.22
 */
Tw.MyTJoinMgmtNumchgAlarm = function (rootEl, options) {
  this.$container = rootEl;
  this._options = options;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._ATTR_DATA_PRD = 'data-prd';

  this._bindEvent();
};

Tw.MyTJoinMgmtNumchgAlarm.prototype = {

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
    $layer.one('click', '.condition', $.proxy(this._setSelectedValue, this, $target));
    $layer.find('['+this._ATTR_DATA_PRD+'=' + $target.attr(this._ATTR_DATA_PRD) + ']').addClass('checked');
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
    var btnDisabled = (!this.$inputPrd.val() || !this.$radioAlarmType.val());
    $('.bt-red1 button').attr('disabled', btnDisabled);
  },


  /**
   * 신청버튼 클릭시
   * @private
   */
  _onclickBtnOk: function(){

    var param = {
      guidReqSvcNum : this._options.guidReqSvcNum,     // 변경전 서비스번호
      firstNumGuidStaDt : this._options.firstNumGuidStaDt, // 최초로 번호안내서비스 받은 일자
      wDateChargFrom : this._options.wDateChargFrom,    // 과금시작일
      period : this.$inputPrd.val(),    // 선택 기간
      numGuidOptYn : this.$radioAlarmType.val()  // 선택 알림유형
    };

    // 선택 기간 validation
    if( !param.period ){
      return;
    }
    // 선택 알람 유형 validation
    if( !param.numGuidOptYn ){
      return;
    }

    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });
    // 신청/변경 call api
    this._apiService.request(Tw.API_CMD.BFF_05_0182, param)
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
        skt_landing.action.loading.off({ ta: this.$container });
      });
  }


};
