/**
 * FileName: menu.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.06.22
 */

Tw.MenuComponent = function () {
  this.$container = $('#fe-all-menu');

  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._bindEvent();
};

Tw.MenuComponent.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.ico-login', $.proxy(this._onClickLogin, this));
    this.$container.on('click', '.test-logout', $.proxy(this._onClickLogout, this));
  },
  _onClickLogin: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(Tw.NTV_CMD.LOGIN, {}, $.proxy(this._onNativeLogin, this));
    } else {
      location.href = '/auth/tid/login';
    }
  },
  _onNativeLogin: function (resp) {
    this._apiService.request(Tw.NODE_CMD.LOGIN_TID, resp)
      .done($.proxy(this._successLogin, this));
  },
  _successLogin: function (resp) {
    Tw.Logger.info('[Login Resp]', resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      document.location.reload();
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3228 ) {
      // 고객보호비밀번호
      location.href = '/auth/login/service-pwd';
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3235 ) {
      // 휴면계정
      location.href = '/auth/login/dormancy';
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH1003 ) {
      location.href = '/auth/login/exceed-fail';
    } else {
      location.href = '/auth/login/fail?errorCode=' + resp.code;
    }
  },
  _onClickLogout: function () {
    Tw.Logger.info('[Logout]', Tw.BrowserHelper.isApp());
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(Tw.NTV_CMD.LOGOUT, {}, $.proxy(this._onNativeLogout, this));
    } else {
      location.href = '/auth/tid/logout';
    }
  },
  _onNativeLogout: function () {
    this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
      .done($.proxy(this._successLogout, this));
  },
  _successLogout: function (resp) {
    Tw.Logger.info('[Logout Resp]', resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      location.href = '/auth/logout/complete';
    }
  }
};
