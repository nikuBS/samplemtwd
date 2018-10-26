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
  this._authKind = null;
};


Tw.CertificationPublic.prototype = {
  open: function (svcInfo, authUrl, command, deferred, callback, authKind) {
    this._authUrl = authUrl;
    this._command = command;
    this._callback = callback;
    this._deferred = deferred;
    this._authKind = authKind;
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
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._setComplete();
    } else {
      this._callback({
        code: Tw.API_CODE.CERT_FAIL
      }, this._deferred, this._command);
    }
  },
  _setAppMsg: function (result) {
    this._certMethod = result.certMethod;
    if ( this._certMethod !== Tw.AUTH_CERTIFICATION_METHOD.FINANCE_AUTH ) {
      return '';
    }
    if ( this._needAccountInfo(this._command.command.path) ) {
      return Tw.PUBLIC_AUTH_COP + ',' + this._command.params.bankOrCardName + ',' + this._command.params.bankOrCardAccn + ',' + result.custName + ',' + result.birthDate;
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
  },
  _setComplete: function () {
    // TODO: 상품인경우 prodAuthKey 추가
    this._apiService.request(Tw.API_CMD.BFF_01_0026, {
      authUrl: this._command.command.method + '|' + this._authUrl,
      authKind: this._authKind
    }).done($.proxy(this._successComplete, this));
  },
  _successComplete: function (resp) {
    this._callback(resp, this._deferred, this._command);
  }
};
