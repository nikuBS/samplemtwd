/**
 * FileName: certification.bio.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.11
 */

Tw.CertificationBio = function () {
  this._nativeService = Tw.Native;

  this._callback = null;
};


Tw.CertificationBio.prototype = {
  ERROR_CODE: {
    FAIL: 9,
    CANCEL: 258,
    LOCK: 259
  },
  open: function (authUrl, authKind, command, callback) {
    this._callback = callback;
    this._fidoAuth(authUrl, authKind, command);
  },
  _fidoAuth: function (authUrl, authKind, command) {
    this._nativeService.send(Tw.NTV_CMD.FIDO_AUTH, {
      authUrl: authUrl,
      authKind: authKind,
      prodAuthKey: authKind === Tw.AUTH_CERTIFICATION_KIND.R ? command.params.prodId + command.params.prodProctypeCd : ''
    }, $.proxy(this._onFidoAuth, this));
  },
  _onFidoAuth: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._callback(resp);
    } else {

    }
  }
};
