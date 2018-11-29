/**
 * FileName: certification.select.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationSelect = function () {
  this._certSk = new Tw.CertificationSk();
  this._certEmail = new Tw.CertificationEmail();
  this._certPassword = new Tw.CertificationPassword();
  this._certSmsPw = new Tw.CertificationSmsPassword();
  this._certPublic = new Tw.CertificationPublic();
  this._certFinance = new Tw.CertificationFinance();

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._certMethod = null;
  this._niceType = null;
  this._authKind = null;

  this._svcInfo = null;
  this._certInfo = null;
  this._authUrl = null;
  this._command = null;
  this._deferred = null;
  this._callback = null;

  this._optionCert = false;

  window.onPopupCallback = $.proxy(this._onPopupCallback, this);
  window.onCloseInApp = $.proxy(this._onPopupCallback, this);
};


Tw.CertificationSelect.prototype = {
  open: function (certInfo, command, deferred, callback) {
    this._certInfo = certInfo;
    this._command = command;
    this._authUrl = this._command === null ? '' : '/bypass' + this._command.command.path;
    this._deferred = deferred;
    this._callback = callback;

    this._getSvcInfo();
  },
  _getSvcInfo: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successGetSvcInfo, this));
  },
  _successGetSvcInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcInfo = resp.result;
      this._selectKind();
    }
  },
  _selectKind: function () {
    var methods = {};
    var optMethods = '';
    this._authKind = this._certInfo.authClCd;

    if ( this._authKind !== Tw.AUTH_CERTIFICATION_KIND.F ) {
      methods = Tw.BrowserHelper.isApp() ? this._certInfo.mobileApp : this._certInfo.mobileWeb;
      optMethods = methods.optAuthMethods;
    }

    if ( !Tw.FormatHelper.isEmpty(optMethods) && optMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.PASSWORD) !== -1 ) {
      this._optionCert = true;
    }

    switch ( this._authKind ) {
      case Tw.AUTH_CERTIFICATION_KIND.R:
        this._openProductCert();
        break;
      case Tw.AUTH_CERTIFICATION_KIND.A:
        // this._openOpCert();
        break;
      case Tw.AUTH_CERTIFICATION_KIND.P:
        this._openOpCert(methods.opAuthMethods);
        break;
      case Tw.AUTH_CERTIFICATION_KIND.O:
        // this._openOpCert();
        break;
      case Tw.AUTH_CERTIFICATION_KIND.F:
        this._openRefundCert();
        break;
      default:
        Tw.Logger.error('[Cert] Not supported', this._authKind);
        break;
    }
  },
  _openOpCert: function (methods) {
    var loginType = this._svcInfo.loginType;
    var methodCnt = 1;
    if ( methods.indexOf(',') !== -1 ) {
      methodCnt = methods.split(',').length;
    }

    if ( methodCnt === 1 ) {
      this._openCertPopup(methods);
    } else {
      this._openSelectPopup(loginType, methods, methodCnt);
    }
  },
  _openProductCert: function () {
    this._apiService.request(Tw.API_CMD.BFF_10_9001, {}, {}, this._command.params.prodId, this._command.params.prodProcTypeCd)
      .done($.proxy(this._successGetPublicCert, this));
  },

  _openMaskingCert: function () {

  },
  _openRefundCert: function () {
    this._popupService.open({
      hbs: 'CO_CE_02_01_refund',
      layer: true,
    }, $.proxy(this._opOpenRefundSelectPopup, this), $.proxy(this._onCloseSelectPopup, this), 'certSelect');

  },

  _successGetPublicCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( Tw.FormatHelper.isEmpty(resp.result.prodAuthMethods) ) {
        this._callback({
          code: Tw.API_CODE.CODE_00
        }, this._deferred, this._command);
      } else {
        console.log('process cert');
      }
    } else {
      this._callback(resp, this._deferred, this._command);
    }
  },

  _openSelectPopup: function (loginType, methods, methodCnt) {
    this._popupService.open({
      hbs: 'CO_CE_02_01',
      layer: true,
      data: {
        tidLogin: loginType === Tw.AUTH_LOGIN_TYPE.TID,
        cntClass: methodCnt === 1 ? 'one' : methodCnt === 2 ? 'two' : 'three',
        skSms: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS) !== -1 || methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE) !== -1,
        otherSms: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS) !== -1,
        // otherSms: true,
        save: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SAVE) !== -1,
        // save: true,
        publicCert: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH) !== -1,
        // publicCert: true,
        ipin: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.IPIN) !== -1,
        // ipin: true,
        bio: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.BIO) !== -1
        // bio: true,
      }
    }, $.proxy(this._onOpenSelectPopup, this), $.proxy(this._onCloseSelectPopup, this), 'certSelect');
  },
  _openCertPopup: function (method) {
    if ( !Tw.FormatHelper.isEmpty(method) ) {
      this._certMethod = method;
    }
    switch ( this._certMethod ) {
      case Tw.AUTH_CERTIFICATION_METHOD.SK_SMS:
        this._certSk.open(
          this._svcInfo, this._authUrl, this._command, this._deferred, this._callback, this._authKind, Tw.AUTH_CERTIFICATION_METHOD.SK_SMS);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS:
        this._openCertBrowser('/common/cert/nice?authUrl=' + this._authUrl + '&niceType=' + this._niceType);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.IPIN:
        this._openCertBrowser('/common/cert/ipin?authUrl=' + this._authUrl + '&authKind=' + this._authKind);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.PASSWORD:
        this._certPassword.open(this._svcInfo, this._authUrl, this._command, this._deferred, this._callback, this._authKind);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH:
        this._certPublic.open(this._svcInfo, this._urlMeta, this._authUrl, this._command, this._deferred, this._callback, this._authKind);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.BIO:
        this._popupService.openAlert('Not Supported (Bio)');
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.FINANCE_AUTH:
        this._certFinance.open(this._svcInfo, this._authUrl, this._command, this._deferred, this._callback, this._authKind);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.SMS_REFUND:
        //
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.OTHER_REFUND:
        this._openCertBrowser('/common/cert/nice/refund?niceType=' + this._niceType);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.IPIN_REFUND:
        this._openCertBrowser('/common/cert/ipin/refund');
        break;
      default:
        this._popupService.openAlert('Not Supported');
        break;
    }
  },
  _onOpenSelectPopup: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-sk', $.proxy(this._onClickSkSms, this));
    $popupContainer.on('click', '#fe-bt-kt', $.proxy(this._onClickKtSms, this));
    $popupContainer.on('click', '#fe-bt-lg', $.proxy(this._onClickLgSms, this));
    $popupContainer.on('click', '#fe-bt-save', $.proxy(this._onClickSaveSms, this));
    $popupContainer.on('click', '#fe-bt-ipin', $.proxy(this._onClickIpin, this));
    $popupContainer.on('click', '#fe-bt-bio', $.proxy(this._onClickBio, this));
    $popupContainer.on('click', '#fe-bt-public', $.proxy(this._onClickSkPublic, this));
    $popupContainer.on('click', '#fe-bt-smspw', $.proxy(this._onClickSmsPw, this));
  },
  _opOpenRefundSelectPopup: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-sk-refund', $.proxy(this._onClickSkSmsRefund, this));
    $popupContainer.on('click', '#fe-bt-kt-refund', $.proxy(this._onClickKtSmsRefund, this));
    $popupContainer.on('click', '#fe-bt-lg-refund', $.proxy(this._onClickLgSmsRefund, this));
    $popupContainer.on('click', '#fe-bt-save-refund', $.proxy(this._onClickSaveSmsRefund, this));
    $popupContainer.on('click', '#fe-bt-ipin-refund', $.proxy(this._onClickIpinRefund, this));
  },
  _onCloseSelectPopup: function () {
    if ( !Tw.FormatHelper.isEmpty(this._certMethod) ) {
      this._openCertPopup();
    }
  },
  _openCertBrowser: function (path) {
    this._apiService.request(Tw.NODE_CMD.GET_DOMAIN, {})
      .done($.proxy(this._successGetDomain, this, path));
  },
  _successGetDomain: function (path, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.openUrlInApp(resp.result.domain + path, 'status=1,toolbar=1');
      // Tw.CommonHelper.openUrlInApp('http://150.28.69.23:3000' + path, 'status=1,toolbar=1');
    }
  },
  _onClickSkSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.SK_SMS;
    this._popupService.close();
  },
  _onClickKtSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS;
    this._niceType = Tw.AUTH_CERTIFICATION_NICE.KT;
    this._popupService.close();
  },
  _onClickLgSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS;
    this._niceType = Tw.AUTH_CERTIFICATION_NICE.LG;
    this._popupService.close();
  },
  _onClickSaveSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS;
    this._niceType = Tw.AUTH_CERTIFICATION_NICE.SAVE;
    this._popupService.close();
  },
  _onClickIpin: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.IPIN;
    this._popupService.close();
  },
  _onClickBio: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.BIO;
    this._popupService.close();
  },
  _onClickSkPublic: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH;
    this._popupService.close();
  },
  _onClickSkSmsRefund: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.SMS_REFUND;
    this._popupService.close();
  },
  _onClickKtSmsRefund: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_REFUND;
    this._niceType = Tw.AUTH_CERTIFICATION_NICE.KT;
    this._popupService.close();
  },
  _onClickLgSmsRefund: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_REFUND;
    this._niceType = Tw.AUTH_CERTIFICATION_NICE.LG;
    this._popupService.close();
  },
  _onClickSaveSmsRefund: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_REFUND;
    this._niceType = Tw.AUTH_CERTIFICATION_NICE.SAVE;
    this._popupService.close();
  },
  _onClickIpinRefund: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.IPIN_REFUND;
    this._popupService.close();
  },

  _onPopupCallback: function (resp) {
    if ( this._optionCert ) {
      this._openOpCert = false;
      this._certPassword.open(this._svcInfo, this._authUrl, this._command, this._deferred, this._callback, this._authKind);
    } else {
      this._callback({ code: Tw.API_CODE.CODE_00 }, this._deferred, this._command);
    }
  }
};
