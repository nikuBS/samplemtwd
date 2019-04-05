/**
 * @file certification.public.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.08.20
 */

Tw.CertificationPublic = function () {
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._authUrl = null;
  this._command = null;
  this._callback = null;
  this._authKind = null;
  this._prodAuthKey = null;

  this.$termsConfirm = null;
  this._termsConfirm = false;
};


Tw.CertificationPublic.prototype = {
  ERROR_CODE: {
    CANCEL: 9
  },
  open: function (authUrl, authKind, prodAuthKey, command, callback) {
    this._authUrl = authUrl;
    this._authKind = authKind;
    this._prodAuthKey = prodAuthKey;
    this._command = command;
    this._callback = callback;

    this._openTerms();
  },
  _openTerms: function () {
    this._popupService.open({
      hbs: 'CO_CE_02_04_01_01',
      layer: true
    }, $.proxy(this._onOpenTerms, this), $.proxy(this._onCloseTerms, this));
  },
  _onOpenTerms: function ($popupContainer) {
    this.$termsConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$termsConfirm.on('click', $.proxy(this._onClickTermsConfirm, this));
    $popupContainer.on('change', '#fe-check-terms', $.proxy(this._onCheckTerms, this));
  },
  _onCloseTerms: function () {
    if ( this._termsConfirm ) {
      this._requestAppMessage(this._authUrl);
    }
  },
  _onCheckTerms: function ($event) {
    var $target = $($event.currentTarget);
    if ( $target.prop('checked') ) {
      this.$termsConfirm.attr('disabled', false);
    } else {
      this.$termsConfirm.attr('disabled', true);
    }
  },
  _onClickTermsConfirm: function () {
    this._termsConfirm = true;
    this._popupService.close();
  },
  _requestAppMessage: function (authUrl) {
    this._apiService.request(Tw.API_CMD.BFF_01_0035, {
      authUrl: authUrl
    }).done($.proxy(this._successAppMessage, this));
  },
  _successAppMessage: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openPublicCert(this._setAppMsg(resp.result));
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _openPublicCert: function (message) {
    this._nativeService.send(Tw.NTV_CMD.AUTH_CERT, {
      message: message,
      authUrl: this._authUrl,
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._prodAuthKey : ''
    }, $.proxy(this._onPublicCert, this));
  },
  _onPublicCert: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._setComplete();
    } else if ( resp.resultCode === this.ERROR_CODE.CANCEL ) {
      this._callback({ code: Tw.API_CODE.CERT_CANCEL });
    } else {
      this._callback({
        code: Tw.API_CODE.CERT_FAIL,
        msg: Tw.ALERT_MSG_COMMON.CERT_FAIL
      });
    }
  },
  _setAppMsg: function (result) {
    this._certMethod = result.certMethod;
    if ( this._certMethod !== Tw.AUTH_CERTIFICATION_METHOD.FINANCE_AUTH ) {
      return '';
    }
    if ( this._needAccountInfo(this._command.command.path) ) {
      return Tw.PUBLIC_AUTH_COP + ',' + this._command.params.bankOrCardName + ',' +
        this._command.params.bankOrCardAccn + ',' + result.custName + ',' + result.birthDate;
    }
    return result.custName + ',' + result.birthDate;
  },
  _needAccountInfo: function (path) {
    if ( path === '/bypass/core-bill/v1/bill-pay/settle-pay-bank' ||
      path === '/bypass/core-bill/v1/bill-pay/settle-pay-card' ) {
      return true;
    }
    return false;
  },
  _setComplete: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0026, {
      authUrl: this._authUrl,
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._prodAuthKey : ''
    }).done($.proxy(this._successComplete, this));
  },
  _successComplete: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._callback(resp);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  }
};
