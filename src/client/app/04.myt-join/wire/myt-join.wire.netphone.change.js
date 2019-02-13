/**
 * FileName: myt-join.wire.netphone.change.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
Tw.MyTJoinWireInetPhoneNumChange = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
};

Tw.MyTJoinWireInetPhoneNumChange.prototype = {
  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    $('#btnSearch').click($.proxy(this._requestData, this));
    $('#inputReqPhone').on('keyup', $.proxy(this._onKeyUp, this));
    $('#inputReqPhone').on('blur', $.proxy(this._onBlurInputPhone, this));
    $('.inputbox .cancel').click($.proxy(this._onclickInputDel, this));
  },


  /**
   * 전화번호 입력 창에 포커스 아웃시
   * @param event
   * @private
   */
  _onBlurInputPhone: function(event){
    $('#span-no-phonenum').hide();
    $('#span-not-phonenum').hide();

    if(!$(event.target).val()){
      $('#span-no-phonenum').show();
    }
    if(!_isPhoneNum($(event.target).val())){
      $('#span-not-phonenum').show();
    }
  },

  /**
   * input password 키 입력시
   * @param event
   * @private
   */
  _onKeyUp: function (event) {

    // 숫자 외 다른 문자를 입력한 경우
    var $input = $(event.target);
    var value = $input.val();
    var reg = /[^0-9-]/g;

    if( reg.test(value) ){
      event.stopPropagation();
      event.preventDefault();
      $input.val(value.replace(reg, ''));
    }

    this._resetPhoneNum($input);

    // 전화번호 체크
    if ( this._isPhoneNum($input.val()) ) {
      $('.inputbox').removeClass('error');
      $('#btnSearch button').removeAttr('disabled');
    } else {
      if( !$('.inputbox').hasClass('error') ){
        $('.inputbox').addClass('error');
      }
      $('#btnSearch button').attr('disabled', true);
    }
  },

  _onclickInputDel: function(/*event*/){
    //$('#inputReqPhone').val('');
    $('.inputbox').removeClass('error');
    $('#btnSearch button').attr('disabled', true);
    $('#span-not-phonenum').hide();
  },

  _isPhoneNum: function(val){
    return Tw.ValidationHelper.isTelephone(val);
  },

  _resetPhoneNum: function($input){
    var value = $input.val();
    $('#span-not-phonenum').hide();
    // if(value.length >= 4 && value.indexOf('-') === -1){
    //   $input.val(value + '-');
    // }
    // if(value.length === 8 && value.lastIndexOf('-') === 3){
    //   $input.val(value + '-');
    // }
    if(value.length >= 9){
      value = value.replace(/-/g, '');
      value = value.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/, '$1-$2-$3');
      $('input').val(value);

      if( !Tw.ValidationHelper.isTelephone(value) ){
        $('#span-not-phonenum').show();
      }
    }

  },

  /**
   * 번호이동 신청 조회
   * @private
   */
  _requestData: function() {

    $('.process-list').hide();
    //$('.process-list li').removeClass('complete');
    $('.process-list li').removeClass('off').addClass('off');

    var phNum = $('input').val();

    if ( !this._isPhoneNum(phNum) ) {
      // this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.A1);
      return;
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_05_0164, {phoneNum: phNum})
      .done($.proxy(function (resp) {

        if( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result){
          Tw.CommonHelper.endLoading('.container');
          Tw.Error(resp.code, resp.msg).pop();
          return;
        }
        Tw.CommonHelper.endLoading('.container');

        var code = resp.result.wnpOperStCd;

        // 번호에 대한 결과를 찾을 수 없는 경우
        if( code === 'NA' ) {
          this._popupService.openAlert(
            Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A33.MSG,
            Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A33.TITLE);
          return;
        }

        /* CODE
        01	접수	번호이동 접수
        10	처리중	번호이동 처리중
        00	완료	번호이동 성공
        90	실패	번호이동 실패/취소
        20	반송	번호이동 처리중취소/반송
        NA	결과값없음	해당 번호로 조회한 결과값이 없음
        */
        var compIdx = -1;
        if( code === '01' ){
          compIdx = 0;
        } else if( code === '10' ){
          compIdx = 1;
        } else if( code === '00' || code === '90' || code === '20' ){
          compIdx = 2;
        }
        if ( compIdx >= 0 ) {
          $('.process-list').show();
          $('.process-list li').each(function(idx){
            if( idx <= compIdx ){
              // $(this).addClass('complete');
              $(this).removeClass('off');
            }
          });
        }
      }, this))
      .fail(function (err) {
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText);
      });

  }

};