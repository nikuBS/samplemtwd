/**
 * FileName: certification.public.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationPublic = function () {
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._authUrl = null;
  this._command = null;
  this._callback = null;
  this._deferred = null;
};


Tw.CertificationPublic.prototype = {
  open: function (svcInfo, authUrl, command, deferred, callback) {
    this._authUrl = authUrl;
    this._command = command;
    this._callback = callback;
    this._deferred = deferred;
    this._requestAppMessage(authUrl, command);
  },
  _requestAppMessage: function (authUrl, command) {
    this._apiService.request(Tw.API_CMD.BFF_01_0035, {
      authUrl: command.command.method + '|' + authUrl
    }).done($.proxy(this._successAppMessage, this));
  },
  _successAppMessage: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openPublicCert(this._setAppMsg(resp.result));
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
    if(resp.code === Tw.NTV_CODE.CODE_00) {
      this._callback({
        code: Tw.API_CODE.CODE_00
      }, this._deferred, this._command);
    } else {}
    this._callback({
      code: Tw.API_CODE.CERT_FAIL
    }, this._deferred, this._command);
  },
  _setAppMsg: function (result) {
    if ( result.certMethod !== Tw.AUTH_CERTIFICATION_METHOD.FINANCE_AUTH ) {
      return '';
    }
    if ( this._needAccountInfo(this._command.command.path) ) {
      // TODO: deleted
      return Tw.PUBLIC_AUTH_COP + ',' + '신한은행' + ',' + this._command.params.bankOrCardAccn + ',' + result.custName + ',' + result.birthDate;
    }
    return result.custName + ',' + result.birthDate;
  },
  _needAccountInfo: function (path) {
    if ( path === '/core-bill/v1/bill-pay/settle-pay-bank' ||
      path === '/bypass/core-bill/v1/bill-pay/settle-pay-card' ||
      path === '/bypass/core-bill/v1/ocb-point-pay' ) {
      return true;
    }
    return false;
  }
};
