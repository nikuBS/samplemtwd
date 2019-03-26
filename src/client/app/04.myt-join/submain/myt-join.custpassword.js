/**
 * MenuName: 나의 가입정보 > 서브메인 > 고객보호 비밀번호 설정/변경(MS_01_01_01)
 * FileName: myt-join.custpassword.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.09.28
 * Summary: 고객 비밀번호 설정/변경
 */
Tw.MytJoinCustpassword = function ($element, isNew) {
  this._HASH_STEP_CHECK = '#check';
  this._HASH_STEP_CHANGE = '#change';
  this.type = {
    SET: '20',    // 설정
    CHANGE: '30'  // 변경
  };

  this.$container = $element;
  this._new = (isNew === 'true');
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._inputHelper = Tw.InputHelper;
  this._historyService = new Tw.HistoryService($element);
  this._tidLanding = new Tw.TidLandingComponent();
  this._historyService.init('hash');
  this._chkedpwd = null; // checked password
  this._currentHash = '';

  if( !this._new ){
    this._pwdCheckService = new Tw.MytJoinCustpasswordCheck();
    this._historyService.goHash(this._HASH_STEP_CHECK);
    this._currentHash = this._HASH_STEP_CHECK;
  } else {
    this._historyService.goHash(this._HASH_STEP_CHANGE);
    this._currentHash = this._HASH_STEP_CHANGE;
  }
  this._bindEvent();
};

