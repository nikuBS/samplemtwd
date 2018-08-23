/**
 * FileName: certification.ipin.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationIpin = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._authUrl = '/myt';
};


Tw.CertificationIpin.prototype = {
  IPIN_TYPE: 'pubmain',
  open: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0022, {
      authUrl: this._authUrl,
      resultUrl: 'http://localhost:3000/home'
    }).done($.proxy(this._successRequestIpin, this));
  },
  _successRequestIpin: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openIpinAuth(resp.result);
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _openIpinAuth: function (encData) {
    this._apiService.requestAjax(Tw.AJAX_CMD.OPEN_IPIN_AUTH, {
      m: this.IPIN_TYPE,
      enc_data: encData
    });
  }
};
