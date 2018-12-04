/**
 * FileName: certification.bio.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.11
 */

Tw.CertificationBio = function () {
  this._nativeService = Tw.Native;

  this._callback = null;
  this._authUrl = null;
  this._authKind = null;
  this._command = null;
};


Tw.CertificationBio.prototype = {
  ERROR_CODE: {
    FAIL: 9,
    CANCEL: 258,
    LOCK: 259
  },
  open: function (authUrl, authKind, command, callback, isRegister, target) {
    this._callback = callback;
    this._authUrl = authUrl;
    this._authKind = authKind;
    this._command = command;

    this._biometricsTerm = new Tw.BiometricsTerms(target);

    if ( isRegister ) {
      this._fidoAuth();
    } else {
      // 등록
      this._biometricsTerm.open($.proxy(this._onFidoRegister, this));
    }
  },
  _fidoAuth: function (authUrl, authKind, command) {
    this._nativeService.send(Tw.NTV_CMD.FIDO_AUTH, {
      authUrl: this._authUrl,
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? command.params.prodId + command.params.prodProctypeCd : ''
    }, $.proxy(this._onFidoAuth, this));
  },
  _onFidoAuth: function (resp) {
    this._callback(resp);
    // if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
    //   this._callback(resp);
    // } else {
    //
    // }
  },
  _onFidoRegister: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._fidoAuth();
    }
  }
};
