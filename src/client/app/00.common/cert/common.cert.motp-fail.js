/**
 * @file common.cert.motp-fail.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.20
 */

Tw.CommonCertMotpFail = function (rootEl) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._bindEvent();
};

Tw.CommonCertMotpFail.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '#fe-bt-exit', $.proxy(this._exitApp, this));
  },
  _exitApp: function () {
    this._popupService.openConfirm(Tw.MSG_AUTH.EXIT, null, $.proxy(this._sendExit, this));
  },
  _sendExit: function () {
    this._nativeService.send(Tw.NTV_CMD.EXIT, {});
  }
};
