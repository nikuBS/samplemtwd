/**
 * @file tid-landing.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.06.22
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
  _goLoad: function (nativeCommand, url, callback) {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(nativeCommand, {}, callback);
    } else {
      this._historyService.goLoad(url);
    }
  },
  goActionSheetLogin: function (target) {
    this._generateSession(target, Tw.NTV_LOGINTYPE.ACTION_SHEET);
  },
  _generateSession: function (target, loginType) {
    this._apiService.request(Tw.NODE_CMD.SESSION, {})
      .done($.proxy(this._successSession, this, target, loginType))
      .fail($.proxy(this._failSession, this));
  },
  _successSession: function (target, loginType, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.sendNativeSession('');
      this._nativeService.send(Tw.NTV_CMD.LOGIN, {
        type: loginType
      }, $.proxy(this._onNativeLogin, this, target));
    }
  },
  _failSession: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
  _onClickLogin: function (target) {
    this.goLogin(target);
  },
  _onClickReplaceLogin: function (target) {
    target = target || '/main/home';
    if ( Tw.BrowserHelper.isApp() && Tw.FormatHelper.isEmpty(Tw.CommonHelper.getCookie('TWM')) ) {
      this._generateSession(target, Tw.NTV_LOGINTYPE.DEFAULT);
    } else {
      this._goLoad(Tw.NTV_CMD.LOGIN, '/common/tid/login?target=' + encodeURIComponent(target) + '&type=reload',
        $.proxy(this._onNativeLogin, this, target));
    }
  },
  _onClickLogout: function () {
    this.goLogout();
  },
  _onClickSLogin: function () {
    this.goSLogin();
  },
  _onClickSignup: function () {
    this.goSignup();
  },
  goLogin: function (target) {
    target = target || '/main/home';
    if ( Tw.BrowserHelper.isApp() && Tw.FormatHelper.isEmpty(Tw.CommonHelper.getCookie('TWM')) ) {
      this._generateSession(target, Tw.NTV_LOGINTYPE.DEFAULT);
    } else {
      this._goLoad(Tw.NTV_CMD.LOGIN, '/common/tid/login?target=' + encodeURIComponent(target), $.proxy(this._onNativeLogin, this, target));
    }
  },
  goSLogin: function (target) {
    if ( Tw.BrowserHelper.isApp() ) {
      if ( Tw.BrowserHelper.isAndroid() ) {
        this._historyService.goLoad('/common/member/slogin/aos?target=' + encodeURIComponent(target));
      } else {
        this._historyService.goLoad('/common/member/slogin/ios?target=' + encodeURIComponent(target));
      }
    }
  },
  goSignup: function () {
    this._goLoad(Tw.NTV_CMD.SIGN_UP, '/common/member/signup-guide', $.proxy(this._onNativeSignup, this));
  },
  goLogout: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(Tw.NTV_CMD.LOGOUT, {}, $.proxy(this._onNativeLogout, this));
    } else {
      this._historyService.goLoad('/common/tid/logout');
    }
  },
  logout: function (callback) {
    this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
      .done(callback)
      .fail($.proxy(this._failLogout, this));
  },
  _failLogout: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
  _onClickBtnAuthLine: function () {
    this._historyService.goLoad('/common/member/line');
  },
  _onClickBtAccount: function () {
    this._goLoad(Tw.NTV_CMD.ACCOUNT, '/common/tid/account', $.proxy(this._onNativeAccount, this));
  },
  _onClickBtnAuthWithdrawalGuide: function () {
    new Tw.CommonWithdrawal();
  },
  _onClickBtFindId: function () {
    this._goLoad(Tw.NTV_CMD.FIND_ID, '/common/tid/find-id', $.proxy(this._onNativeFindId, this));
  },
  _onClickBtFindPw: function () {
    this._goLoad(Tw.NTV_CMD.FIND_PW, '/common/tid/find-pw', $.proxy(this._onNativeFindPw, this));
  },
  _onClickBtChangePw: function (target) {
    this._goLoad(Tw.NTV_CMD.CHANGE_PW, '/common/tid/change-pw?target=' + encodeURIComponent(target), $.proxy(this._onNativeChangePw, this));
  },
  _onNativeAccount: function () {
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeAccount' });
  },
  _onNativeFindId: function () {
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeFindId' });
  },
  _onNativeFindPw: function () {
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeFindPw' });
  },
  _onNativeChangePw: function () {
    // this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeChangePw' });
    this._historyService.goBack();
  },
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

    // if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
    //   this._apiService.request(Tw.NODE_CMD.LOGIN_TID, resp.params)
    //     .done($.proxy(this._successLogin, this, target));
    // }
  },
  _onNativeSignup: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._apiService.request(Tw.NODE_CMD.LOGIN_TID, resp.params)
        .done($.proxy(this._successLogin, this))
        .fail($.proxy(this._failLogin, this));
    }
  },
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
  _failLogin: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
  _onNativeLogout: function (resp) {
    Tw.Logger.info('[Logout TID Resp]', resp, Tw.CommonHelper.getCookie('TWM'));
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
        .done($.proxy(this._successLogout, this));
    }
  },
  _successLogout: function (resp) {
    Tw.Logger.info('[Logout Resp]', resp);
    this._historyService.goLoad('/common/member/logout/complete');
    // if ( resp.code === NTV_CODE.CODE_00 ) {
    // }

  },
  _successSetSession: function (target) {
    if ( target === location.pathname + location.search ) {
      this._historyService.reload();
    } else {
      this._historyService.replaceURL(target);
    }
  }
};