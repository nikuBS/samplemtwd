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
  open: function (svcInfo, urlMeta, authUrl, command, deferred, callback, type) {
    if ( type === Tw.AUTH_CERTIFICATION_METHOD.SK_SMS ) {
      if ( svcInfo.smsYn === 'Y' ) {
        this._certSms.openSmsPopup(svcInfo, urlMeta, authUrl, command, deferred, callback);
      } else {
        this._certKeyin.openKeyinPopup(svcInfo, urlMeta, authUrl, deferred, callback);
      }
    } else {
      if ( svcInfo.motpYn === 'Y' ) {
        this._certMotp.openMotpPopup(svcInfo, urlMeta, authUrl, deferred, callback);
      } else if ( svcInfo.smsYn === 'Y' ) {
        this._certSms.openSmsPopup(svcInfo, urlMeta, authUrl, command, deferred, callback);
      } else {
        this._certKeyin.openKeyinPopup(svcInfo, urlMeta, authUrl, command, deferred, callback);
      }
    }
  }
};