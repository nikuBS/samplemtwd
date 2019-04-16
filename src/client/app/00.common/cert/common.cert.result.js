/**
 * @file common.cert.result.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.03
 */

/**
 * @class
 * @desc Common > IPIN/NICE 인증 결과 처리 (inapp browser 에서 결과 넘기기)
 * @param target
 * @param code
 * @param msg
 * @constructor
 */
Tw.CommonCertResult = function (target, code, msg) {
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._target = target;
  this._init(code, msg);

};

Tw.CommonCertResult.prototype = {
  /**
   * @function
   * @desc Inapp browser close 호출
   * @param code
   * @param msg
   * @private
   */
  _init: function (code, msg) {
    if ( Tw.BrowserHelper.isApp() ) {
      this._closeInApp(code, msg);
    } else {
      this._closeWeb(code, msg);
    }
  },

  /**
   * @function
   * @desc MWeb 처리
   * @param code
   * @param msg
   * @private
   */
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

  /**
   * @function
   * @desc App 처리
   * @param code
   * @param msg
   * @private
   */
  _closeInApp: function (code, msg) {
    if ( code === Tw.API_CODE.CODE_00 ) {
      this._nativeService.send(Tw.NTV_CMD.CLOSE_INAPP, {});
    } else {
      this._historyService.replaceURL('/common/inapp/error?code=' + code + '&msg=' + msg);
    }
  }
};
