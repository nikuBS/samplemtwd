/**
 * FileName: common.member.login.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.07
 */

Tw.CommonMemberLogin = function (target) {
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._target = target;
  this._init();
};

Tw.CommonMemberLogin.prototype = {
  ERROR_CODE: {
    CANCEL: 1500
  },
  _init: function () {
    this._goLoad(Tw.NTV_CMD.LOGIN, '/common/tid/login', $.proxy(this._onNativeLogin, this));
  },
  _goLoad: function (nativeCommand, url, callback) {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(nativeCommand, {}, callback);
    } else {
      this._historyService.replaceURL(url + '?target=' + this._target);
    }
  },
  _onNativeLogin: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._apiService.request(Tw.NODE_CMD.LOGIN_TID, resp.params)
        .done($.proxy(this._successLogin, this));
    } else {
      this._historyService.goBack();
    }
  },
  _successLogin: function (resp) {
    Tw.Logger.info('[Login Resp]', resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.sendNativeSession(Tw.AUTH_LOGIN_TYPE.TID, $.proxy(this._successSetSession, this));
      Tw.CommonHelper.setXtSvcInfo();
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3228 ) {
      // 고객보호비밀번호
      this._historyService.goLoad('/common/member/login/cust-pwd');
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3235 ) {
      // 휴면계정
      this._historyService.goLoad('/common/member/login/dormancy');
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH1003 ) {
      this._historyService.goLoad('/common/member/login/exceed-fail');
    } else {
      this._historyService.goLoad('/common/member/login/fail?errorCode=' + resp.code);
    }
  },
  _successSetSession: function (resp) {
    this._historyService.reload();
  }
};
