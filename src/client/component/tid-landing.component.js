/**
 * FileName: tid-landing.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.06.22
 */

Tw.TidLandingComponent = function (rootEl) {
  this.$container = rootEl;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;

  if ( !Tw.FormatHelper.isEmpty(this.$container) ) {
    this._bindEvent();
  }
};

Tw.TidLandingComponent.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.fe-bt-auth-line', $.proxy(this._onClickBtnAuthLine, this));
    this.$container.on('click', '.fe-bt-account', $.proxy(this._onClickBtAccount, this));
    this.$container.on('click', '.fe-bt-auth-withdrawal-guide', $.proxy(this._onClickBtnAuthWithdrawalGuide, this));
    this.$container.on('click', '.fe-bt-find-id', $.proxy(this._onClickBtFindId, this));
    this.$container.on('click', '.fe-bt-find-pw', $.proxy(this._onClickBtFindPw, this));
    this.$container.on('click', '.fe-bt-change-pw', $.proxy(this._onClickBtChangePw, this));
    this.$container.on('click', '.fe-bt-login', $.proxy(this.goLogin, this));
    this.$container.on('click', '.fe-bt-logout', $.proxy(this.goLogout, this));
    this.$container.on('click', '.fe-bt-signup', $.proxy(this.goSignup, this));
  },
  _goLoad: function (nativeCommand, url, callback) {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(nativeCommand, {}, callback);
    } else {
      this._historyService.goLoad(url);
    }
  },
  goActionSheetLogin: function () {
    this._apiService.request(Tw.NODE_CMD.SESSION, {})
      .done($.proxy(this._onSuccessSession, this));
  },
  _onSuccessSession: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.sendNativeSession('');
      this._nativeService.send(Tw.NTV_CMD.LOGIN, {
        type: '1'
      }, $.proxy(this._onNativeLogin, this, '/main/home'));
    }
  },
  goLogin: function (target) {
    target = target || '/main/home';
    this._goLoad(Tw.NTV_CMD.LOGIN, '/common/tid/login?target=' + target, $.proxy(this._onNativeLogin, this, target));
  },
  goSLogin: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      if ( Tw.BrowserHelper.isAndroid() ) {
        this._getMdn();
      } else {
        this._historyService.goLoad('/common/member/slogin/ios');
      }
    }
  },
  goSignup: function () {
    this._goLoad(Tw.NTV_CMD.SIGN_UP, '/common/member/signup-guide', $.proxy(this._onNativeSignup, this));
  },
  goLogout: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
        .done($.proxy(this._successLogout, this));
    } else {
      this._historyService.goLoad('/common/tid/logout');
    }
  },
  logout: function (callback) {
    this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
      .done(callback);
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
  _onClickBtChangePw: function () {
    this._goLoad(Tw.NTV_CMD.CHANGE_PW, '/common/tid/change-pw', $.proxy(this._onNativeChangePw, this));
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
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeChangePw' });
  },
  _onNativeLogin: function (target, resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._apiService.request(Tw.NODE_CMD.LOGIN_TID, resp.params)
        .done($.proxy(this._successLogin, this, target));
    }
  },
  _onNativeSignup: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._apiService.request(Tw.NODE_CMD.LOGIN_TID, resp.params)
        .done($.proxy(this._successLogin, this));
    }
  },
  _successLogin: function (target, resp) {
    Tw.Logger.info('[Login Resp]', resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.sendNativeSession(Tw.AUTH_LOGIN_TYPE.TID, $.proxy(this._successSetSession, this));
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3228 ) {
      // 고객보호비밀번호
      this._historyService.goLoad('/common/member/login/cust-pwd?target=' + target);
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3235 ) {
      // 휴면계정
      this._historyService.goLoad('/common/member/login/reactive?target=' + target);
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH1003 ) {
      this._historyService.goLoad('/common/member/login/exceed-fail');
    } else {
      this._historyService.goLoad('/common/member/login/fail?errorCode=' + resp.code);
    }
  },
  _successLogout: function (resp) {
    Tw.Logger.info('[Logout Resp]', resp);
    // if ( resp.code === NTV_CODE.CODE_00 ) {
    // }
    this._nativeService.send(Tw.NTV_CMD.LOGOUT, {}, $.proxy(this._onNativeLogout, this));
  },
  _onNativeLogout: function (resp) {
    Tw.Logger.info('[Logout TID Resp]', resp, Tw.CommonHelper.getCookie('TWM'));
    // if ( resp.code === NTV_CODE.CODE_00 ) {
    // }
    this._historyService.goLoad('/common/member/logout/complete');
  },
  _successSetSession: function () {
    this._historyService.reload();
  },
  _getMdn: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_MDN, {}, $.proxy(this._onMdn, this));
  },
  _onMdn: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._historyService.goLoad('/common/member/slogin/aos?mdn=' + resp.params.mdn);
    }
  }
};