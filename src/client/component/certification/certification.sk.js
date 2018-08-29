/**
 * FileName: certification.sk.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationSk = function () {
  this._certSms = new Tw.CertificationSkSms();
  this._certKeyin = new Tw.CertificationSkKeyin();
};


Tw.CertificationSk.prototype = {
  open: function (svcInfo, urlMeta, authUrl, command, deferred, callback) {
    this._certSms.openSmsPopup(svcInfo, urlMeta, authUrl, command, deferred, callback);
    // this._certKeyin.openKeyinPopup(svcInfo, urlMeta, authUrl, deferred, callback);
  }
};