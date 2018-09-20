/**
 * FileName: certification.public.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationPublic = function () {
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._authUrl = null;

};


Tw.CertificationPublic.prototype = {
  open: function (svcInfo, urlMeta, authUrl, command, deferred, callback) {
    this._authUrl = authUrl;
    this._requestAppMessage(authUrl);

  },
  _requestAppMessage: function (authUrl) {
    this._apiService.request(Tw.API_CMD.BFF_01_0035, {
      authUrl: authUrl
    }).done($.proxy(this._successAppMessage, this));
  },
  _successAppMessage: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openPublicCert(resp.result.appMsg);
    } else {
      this._openPublicCert('');
    }
  },
  _openPublicCert: function (message) {
    this._nativeService.send(Tw.NTV_CMD.AUTH_CERT, {
      message: message,
      authUrl: this._authUrl
    }, $.proxy(this._onPublicCert, this));
  },
  _onPublicCert: function (resp) {
    console.log(resp);
  }
};