Tw.MytJoinCustpassword.prototype = {
  //element event bind
  _bindEvent: function () {
    $('input[type="number"]')
      .on('keyup', $.proxy(this._onKeyUp, this))
      .on('keydown', $.proxy(this._onKeyDown, this))
      .on('input', $.proxy(this._onPwdInput, this));
    $('.cancel').on('click', $.proxy(this._delBtnClicked, this));

    // 기존 비번 체크
    $('#btn-check').on('click', $.proxy(this._onCheckPwdBtnClicked, this));
    // 변경 혹은 설정
    $('#btn-change').on('click', $.proxy(this._onOkClicked, this));
    // 취소버튼
    // $('.prev-step').on('click', $.proxy(this._onclickBtnCancel, this));
    $('.prev-step').on('click', $.proxy(this._confirmBack, this));

    new Tw.InputFocusService($('#change'), $('#btn-change'));
    new Tw.InputFocusService($('#check'), $('#btn-check'));
  },

  /**
   * step1. 기존 비밀번호 확인
   * @private
   */
  _onCheckPwdBtnClicked : function (){
    this._chkedpwd = this._validatePwdInput('#pwd-input1');
    if(!this._chkedpwd) return;

    Tw.CommonHelper.startLoading(this._currentHash, 'grey');

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
  _onCheckPwdSuccess : function (/*res*/){

    // step2 ui로 변경
    this._historyService.setHistory(event);
    this._historyService.goHash(this._HASH_STEP_CHANGE);
    this._currentHash = this._HASH_STEP_CHANGE;

    this._resetPwdInput('input:password');
    Tw.CommonHelper.endLoading(this._currentHash);
  },

  _onCheckPwdFail : function(/*res, errCnt, unexpectedError*/){
    $('#pwd-input1').parents('.inputbox').addClass('error');
    Tw.CommonHelper.endLoading(this._currentHash);
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
   * android 4.1.2 input:password 버그로 인해 태그에 maxlength를 지정하지 않고 이 함수에서 체크함
   * @param event
   * @returns {*}
   * @private
   */
  _onKeyDown: function (event){
    if(event.target.value && event.target.value.length > 6){
      if ( event.preventDefault ) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
      return false;
    }
    return Tw.InputHelper.inputNumKeyDown(event);
  },

  _checkPwdLeng: function(target){
    if($(target).val() && $(target).val() > 6){
      $(target).val($(target).val().substr(0,6));
    }
  },

  /**
   * input password 키 입력시
   * @param event
   * @private
   */
  _onKeyUp: function (event) {
    if(!event) return;

    // 숫자 외 다른 문자를 입력한 경우
    var value = event.target.value;
    if ( Tw.InputHelper.validateNumber(value) ) {
      //event.stopPropagation();
      //event.preventDefault();
      Tw.InputHelper.inputNumberOnly(event.target);
    }
    this._checkPwdLeng(event.target);
  },

  /**
   * input password 입력 이벤트 처리
   *  - 확인,변경,설정 버튼 활성/비활성
   * @param event
   * @private
   */
  _onPwdInput: function (event){
    this._onKeyUp(event);

    if( this._currentHash === '' || this._currentHash === this._HASH_STEP_CHECK ){

      var pwd1 = $('#pwd-input1').val();
      $('#btn-check').prop('disabled', (pwd1.length < 6));

    } else if( this._currentHash === this._HASH_STEP_CHANGE ){
      if( !this._new && !this._chkedpwd ){  // 변경이고, 기존비번이 확인되지 않은 경우 버튼 비활성
        $('#btn-change').prop('disabled', true);
        return;
      }

      var pwd21 = $('#pwd-input2').val();
      var pwd22 = $('#pwd-input3').val();
      $('#btn-change').prop('disabled', (pwd21.length < 6 || pwd22.length < 6));
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
      this._popupService.openAlert(Tw.MYT_JOIN_CUSTPASS.AUTO_A04, Tw.POPUP_TITLE.NOTIFY);
      return null;
    }
    // 1차 6자리 이상인지 확인 (6자리 미만인 경우 알림)
    if ( pwd.length < 6 ) {
      // 숫자만 입력가능하기때문에 length 로 비교
      this._popupService.openAlert(Tw.MYT_JOIN_CUSTPASS.EMPTY_PWD, Tw.POPUP_TITLE.NOTIFY);
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
      this._currentHash = this._HASH_STEP_CHECK;
      return;
    }

    var orgPwd = this._validatePwdInput('#pwd-input2');
    var checkPwd = this._validatePwdInput('#pwd-input3');

    if( !orgPwd || !checkPwd ) return;

    // 비밀번호 입력과 확인이 다른 경우
    if ( orgPwd !== checkPwd ) {
      $('#pwd-input2').parents('.inputbox').addClass('error');
      $('#pwd-input3').parents('.inputbox').addClass('error');
      this._popupService.openAlert(
        Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A63.MSG,
        Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A63.TITLE);
      return;
    }

    // Call API
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

    Tw.CommonHelper.startLoading(this._currentHash, 'grey');
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
    Tw.CommonHelper.endLoading(this._currentHash);
    Tw.Logger.info(params);
    if ( params.code === Tw.API_CODE.CODE_00 ) {

      // update svcInfo
      this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {})
        .done($.proxy(function(){

          var msgObj = this._new ? Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A64 : Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A62;
          this._popupService.openAlert(msgObj.MSG, msgObj.TITLE, null, $.proxy(function(){
            // 완료 후 MS페이지로 이동
            this._historyService.goLoad('/myt-join/submain/');
          }, this));
        }, this));

    }
    else {
      // ICAS3215	고객보호비밀번호 오입력 5회(잠김 예정)
      // ICAS3216	고객보호비밀번호 기 잠김 (지점 내점 안내 노출)
      if ( params.code === 'ICAS3216' ) {
        this._popupService.openAlert(Tw.MYT_JOIN_CUSTPASS.BLOCKED_PWD);
      } else {
        Tw.Error(params.code, params.msg).pop();
      }
    }
  },

  _onApiError: function (params) {
    Tw.CommonHelper.endLoading(this._currentHash);
    Tw.Error(params.code, params.msg).pop();
  },

  /**
   * 닫기(X) 버튼 클릭시
   * @private
   */
  _onclickBtnCancel: function(){
    // 입력한 값이 있는지
    var hasInput = (
      ($('#pwd-input1').val() && $('#pwd-input1').val().length > 0) ||
      ($('#pwd-input2').val() && $('#pwd-input2').val().length > 0) ||
        ($('#pwd-input3').val() && $('#pwd-input3').val().length > 0)
    );

    // 입력값이 있는 경우 입력값 버릴건지 확인
    if(hasInput){
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
        $.proxy(this._confirmBack, this),
        null,
        Tw.BUTTON_LABEL.NO,
        Tw.BUTTON_LABEL.YES);
    } else {
      this._confirmBack();
    }

  },

  _confirmBack: function(){

    if( this._new ){

      // 2_A200
      this._popupService.openConfirm(
        Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A200.MSG,
        Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A200.TITLE,
        $.proxy(function(){
          // logout and home(HO)으로 이동
          this._tidLanding.goLogout();
          //this._historyService.goLoad('/main/home');

          /*if ( Tw.BrowserHelper.isApp() ) {
            Tw.Native.send(Tw.NTV_CMD.LOGOUT, {}, $.proxy(function(){
              this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
                .done($.proxy(function(){
                  this._historyService.goLoad('/main/home');
                }, this));
            }, this));
          } else {
            this._historyService.goLoad(url);
          }*/
        }, this),
        function(){
          Tw.Popup.close();
        }
        );
    } else {

      // main(MS)으로 이동
      // this._historyService.goLoad('/myt-join/submain');
      this._historyService.goBack();

    }
  }


};