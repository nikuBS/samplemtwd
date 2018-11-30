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
  open: function (svcInfo, authUrl, authKind, command, type, callback) {
    if ( type === Tw.AUTH_CERTIFICATION_METHOD.SK_SMS ) {
      if ( svcInfo.smsUsableYn === 'Y' ) {
        this._certSms.openSmsPopup(svcInfo, authUrl, authKind, command, callback);
      } else {
        this._certKeyin.openKeyinPopup(svcInfo, authUrl, authKind, command, callback);
      }
    } else {
      if ( svcInfo.motpUsableYn === 'Y' ) {
        this._certMotp.openMotpPopup(svcInfo, authUrl, authKind, command, callback);
      } else if ( svcInfo.smsUsableYn === 'Y' ) {
        this._certSms.openSmsPopup(svcInfo, authUrl, authKind, command, callback);
      } else {
        this._certKeyin.openKeyinPopup(svcInfo, authUrl, authKind, command, callback);
      }
    }
  }
};