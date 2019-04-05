/**
 * MenuName: 나의 가입정보 > 서브메인 > 고객보호 비밀번호 설정/변경(MS_01_01_01)
 * @file myt-join.custpassword.check.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.09.28
 * Summary: 고객보호 비밀번호 설정/변경 화면에서 비밀번호 확인
 */
Tw.MytJoinCustpasswordCheck = function() {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  // error when login
  this._loginErrorCode = {
    UNDER_3: 'ICAS3213',       // 고객보호비밀번호 오입력(3회 미만)
    ERROR_3: 'ICAS3212',       // 고객보호비밀번호 오입력(3회)
    ERROR_4: 'ICAS3215',       //고객보호비밀번호 오입력 (4회)
    BLOCKED: 'ICAS3216'        //고객보호비밀번호 잠김 (지점 내점 안내 노출)
  };

  this._lineChangeErrorCode = {
    ERROR_1: 'ICAS3481',       // 고객보호비밀번호 입력 오류 1회
    ERROR_2: 'ICAS3482',       // 고객보호비밀번호 입력 오류 2회
    ERROR_3: 'ICAS3483',       // 고객보호비밀번호 입력 오류 3회
    ERROR_4: 'ICAS3484',       // 고객보호비밀번호 입력 오류 4회
    BLOCKED: 'ICAS3215'       // 고객보호비밀번호 입력 오류 5회 (잠김예정)
  };
};

Tw.MytJoinCustpasswordCheck.prototype = {
  /**
   * 에러팝업을 기본으로 보여줄지
   */
  showDefaultErrorPopup : true,

  /**
   * 고객보호 비밀번호 확인 서비스 호출
   * @param password
   * @param successCallback
   * @param errorCallback
   */
  check : function (password, successCallback, errorCallback) {
    this._successCallback = successCallback;
    this._errorCallback = errorCallback;
    this._apiService.request(Tw.API_CMD.BFF_03_0020, { svcPwd : password })
      .done($.proxy(this._onLoginReuestDone, this))
      .fail(function (err) {
        Tw.Logger.error('auth.login.service.pwd Fail', err);
        Tw.Error(err.status, err.statusText).pop();
      });
  },
  _onLoginReuestDone: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 && this._successCallback ) {
      this._successCallback(res);
    }
    else {
      this.errCount = 0;
      var unexpectedError = false;
      switch ( res.code ) {
        case this._lineChangeErrorCode.ERROR_1:
          this.errCount = 1;
          break;
        case this._lineChangeErrorCode.ERROR_2:
          this.errCount = 2;
          break;
        case this._lineChangeErrorCode.ERROR_3:
        case this._loginErrorCode.ERROR_3:
          this.errCount = 3;
          break;
        case this._lineChangeErrorCode.ERROR_4:
        case this._loginErrorCode.ERROR_4:
          this.errCount = 4;
          break;
        case this._lineChangeErrorCode.BLOCKED:
        case this._loginErrorCode.BLOCKED:
          this.errCount = 5;
          break;
        default:
          unexpectedError = true;
          break;
      }

      if( this._errorCallback ){
        this._errorCallback(res, this.errCount, unexpectedError);
      }

      if ( this.showDefaultErrorPopup ) {
        this._defaultErrorHandler(res, unexpectedError);
      }

    }
  },

  _defaultErrorHandler : function(){
    // this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A61.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A61.TITLE);

    // var errorMsg = unexpectedError ? res.msg : Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A61.MSG;

    // blocked
    if(this.errCount >= 5){
      this._popupService.openAlert(Tw.MYT_JOIN_CUSTPASS.BLOCKED_PWD);
      return;
    }

    if(this.errCount > 0){
      var errorMsg = Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A209.MSG;
      errorMsg = errorMsg.replace('N', this.errCount);
      this._popupService.openAlert(errorMsg);

    } else {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A61.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A61.TITLE);
    }
  }

};

