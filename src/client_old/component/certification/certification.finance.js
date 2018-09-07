/**
 * FileName: certification.finance.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationFinance = function () {
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

};


Tw.CertificationFinance.prototype = {
  open: function (svcInfo, urlMeta, authUrl, command, deferred, callback) {
    this._requestAppMessage(authUrl);

  },
  _requestAppMessage: function (authUrl) {
    this._apiService.request(Tw.API_CMD.BFF_01_0035, {
      authUrl: authUrl
    }).done($.proxy(this._successAppMessage, this));
  },
  _successAppMessage: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openFinanceCert(resp.result.appMsg);
    } else {
      this._openFinanceCert('');
    }
  },
  _openFinanceCert: function (message) {
    this._nativeService.send(Tw.NTV_CMD.AUTH_CERT, {
      message: message
    }, $.proxy(this._onFinanceCert, this));
  },
  _onFinanceCert: function (resp) {
    console.log(resp);
  }
};
