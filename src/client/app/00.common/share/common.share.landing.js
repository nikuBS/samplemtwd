/**
 * FileName: common.share.landing.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.20
 */

Tw.CommonShareLanding = function (command, isLogin) {
  this._nativeService = Tw.Native;
  this._command = command;
  this._isLogin = isLogin;
  this._tidLanding = new Tw.TidLandingComponent();

  this._init();
};

Tw.CommonShareLanding.prototype = {
  _init: function () {
    if ( this._isLogin === 'true' ) {
      if ( this._command === Tw.NTV_CMD.FREE_SMS ) {
        Tw.CommonHelper.openFreeSms();
      }
    } else {
      this._tidLanding.goLogin();
    }
  }
};
