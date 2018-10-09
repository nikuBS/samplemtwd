/**
 * FileName: myt.join.protect.change.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.09.28
 */
Tw.MyTJoinProtectPwdChange = function ($element, isNew) {
  this._HASH_STEP_CHECK = '#contents-check';
  this._HASH_STEP_CHANGE = '#contents-change';
  this.type = {
    SET: '20',
    CHANGE: '30'
  };

  this.$container = $element;
  this._new = (isNew === 'true');
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._inputHelper = Tw.InputHelper;
  this._historyService = new Tw.HistoryService($element);
  this._historyService.init('hash');
  this._chkedpwd = null; // checked password

  if( !this._new ){
    this._pwdCheckService = new Tw.MyTJoinProtectCheckPwdService();
    this._historyService.goHash(this._HASH_STEP_CHECK);
  } else {
    this._historyService.goHash(this._HASH_STEP_CHANGE);
  }
  this._bindEvent();
};

Tw.MyTJoinProtectPwdChange.prototype = {
  //element event bind
  _bindEvent: function () {
    $('input:password')
      .on('keyup', $.proxy(this._onKeyUp, this))
      .on('input', $.proxy(this._onPwdInput, this));
    $('.cancel').on('click', $.proxy(this._delBtnClicked, this));

    // 기존 비번 체크
    $('#btn-check').on('click', $.proxy(this._onCheckPwdBtnClicked, this));
    // 변경 혹은 설정
    $('#btn-change').on('click', $.proxy(this._onOkClicked, this));
  },

  /**
   * step1. 기존 비밀번호 확인
   * @private
   */
  _onCheckPwdBtnClicked : function (){
    this._chkedpwd = this._validatePwdInput('#pwd-input1');
    if(!this._chkedpwd) return;

    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    this._pwdCheckService.check(
      this._chkedpwd,
      $.proxy(this._onCheckPwdSuccess, this),
      $.proxy(this._onCheckPwdFail, this)
    );
    this._resetPwdInput('#pwd-input1');
  },

  /**
   * 기존 비번 확인 된 후
   * @param res - server response
   * @private
   */
  _onCheckPwdSuccess : function (res){

    // step2 ui로 변경
    this._historyService.setHistory(event);
    this._historyService.goHash(this._HASH_STEP_CHANGE);

    this._resetPwdInput('input:password');
    skt_landing.action.loading.off({ ta: this.$container });
  },

  _onCheckPwdFail : function(res, errCnt, unexpectedError){
    $('#pwd-input1').parents('.inputbox').addClass('error');
    skt_landing.action.loading.off({ ta: this.$container });
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

  /**
   * input password 키 입력시
   * @param event
   * @private
   */
  _onKeyUp: function (event) {

    // 숫자 외 다른 문자를 입력한 경우
    var value = event.target.value;
    if ( Tw.InputHelper.validateNumber(value) ) {
      event.stopPropagation();
      event.preventDefault();
      Tw.InputHelper.inputNumberOnly(event.target);
    }
  },

  /**
   * input password 입력 이벤트 처리
   *  - 확인,변경,설정 버튼 활성/비활성
   * @param event
   * @private
   */
  _onPwdInput: function (event){

    if( location.hash === '' || location.hash === this._HASH_STEP_CHECK ){

      var pwd1 = $('#pwd-input1').val();
      $('#btn-check').prop('disabled', (pwd1.length < 6));

    } else if( location.hash === this._HASH_STEP_CHANGE ){
      if( !this._new && !this._chkedpwd ){  // 변경이고, 기존비번이 확인되지 않은 경우 버튼 비활성
        $('#btn-change').prop('disabled', true);
        return;
      }

      var pwd1 = $('#pwd-input2').val();
      var pwd2 = $('#pwd-input3').val();
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
      return null;
    }
    // 1차 6자리 이상인지 확인 (6자리 미만인 경우 알림)
    if ( pwd.length < 6 ) {
      // 숫자만 입력가능하기때문에 length 로 비교
      this._popupService.openAlert(Tw.MSG_MYT.JOIN_SERVICE.EMPTY_PWD, Tw.POPUP_TITLE.NOTIFY);
      return null;
    }
    return pwd;
  },

  /**
   * step2. 변경 혹은 설정
   * @private
   */
  _onOkClicked: function (/*event*/) {

    // 변경인 경우 비번인증에 성공하지 않았다면 다시 check 화면으로 돌아간다.
    if( !this._new && !this._chkedpwd ){
      this._historyService.setHistory(event);
      this._historyService.goHash(this._HASH_STEP_CHECK);
      return;
    }

    var orgPwd = this._validatePwdInput('#pwd-input2');
    var checkPwd = this._validatePwdInput('#pwd-input3');

    if( !orgPwd || !checkPwd ) return;

    // 비밀번호 입력과 확인이 다른 경우
    if ( orgPwd !== checkPwd ) {
      $('#pwd-input2').parents('.inputbox').addClass('error');
      $('#pwd-input3').parents('.inputbox').addClass('error');
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
      data.svcPwd = this._chkedpwd; // 변경
    }

    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });
    this._apiService
      .request(api, data)
      .done($.proxy(this._onApiSuccess, this))
      .fail($.proxy(this._onApiError, this));
  },

  /**
   * 변경/설정 처리 완료시
   * @param params
   * @private
   */
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
      skt_landing.action.loading.off({ ta: this.$container });
    }
  },

  _onApiError: function (params) {
    // API 호출 오류
    //Tw.Logger.warn(params);
    //var errMsg = params.code + ' ' + (params.msg || params.error && params.error.msg);
    //this._popupService.openAlert(errMsg, Tw.POPUP_TITLE.NOTIFY);
    Tw.Error(params.code, params.msg).pop();
    skt_landing.action.loading.off({ ta: this.$container });
  }


};