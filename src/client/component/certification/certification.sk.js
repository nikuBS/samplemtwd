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
  open: function () {
    // this._certSms.openSmsPopup();
    // this._certKeyin.openKeyinPopup();
    this._certMotp.openMotpPopup();
  }
};