/**
 * FileName: myt.join.protect.change.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.24
 */
Tw.MyTJoinProtectPwdChange = function ($element, isNew) {
  this.STEP1 = 1; // 비밀번호 확인 단계(기존 비번 있는 경우)
  this.STEP2 = 2; // 비밀번호 변경/설정 단계
  this.type = {
    SET: '20',
    CHANGE: '30'
  };

  this.$container = $element;
  this._new = (isNew === 'true');
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._inputHelper = Tw.InputHelper;
  this._historyService = new Tw.HistoryService();
  if( this._new ){
    this.step = this.STEP2;
  }else {
    this.step = this.STEP1;
    this._pwdCheckService = new Tw.MyTJoinProtectCheckPwdService();
  }
  this._bindEvent();
};

Tw.MyTJoinProtectPwdChange.prototype = {
  //element event bind
  _bindEvent: function () {
    $('input:password').on('keyup', $.proxy(this._onKeyUp, this));
    $('input:password').on('input', $.proxy(this._onPwdInput, this));
    $('.cancel').on('click', $.proxy(this._delBtnClicked, this));

    // 기존 비번 체크
    this.$container.on('click', '#btn-check', $.proxy(this._onCheckPwdBtnClicked, this));
    // 변경 혹은 설정
    this.$container.on('click', '#btn-change', $.proxy(this._onOkClicked, this));

  },



  /**
   * step1. 기존 비밀번호 확인
   * @private
   */
  _onCheckPwdBtnClicked : function (){
    var pwd = this._validatePwdInput('#pwd-input1');
    if(!pwd) return;

    this._pwdCheckService.check(
      pwd,
      $.proxy(this._onCheckPwdSuccess, this),
      $.proxy(this._onCheckPwdFail, this)
    );
    this._resetPwdInput('#pwd-input1 input');
  },

  /**
   * 기존 비번 확인 된 후
   * @param res - server response
   * @private
   */
  _onCheckPwdSuccess : function (res){
    // step2 ui로 변경
    $(".pwd-step1").hide();
    $(".pwd-step2").show();
    this.step = this.STEP2;
    this._resetPwdInput('input:password');
  },

  _onCheckPwdFail : function(res, errCnt, unexpectedError){
    $('#pwd-input1').parents('.inputbox').addClass('error');
  },

  /**
   * input 안에 있는 지우기 버튼 클릭시
   * @param event
   * @private
   */
  _delBtnClicked : function(event){
    this._resetPwdInput($(event.target).prev('input'));
  },

  /**
   * pwd input field reset
   * @param inputSelector
   * @private
   */
  _resetPwdInput : function (inputSelector){
    $(inputSelector).val('');
    this._onPwdInput();
  },


  _onKeyUp: function (event) {
    // 숫자 외 다른 문자를 입력한 경우
    var value = event.target.value;
    if ( Tw.InputHelper.validateNumber(value) ) {
      event.stopPropagation();
      event.preventDefault();
      Tw.InputHelper.inputNumberOnly(event.target);
    }
  },

  _onPwdInput: function (event){

    // 확인,변경,설정 버튼 활성/비활성
    if( this.step === this.STEP1 ){
      var pwd1 = $('#pwd-input1').val();
      $('#btn-check').prop('disabled', (pwd1.length < 6));

    } else if( this.step === this.STEP2 ){
      var pwd1 = $('#pwd-input1').val();
      var pwd2 = $('#pwd-input2').val();
      $('#btn-change').prop('disabled', (pwd1.length < 6 || pwd2.length < 6));
    }

    $('input:password').parents('.inputbox').removeClass('error');

  },

  /**
   * pwd input validation 체크
   * @param inputSelector - 체크할 input field css selector
   * @returns {*} - password || null(validation fail)
   * @private
   */
  _validatePwdInput : function(inputSelector) {
    // 비밀번호 확인
    var $input = $(inputSelector);
    var pwd = $input.val();

    // 비밀번호 입력란에 아무것도 없을 때
    if ( pwd.length === 0 ) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.AUTO_A04, Tw.POPUP_TITLE.NOTIFY);
      $input.focus();
      return null;
    }
    // 1차 6자리 이상인지 확인 (6자리 미만인 경우 알림)
    if ( pwd.length < 6 ) {
      // 숫자만 입력가능하기때문에 length 로 비교
      this._popupService.openAlert(Tw.MSG_MYT.JOIN_SERVICE.EMPTY_PWD, Tw.POPUP_TITLE.NOTIFY);
      $input.focus();
      return null;
    }
    return pwd;
  },

  /**
   * step2. 변경 혹은 설정
   * @private
   */
  _onOkClicked: function (/*event*/) {

    var orgPwd = this._validatePwdInput('#pwd-input1');
    var checkPwd = this._validatePwdInput('#pwd-input2');

    if( !orgPwd || !checkPwd ) return;

    // 비밀번호 입력과 확인이 다른 경우
    if ( orgPwd !== checkPwd ) {
      this._popupService.openAlert(Tw.MSG_MYT.JOIN_SERVICE.FAIL_PWD, Tw.POPUP_TITLE.NOTIFY);
      return;
    }

    // Call API
    // var api = /*this._new ? Tw.API_CMD.BFF_05_0069 :*/ Tw.API_CMD.BFF_05_0070;
    var pwd = orgPwd;
    var api = Tw.NODE_CMD.CHANGE_SVC_PASSWORD;
    var data = {
      // 20:설정, 30:변경,
      chgCd: this._new ? this.type.SET : this.type.CHANGE, // 필수 값
      svcChgPwd: pwd // 변경, 설정
    };
    if ( !this._new ) {
      // 변경인 경우
      data.svcPwd = pwd; // 변경
    }
    this._apiService
      .request(api, data)
      .done($.proxy(this._onApiSuccess, this))
      .fail($.proxy(this._onApiError, this));
  },


  _onApiSuccess: function (params) {
    Tw.Logger.info(params);
    if ( params.code === Tw.API_CODE.CODE_00 ) {
      var msgObj = this._new ? Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A64 : Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A62;
      this._popupService.openAlert(msgObj.MSG, msgObj.TITLE, null, $.proxy(function(){
        this._historyService.goLoad('/myt/join/join-info');
      }, this));
    }
    else {
      //var errMsg = params.code + ' ' + (params.msg || params.error && params.error.msg);
      //this._popupService.openAlert(errMsg, Tw.POPUP_TITLE.NOTIFY);
      Tw.Error(params.code, params.msg).pop();
    }
  },

  _onApiError: function (params) {
    // API 호출 오류
    //Tw.Logger.warn(params);
    //var errMsg = params.code + ' ' + (params.msg || params.error && params.error.msg);
    //this._popupService.openAlert(errMsg, Tw.POPUP_TITLE.NOTIFY);
    Tw.Error(params.code, params.msg).pop();
  }


};