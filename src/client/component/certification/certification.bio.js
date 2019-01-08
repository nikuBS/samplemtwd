/**
 * FileName: certification.bio.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.11
 */

Tw.CertificationBio = function () {
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;

  this._callback = null;
  this._authUrl = null;
  this._authKind = null;
  this._prodAuthKey = null;
  this._register = false;
};


Tw.CertificationBio.prototype = {
  ERROR_CODE: {
    FAIL: 9,
    CANCEL: 258,
    LOCK: 259
  },
  open: function (authUrl, authKind, prodAuthKey, callback, isRegister, target) {
    this._callback = callback;
    this._authUrl = authUrl;
    this._authKind = authKind;
    this._prodAuthKey = prodAuthKey;

    this._biometricsTerm = new Tw.BiometricsTerms(target);

    if ( isRegister ) {
      this._fidoAuth();
    } else {
      this._openRegisterPopup();
    }
  },
  _openRegisterPopup: function () {
    this._popupService.openConfirmButton(Tw.POPUP_CONTENTS.BIO_REGISTER, null,
      $.proxy(this._onConfirmRegister, this), $.proxy(this._onCloseRegister, this),
      Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  },
  _onConfirmRegister: function () {
    this._register = true;
    this._popupService.close();
  },
  _onCloseRegister: function () {
    if ( this._register ) {
      this._goBioRegister();
    }
  },
  _goBioRegister: function () {
    this._biometricsTerm.open($.proxy(this._onFidoRegister, this));
  },
  _fidoAuth: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_AUTH, {
      authUrl: this._authUrl,
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._prodAuthKey : ''
    }, $.proxy(this._onFidoAuth, this));
  },
  _onFidoAuth: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._callback({
        code: Tw.API_CODE.CODE_00
      });
    } else if (resp.resultCode === this.ERROR_CODE.CANCEL) {
      //
    } else {
      this._callback({
        code: Tw.API_CODE.CERT_FAIL
      });
    }
  },
  _onFidoRegister: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._fidoAuth();
    }
  }
};
