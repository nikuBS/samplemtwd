/**
 * FileName: common.landing.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.20
 */

Tw.CommonLanding = function (command, isLogin) {
  this._nativeService = Tw.Native;
  this._command = command;
  this._isLogin = isLogin;
  this._tidLanding = new Tw.TidLandingComponent();

  this._init();
};

Tw.CommonLanding.prototype = {
  _init: function () {
    if ( this._isLogin === 'true' ) {
      this._nativeService.send(this._command, {});
    } else {
      this._tidLanding.goLogin();
    }
  }
};
