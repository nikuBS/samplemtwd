/**
 * FileName: common.member.login.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.07
 */

Tw.CommonMemberLogin = function (target) {
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._init(target);
};

Tw.CommonMemberLogin.prototype = {
  ERROR_CODE: {
    CANCEL: 1500
  },
  _init: function (target) {
    this._apiService.sendNativeSession('');
    this._goLoad(Tw.NTV_CMD.LOGIN, '/common/tid/login?target=' + encodeURIComponent(target) +
      '&type=reload', $.proxy(this._onNativeLogin, this, target));
  },
  _goLoad: function (nativeCommand, url, callback) {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(nativeCommand, {}, callback);
    } else {
      this._historyService.replaceURL(url);
    }
  },
  _onNativeLogin: function (target, resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._successLogin(target, resp.params);
    } else if ( resp.resultCode === Tw.NTV_CODE.CODE_1500 || resp.resultCode === Tw.NTV_CODE.CODE_3114 ) {
      this._historyService.goBack();
    } else {
      this._historyService.replaceURL('/common/member/login/fail?errorCode=' + resp.code);
    }

    // if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
    //   this._apiService.request(Tw.NODE_CMD.LOGIN_TID, resp.params)
    //     .done($.proxy(this._successLogin, this, target));
    // } else {
    //   this._historyService.goBack();
    // }
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
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH3236) {
      this._historyService.goLoad('/common/member/login/lost?target=' + encodeURIComponent(target));
    } else {
      this._historyService.replaceURL('/common/member/login/fail?errorCode=' + resp.code);
    }
  },
  _successSetSession: function (target) {
    if ( target === location.pathname + location.search ) {
      this._historyService.reload();
    } else {
      this._historyService.replaceURL(target);
    }
  },
  _generateSession: function (target, loginType) {
    this._apiService.request(Tw.NODE_CMD.SESSION, {})
      .done($.proxy(this._onSuccessSession, this, target, loginType));
  },
  _onSuccessSession: function (target, loginType, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.sendNativeSession('');
      this._nativeService.send(Tw.NTV_CMD.LOGIN, {
        type: loginType
      }, $.proxy(this._onNativeLogin, this, target));
    }
  }
};
