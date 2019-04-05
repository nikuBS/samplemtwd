/**
 * FileName: common.cert.result.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.03
 */

Tw.CommonCertResult = function (target, code, msg) {
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._target = target;
  this._init(code, msg);

};

Tw.CommonCertResult.prototype = {
  _init: function (code, msg) {
    if ( Tw.BrowserHelper.isApp() ) {
      this._closeInApp(code, msg);
    } else {
      this._closeWeb(code, msg);
    }
  },
  _closeWeb: function (code, msg) {
    if ( code === Tw.API_CODE.CODE_00 ) {
      if ( this._target === Tw.AUTH_CERTIFICATION_METHOD.PASSWORD ) {
        window.opener.onPopupCallbackPassword({ code: code, msg: msg });
      } else {
        window.opener.onPopupCallback({ code: code, msg: msg });
      }
      window.close();
    } else {
      Tw.Error(code, msg).page();
    }
  },
  _closeInApp: function (code, msg) {
    if ( code === Tw.API_CODE.CODE_00 ) {
      this._nativeService.send(Tw.NTV_CMD.CLOSE_INAPP, {});
    } else {
      this._historyService.replaceURL('/common/inapp/error?code=' + code + '&msg=' + msg);
    }
  }
};
