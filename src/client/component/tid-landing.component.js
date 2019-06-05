/**
 * @file tid-landing.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.06.22
 */

/**
 * @class
 * @desc 공통 > TID
 * @param rootEl
 * @param redirectTarget
 * @constructor
 */
Tw.TidLandingComponent = function (rootEl, redirectTarget) {
  this.$container = rootEl;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;

  if ( !Tw.FormatHelper.isEmpty(this.$container) ) {
    this._bindEvent(redirectTarget);
  }
};

Tw.TidLandingComponent.prototype = {
  /**
   * @desc 이벤트 바인딩   * @param redirectTarget
   * @private
   */
  _bindEvent: function (redirectTarget) {
    this.$container.on('click', '.fe-bt-auth-line', $.proxy(this._onClickBtnAuthLine, this));
    this.$container.on('click', '.fe-bt-account', $.proxy(this._onClickBtAccount, this));
    this.$container.on('click', '.fe-bt-auth-withdrawal-guide', $.proxy(this._onClickBtnAuthWithdrawalGuide, this));
    this.$container.on('click', '.fe-bt-find-id', $.proxy(this._onClickBtFindId, this));
    this.$container.on('click', '.fe-bt-find-pw', $.proxy(this._onClickBtFindPw, this));
    this.$container.on('click', '.fe-bt-change-pw', $.proxy(this._onClickBtChangePw, this, redirectTarget));
    this.$container.on('click', '.fe-bt-login', $.proxy(this._onClickLogin, this, redirectTarget));
    this.$container.on('click', '.fe-bt-replace-login', $.proxy(this._onClickReplaceLogin, this, redirectTarget));
    this.$container.on('click', '.fe-bt-logout', $.proxy(this._onClickLogout, this));
    this.$container.on('click', '.fe-bt-slogin', $.proxy(this._onClickSLogin, this));
    this.$container.on('click', '.fe-bt-signup', $.proxy(this._onClickSignup, this));
  },

  /**
   * @function
   * @desc 앱/웹 분기처리
   * @param nativeCommand
   * @param url
   * @param callback
   * @private
   */
  _goLoad: function (nativeCommand, url, callback) {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(nativeCommand, {}, callback);
    } else {
      this._historyService.goLoad(url);
    }
  },

  /**
   * @function
   * @desc 세션만료시 로그인 페이지 요청
   * @param target
   */
  goActionSheetLogin: function (target) {
    this._generateSession(target, Tw.NTV_LOGINTYPE.ACTION_SHEET);
  },

  /**
   * @function
   * @desc 신규 세션 생성 요청
   * @param target
   * @param loginType
   * @private
   */
  _generateSession: function (target, loginType) {
    this._apiService.request(Tw.NODE_CMD.SESSION, {})
      .done($.proxy(this._successSession, this, target, loginType))
      .fail($.proxy(this._failSession, this));
  },

  /**
   * @function
   * @desc 신규 세션 생성 응답 처리
   * @param target
   * @param loginType
   * @param resp
   * @private
   */
  _successSession: function (target, loginType, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.sendNativeSession('');
      this._nativeService.send(Tw.NTV_CMD.LOGIN, {
        type: loginType
      }, $.proxy(this._onNativeLogin, this, target));
    }
  },

  /**
   * @function
   * @desc 신규 세션 생성 요청 실패 처리
   * @param error
   * @private
   */
  _failSession: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 로그인 버튼 click event 처리
   * @param target
   * @private
   */
  _onClickLogin: function (target) {
    this.goLogin(target);
  },

  /**
   * @function
   * @desc 로그인 버튼 (페이지 변경) click event 처리
   * @param target
   * @private
   */
  _onClickReplaceLogin: function (target) {
    target = target || '/main/home';
    if ( Tw.BrowserHelper.isApp() && Tw.FormatHelper.isEmpty(Tw.CommonHelper.getCookie('TWM')) ) {
      this._generateSession(target, Tw.NTV_LOGINTYPE.DEFAULT);
    } else {
      this._goLoad(Tw.NTV_CMD.LOGIN, '/common/tid/login?target=' + encodeURIComponent(target) + '&type=reload',
        $.proxy(this._onNativeLogin, this, target));
    }
  },

  /**
   * @function
   * @desc 로그아웃 버튼 click event 처리
   * @private
   */
  _onClickLogout: function () {
    this.goLogout();
  },

  /**
   * @function
   * @desc 간편로그인 버튼 click event 처리
   * @private
   */
  _onClickSLogin: function () {
    this.goSLogin();
  },

  /**
   * @function
   * @desc 회원가입 버튼 click event 처리
   * @private
   */
  _onClickSignup: function () {
    this.goSignup();
  },

  /**
   * @function
   * @desc 로그인 요청
   * @param target
   */
  goLogin: function (target) {
    target = target || '/main/home';
    if ( Tw.BrowserHelper.isApp() && Tw.FormatHelper.isEmpty(Tw.CommonHelper.getCookie('TWM')) ) {
      this._generateSession(target, Tw.NTV_LOGINTYPE.DEFAULT);
    } else {
      this._goLoad(Tw.NTV_CMD.LOGIN, '/common/tid/login?target=' + encodeURIComponent(target), $.proxy(this._onNativeLogin, this, target));
    }
  },

  /**
   * @function
   * @desc 간편로그인 요청
   * @param target
   */
  goSLogin: function (target) {
    if ( Tw.BrowserHelper.isApp() ) {
      if ( Tw.BrowserHelper.isAndroid() ) {
        this._historyService.goLoad('/common/member/slogin/aos?target=' + encodeURIComponent(target));
      } else {
        this._historyService.goLoad('/common/member/slogin/ios?target=' + encodeURIComponent(target));
      }
    }
  },

  /**
   * @function
   * @desc 회원가입 요청
   */
  goSignup: function () {
    this._goLoad(Tw.NTV_CMD.SIGN_UP, '/common/member/signup-guide', $.proxy(this._onNativeSignup, this));
  },

  /**
   * @function
   * @desc 로그아웃 요청
   */
  goLogout: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(Tw.NTV_CMD.LOGOUT, {}, $.proxy(this._onNativeLogout, this));
    } else {
      this._historyService.goLoad('/common/tid/logout');
    }
  },

  /**
   * @function
   * @desc 간편로그인시 로그아웃 요청
   */
  goSLogout: function () {
    this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
      .done($.proxy(this._successLogout, this));
  },

  /**
   * @function
   * @desc 로그아웃 API 요청
   * @param callback
   */
  logout: function (callback) {
    this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
      .done(callback)
      .fail($.proxy(this._failLogout, this));
  },

  /**
   * @function
   * @desc 로그아웃 API 실패 처리
   * @param error
   * @private
   */
  _failLogout: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 회선관리 이동 click event 처리
   * @private
   */
  _onClickBtnAuthLine: function () {
    this._historyService.goLoad('/common/member/line');
  },

  /**
   * @function
   * @desc 회선정보 버튼 click event 처리
   * @private
   */
  _onClickBtAccount: function () {
    this._goLoad(Tw.NTV_CMD.ACCOUNT, '/common/tid/account', $.proxy(this._onNativeAccount, this));
  },

  /**
   * @function
   * @desc 회원탈퇴 버튼 click event 처리
   * @private
   */
  _onClickBtnAuthWithdrawalGuide: function () {
    new Tw.CommonWithdrawal();
  },

  /**
   * @function
   * @desc 아이디 찾기 click event 처리
   * @private
   */
  _onClickBtFindId: function () {
    this._goLoad(Tw.NTV_CMD.FIND_ID, '/common/tid/find-id', $.proxy(this._onNativeFindId, this));
  },

  /**
   * @function
   * @desc 비밀번호 찾기 click event 처리
   * @private
   */
  _onClickBtFindPw: function () {
    this._goLoad(Tw.NTV_CMD.FIND_PW, '/common/tid/find-pw', $.proxy(this._onNativeFindPw, this));
  },

  /**
   * @function
   * @desc 비밀번호 변경 click event 처리
   * @param target
   * @private
   */
  _onClickBtChangePw: function (target) {
    this._goLoad(Tw.NTV_CMD.CHANGE_PW, '/common/tid/change-pw?target=' + encodeURIComponent(target), $.proxy(this._onNativeChangePw, this));
  },

  /**
   * @function
   * @desc 회원정보 Native callback
   * @private
   */
  _onNativeAccount: function () {
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeAccount' });
  },

  /**
   * @function
   * @desc 아이디 찾기 Native callback
   * @private
   */
  _onNativeFindId: function () {
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeFindId' });
  },

  /**
   * @function
   * @desc 비밀번호 찾기 Native callback
   * @private
   */
  _onNativeFindPw: function () {
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeFindPw' });
  },

  /**
   * @function
   * @desc 비밀번호 변경 Native callback
   * @private
   */
  _onNativeChangePw: function () {
    // this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeChangePw' });
    this._historyService.goBack();
  },

  /**
   * @function
   * @desc Native TID 로그인 완료 콜백
   * @param target
   * @param resp
   * @private
   */
  _onNativeLogin: function (target, resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._successLogin(target, resp.params);
    } else if ( resp.resultCode === Tw.NTV_CODE.CODE_1500 || resp.resultCode === Tw.NTV_CODE.CODE_3114 ) {
      Tw.Logger.info('Login Cancel');
      var type = +resp.params.type;
      if ( type === Tw.NTV_LOGINTYPE.ACTION_SHEET ) {
        this._historyService.replaceURL('/main/home');
      }
    } else {
      this._historyService.replaceURL('/common/member/login/fail?errorCode=' + resp.resultCode);
    }
  },

  /**
   * @function
   * @desc Native TID 회원가입 완료 콜백
   * @param resp
   * @private
   */
  _onNativeSignup: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._apiService.request(Tw.NODE_CMD.LOGIN_TID, resp.params)
        .done($.proxy(this._successLogin, this))
        .fail($.proxy(this._failLogin, this));
    }
  },

  /**
   * @function
   * @desc 로그인 성공 응답 분기 처리
   * @param target
   * @param resp
   * @private
   */
  _successLogin: function (target, resp) {
    Tw.Logger.info('[Login Resp]', resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.sendNativeSession(Tw.AUTH_LOGIN_TYPE.TID, $.proxy(this._successSetSession, this, target));
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3228 ) {
      // 고객보호비밀번호
      this._historyService.goLoad('/common/member/login/cust-pwd?target=' + encodeURIComponent(target));
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3235 ) {
      // 휴면계정
      this._historyService.goLoad('/common/member/login/reactive?target=' + encodeURIComponent(target));
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH1003 ) {
      this._historyService.replaceURL('/common/member/login/exceed-fail');
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH3236 ) {
      this._historyService.goLoad('/common/member/login/lost?target=' + encodeURIComponent(target));
    } else {
      this._historyService.replaceURL('/common/member/login/fail?errorCode=' + resp.code);
    }
  },

  /**
   * @function
   * @desc 로그인 요청 실패 처리
   * @param error
   * @private
   */
  _failLogin: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 로그아웃 Native callback
   * @param resp
   * @private
   */
  _onNativeLogout: function (resp) {
    Tw.Logger.info('[Logout TID Resp]', resp, Tw.CommonHelper.getCookie('TWM'));
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
        .done($.proxy(this._successLogout, this));
    }
  },

  /**
   * @function
   * @desc 로그아웃 응답 처리
   * @param resp
   * @private
   */
  _successLogout: function (resp) {
    Tw.Logger.info('[Logout Resp]', resp);
    this._historyService.goLoad('/common/member/logout/complete');
    // if ( resp.code === NTV_CODE.CODE_00 ) {
    // }

  },

  /**
   * @function
   * @desc Native 세션 저장 완료 콜백 처리
   * @param target
   * @private
   */
  _successSetSession: function (target) {

    var msg = '##### For TID debugging #####' + '\n'
              + 'target ====> ' +  target + '\n'
              + 'location.pathname ====> ' +  location.pathname + '\n'
              + 'location.search ====> ' +  location.search + '\n';

    alert(msg);

    /*
    if(target === '/common/member/logout/complete')
      target = '/main/home';
    */
      
    if ( target === location.pathname + location.search ) {
      this._historyService.reload();
    } else {
      this._historyService.replaceURL(target);
    }
  }
};