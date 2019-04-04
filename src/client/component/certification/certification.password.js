/**
 * @file certification.password.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.08.20
 */

Tw.CertificationPassword = function () {
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._authUrl = null;
  this._callback = null;
  this._authKind = null;
  this._prodAuthKey = null;

  window.onPopupCallbackPassword = $.proxy(this._onPopupCallback, this);
};


Tw.CertificationPassword.prototype = {
  ERROR_CODE: {
    CANCEL: 1500,
    OVERCOUNT: 5011
  },
  open: function (authUrl, authKind, prodAuthKey, callback) {
    this._authUrl = authUrl;
    this._callback = callback;
    this._authKind = authKind;
    this._prodAuthKey = prodAuthKey;

    this._openCertPassword();
  },
  _openCertPassword: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(Tw.NTV_CMD.CERT_PW, {}, $.proxy(this._onCertResult, this));
    } else {
      this._openCertBrowser();
    }
  },
  _openCertBrowser: function () {
    this._apiService.request(Tw.NODE_CMD.GET_DOMAIN, {})
      .done($.proxy(this._successGetDomain, this));
  },
  _successGetDomain: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.openUrlInApp(resp.result.domain + '/common/tid/cert-pw', 'status=1,toolbar=1');
      // Tw.CommonHelper.openUrlInApp('http://150.28.69.23:3000' + path, 'status=1,toolbar=1');
    }
  },

  _onCertResult: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._confirmPasswordCert();
    } else if ( resp.resultCode === this.ERROR_CODE.CANCEL || resp.resultCode === this.ERROR_CODE.OVERCOUNT ) {
      //
    } else {
      Tw.Error(resp.resultCode, resp.errorMessage).pop();
    }
  },
  _confirmPasswordCert: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0027, {
      type: Tw.AUTH_CERTIFICATION_METHOD.W,
      authUrl: this._authUrl,
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._prodAuthKey : ''
    }).done($.proxy(this._successConfirmPasswordCert, this));
  },
  _successConfirmPasswordCert: function (resp) {
    this._callback(resp);
  },
  _onPopupCallback: function () {
    this._confirmPasswordCert();
  }

};
