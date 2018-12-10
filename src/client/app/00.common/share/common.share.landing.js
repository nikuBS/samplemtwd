/**
 * FileName: common.share.landing.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.20
 */

Tw.CommonShareLanding = function (target, loginType, isLogin) {
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._target = target;
  this._loginType = loginType;
  this._isLogin = isLogin;
  this._tidLanding = new Tw.TidLandingComponent();

  this._init();
};

Tw.CommonShareLanding.prototype = {
  _init: function () {
    this._historyService.goLoad(this._target);
    // if ( this._isLogin === 'true' ) {
    // if ( this._command === Tw.NTV_CMD.FREE_SMS ) {
    //   Tw.CommonHelper.openFreeSms();
    // }
    // this._historyService.goLoad(this._target);
    // } else {
    //   this._tidLanding.goLogin();
    // }
  }
};
