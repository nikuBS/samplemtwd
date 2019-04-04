/**
 * @file common.share.landing.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.11.20
 */

Tw.CommonShareLanding = function (target, targetLoginType, loginType) {
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._target = target;
  this._targetLoginType = targetLoginType;
  this._loginType = loginType;
  this._tidLanding = new Tw.TidLandingComponent();

  this._init();
};

Tw.CommonShareLanding.prototype = {
  _init: function () {
    if ( this._loginType === Tw.AUTH_LOGIN_TYPE.TID ) {
      this._historyService.replaceURL(this._target);
    } else if ( this._loginType === Tw.AUTH_LOGIN_TYPE.EASY ) {
      if ( this._targetLoginType === Tw.AUTH_LOGIN_TYPE.TID ) {
        this._tidLanding.goLogin(this._target);
      } else {
        this._historyService.replaceURL(this._target);
      }
    } else {
      if ( this._targetLoginType === Tw.AUTH_LOGIN_TYPE.TID ) {
        this._tidLanding.goLogin(this._target);
      } else if ( this._targetLoginType === Tw.AUTH_LOGIN_TYPE.EASY ) {
        this._tidLanding.goSLogin(this._target);
      } else {
        this._historyService.replaceURL(this._target);
      }
    }
  }
};
