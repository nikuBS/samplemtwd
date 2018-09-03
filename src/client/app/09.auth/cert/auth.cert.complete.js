/**
 * FileName: auth.cert.complete.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.03
 */

Tw.AuthCertComplete = function () {
  this._nativeService = Tw.Native;
  this._init();

};

Tw.AuthCertComplete.prototype = {
  _init: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._closeInApp();
    } else {
      this._closeWeb();
    }
  },
  _closeWeb: function () {
    window.opener.onPopupCallback('complete');
    window.close();
  },
  _closeInApp: function () {
    this._nativeService.send(Tw.NTV_CMD.CLOSE_INAPP, {});
  }
};
