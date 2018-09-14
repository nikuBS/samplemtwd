/**
 * FileName: certification.sms-password.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.30
 */

Tw.CertificationSmsPassword = function () {
  this._certSk = new Tw.CertificationSk();
  this._certPassword = new Tw.CertificationPassword();

  this._svcInfo = null;
  this._authUrl = null;
  this._callback = null;
};

Tw.CertificationSmsPassword.prototype = {
  open: function (svcInfo, authUrl, command, deferred, callback) {
    this._svcInfo = svcInfo;
    this._authUrl = authUrl;
    this._callback = callback;

    this._certPassword.open(svcInfo, authUrl, command, deferred, $.proxy(this._completeCertPassword, this));
  },
  _completeCertPassword: function(resp, deferred, command) {
    if(resp.code === Tw.API_CODE.CODE_00) {
      this._certSk.open(this._svcInfo, this._authUrl, command, deferred, this._callback, Tw.AUTH_CERTIFICATION_METHOD.SK_SMS);
    }
  }

};
