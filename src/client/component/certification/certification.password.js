/**
 * FileName: certification.password.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationPassword = function () {
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._authUrl = null;
  this._command = null;
  this._callback = null;
  this._authKind = null;
};


Tw.CertificationPassword.prototype = {
  open: function (authUrl, authKind, command, callback) {
    this._authUrl = authUrl;
    this._command = command;
    this._callback = callback;
    this._authKind = authKind;

    this._openCertPassword();
  },
  _openCertPassword: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(Tw.NTV_CMD.CERT_PW, {}, $.proxy(this._onCertResult, this));
    } else {
      this._historyService.goLoad('/common/tid/cert-pw');
    }
  },

  _onCertResult: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._confirmPasswordCert();
    }
  },
  _confirmPasswordCert: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0027, {
      type: Tw.AUTH_CERTIFICATION_METHOD.W,
      authUrl: this._authUrl,
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._command.params.prodId + this._command.params.prodProctypeCd : ''
    }).done($.proxy(this._successConfirmPasswordCert, this));
  },
  _successConfirmPasswordCert: function (resp) {
    this._callback(resp);
  }

};
