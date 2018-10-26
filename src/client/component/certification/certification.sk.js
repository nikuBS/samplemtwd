/**
 * FileName: certification.sk.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationSk = function () {
  this._certSms = new Tw.CertificationSkSms();
  this._certKeyin = new Tw.CertificationSkKeyin();
  this._certMotp = new Tw.CertificationSkMotp();
};


Tw.CertificationSk.prototype = {
  open: function (svcInfo, authUrl, command, deferred, callback, authKind, type) {
    if ( type === Tw.AUTH_CERTIFICATION_METHOD.SK_SMS ) {
      if ( svcInfo.smsUsableYn === 'Y' ) {
        this._certSms.openSmsPopup(svcInfo, authUrl, command, deferred, callback, authKind);
      } else {
        this._certKeyin.openKeyinPopup(svcInfo, authUrl, command, deferred, callback, authKind);
      }
    } else {
      if ( svcInfo.motpUsableYn === 'Y' ) {
        this._certMotp.openMotpPopup(svcInfo, authUrl, command, deferred, callback, authKind);
      } else if ( svcInfo.smsUsableYn === 'Y' ) {
        this._certSms.openSmsPopup(svcInfo, authUrl, command, deferred, callback, authKind);
      } else {
        this._certKeyin.openKeyinPopup(svcInfo, authUrl, command, deferred, callback, authKind);
      }
    }
  }
};