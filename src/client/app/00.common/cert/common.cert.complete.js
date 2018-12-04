/**
 * FileName: common.cert.complete.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.03
 */

Tw.CommonCertComplete = function (target) {
  this._nativeService = Tw.Native;
  this._target = target;
  this._init();

};

Tw.CommonCertComplete.prototype = {
  _init: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._closeInApp();
    } else {
      this._closeWeb();
    }
  },
  _closeWeb: function () {
    if(this._target === Tw.AUTH_CERTIFICATION_METHOD.PASSWORD) {
      window.opener.onPopupCallbackPassword('complete');
    } else {
      window.opener.onPopupCallback('complete');
    }
    window.close();
  },
  _closeInApp: function () {
    this._nativeService.send(Tw.NTV_CMD.CLOSE_INAPP, {});
  }
};
