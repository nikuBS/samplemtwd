/**
 * MenuName: 나의 가입정보 > 서브메인 > 010 전환 번호변경(MS_03_02)
 * FileName: myt-join.submain.numchange-search.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.11.26
 * Summary: 010 전환 번호변경 화면에서 다른 번호 찾기
 */
Tw.MyTJoinPhoneNumChangeSearch = function (rootEl, listItemTmpl, selCallback) {
  this.$container = $(rootEl);
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._selCallback = selCallback;

  this._bindEvent();
  this._listItemTmpl = listItemTmpl;
};

Tw.MyTJoinPhoneNumChangeSearch.prototype = {

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('input', 'input[type=number]', $.proxy(this._oninputNumber, this));
    this.$container.on('click', '#btnNumSearch', $.proxy(this._onclickSchNums, this));
    this.$container.on('click', '#btnSel', $.proxy(this._onclickBtnSel, this));
    this.$container.on('click', '.bt-more', $.proxy(this._showMorePhoneNum, this));
    this.$container.on('change', '.select-list .radiobox input', $.proxy(this._onchangeUiCondition, this));
    this.$container.on('click', '.prev-step', $.proxy(this._close, this));
    //$('#inputNum1').on('change', $.proxy(this._onchangeInputCondition, this));
    //$('#inputNum2').on('change', $.proxy(this._onchangeInputCondition, this));

    new Tw.InputFocusService(this.$container, $('#btnNumSearch button'));
  },

  /**
   * 번호검색입력시
   * @param event
   * @private
   */
  _oninputNumber: function(event){
    var input = event.currentTarget;
    Tw.InputHelper.inputNumberOnly(input);
    var maxLenght = 4;
    if (input.value.length > maxLenght){
      input.value = input.value.slice(0, maxLenght);
    }
  },

  /**
   * 010번호찾기 클릭시
   * @private
   */
  _onclickSchNums: function(){

    var param = {
      gubun: 'S',
      lineNum1: $('#inputNum1').val(),
      lineNum2: $('#inputNum2').val()
    };

    if(!param.lineNum1 || param.lineNum1.length !== 4 || !param.lineNum2 || param.lineNum2.length !== 4){
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_V29);
      //this._popupService.toast('번호를 4자리로 입력해 주십시오.');
      return;
    }
    if(parseInt(param.lineNum1, 10) > parseInt(param.lineNum2, 10)){
      // 2-V13 번호 뒷자리가 앞자리보다 높습니다.
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_V14);
      //this._popupService.toast('번호 앞자리가 뒷자리보다 높습니다.');
      return;
    }
    if(parseInt(param.lineNum2, 10) - parseInt(param.lineNum1, 10) > 100){
      // 2-V13 번호 조회범위는 100을 넘을 수 없습니다.
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_V13);
      //this._popupService.toast('번호 조회범위는 100을 넘을 수 없습니다.');
      return;
    }

    Tw.CommonHelper.startLoading('.container', 'grey');

    // 변경할 번호 search
    this._apiService.request(Tw.API_CMD.BFF_05_0184, param)
      .done($.proxy(function (resp) {

        Tw.CommonHelper.endLoading('.container');
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        $('.select-list').html('');
        this._lastSeq = 0;
        this._list = resp.result.numSearchInfoList;
        if( this._list && this._list.length > 0 ){
          $('#divNumList').show().attr('aria-hidden', false);
        }

        this._showMorePhoneNum();
        this._onchangeUiCondition();
      }, this))
      .fail(function(err){
        Tw.Error(err.status, err.statusText).pop();
        Tw.CommonHelper.endLoading('.container');
      });
  },

  /**
   * 목록 더 보기
   * @private
   */
  _showMorePhoneNum: function(){

    this._lastSeq = this._lastSeq || 0;
    var listLimit = 20;
    var sttNo = this._lastSeq;
    var endNo = this._lastSeq + listLimit;
    if(endNo > this._list.length){
      endNo = this._list.length;
    }

    $('.radiobox').unbind('click');

    var html = '';
    for(var i = sttNo; i < endNo; i++){
      html += this._listItemTmpl(this._list[i]);
    }
    $('.select-list').append(html);

    skt_landing.widgets.widget_radio('.select-list');

    this._lastSeq = endNo;
    this._showOrHideMoreBtn();
  },

  /**
   * 선택버튼 클릭시
   * @private
   */
  _onclickBtnSel: function(){
    var selVal = $('.select-list .radiobox.checked input').val();
    this._selCallback(selVal);
  },

  /**
   * 신청 조건 변경시(기간선택, 알람유형 선택시)
   * @private
   */
  _onchangeUiCondition: function(){
    var btnDisabled = ($('.select-list .radiobox.checked').length === 0);
    $('.bt-red1 button').attr('disabled', btnDisabled);
  },

  /*
   * input 입력에 따른 검색버튼 활성/비활성
   * @private
  _onchangeInputCondition: function(){
    var btnDisabled = !($('#inputNum1').val() && $('#inputNum1').val().length === 4
    && $('#inputNum2').val() && $('#inputNum2').val().length === 4);
    $('#btnNumSearch button').attr('disabled', btnDisabled);
  },
    */

  /**
   * 더보기 버튼 보이김/숨기기
   * @private
   */
  _showOrHideMoreBtn: function(){
    if( !this._list || this._list.length === 0 || !this._lastSeq || this._lastSeq >= this._list.length){
      $('.bt-more').hide().attr('aria-hidden', true);
    } else {
      $('.bt-more').show().attr('aria-hidden', false);
    }
  },


  _close: function(){
    this._popupService.close();

    //if($('#inputNum1', this.$container).val()
    //  || $('#inputNum2', this.$container).val()
    //  || $('.select-list .radiobox.checked input').val()){
    //
    //  this._popupService.openConfirmButton(
    //    Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
    //  //  Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
    //    $.proxy(function(){
    //      this._popupService.closeAll();
    //    }, this),
    //    null,
    //    Tw.BUTTON_LABEL.NO,
    //    Tw.BUTTON_LABEL.YES);
    //} else {
    //  this._popupService.close();
    //}

  }
};
