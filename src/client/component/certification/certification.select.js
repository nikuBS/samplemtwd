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

  this._svcInfo = null;
  this._urlMeta = null;
  this._authUrl = null;
  this._resultUrl = null;
  this._command = null;
  this._deferred = null;
  this._callback = null;

  window.onPopupCallback = $.proxy(this._onPopupCallback, this);
  window.onCloseInApp = $.proxy(this._onPopupCallback, this);
};


Tw.CertificationSelect.prototype = {
  open: function (certInfo, command, deferred, callback) {
    this._authUrl = certInfo.url;
    this._svcInfo = certInfo.svcInfo;
    this._urlMeta = certInfo.urlMeta;
    this._resultUrl = '/auth/cert/complete';
    this._command = command;
    this._deferred = deferred;
    this._callback = callback;

    if ( !Tw.FormatHelper.isEmpty(this._urlMeta.auth.cert.prodProcType) ) {
      // 상품인증
      this._openProductCert();
    } else if ( this._urlMeta.auth.cert.opAuthYn === 'Y' ) {
      // 업무인증
      this._openOpCert();
    } else {
      // 잘못된 인증정보
      console.log('Wrong Cert');
    }

  },
  _openOpCert: function () {
    var methods = this._urlMeta.auth.cert.methods;
    var loginType = this._svcInfo.loginType;
    var methodCnt = 0;

    if ( loginType === Tw.AUTH_LOGIN_TYPE.EASY ) {
      this._openSelectPopup(loginType, methods);
    } else {
      if ( methods.indexOf(',') !== -1 && !Tw.BrowserHelper.isApp() ) {
        methods = methods.split(',');
        Tw.FormatHelper.removeElement(methods, Tw.AUTH_CERTIFICATION_METHOD.BIO);
        Tw.FormatHelper.removeElement(methods, Tw.AUTH_CERTIFICATION_METHOD.PASSWORD);
        Tw.FormatHelper.removeElement(methods, Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH);
        Tw.FormatHelper.removeElement(methods, Tw.AUTH_CERTIFICATION_METHOD.SMS_PASSWORD);
        if ( Tw.BrowserHelper.isAndroid() ) {
          Tw.FormatHelper.removeElement(methods, Tw.AUTH_CERTIFICATION_METHOD.SK_MOTP);
        }
        methodCnt = methods.length;
        methods = methods.join(',');
      }
      if ( methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SMS_KEYIN) !== -1 ) {
        methodCnt--;
      }
      if ( methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS) !== -1 ) {
        methodCnt++;
      }

      if ( methods.indexOf(',') === -1 && methods.length > 0 ) {
        this._openCertPopup(methods);
      } else {
        this._openSelectPopup(this._svcInfo.loginType, methods, methodCnt);
      }
    }
  },
  _openProductCert: function () {
    console.log('product cert');
  },

  _openSelectPopup: function (loginType, methods, methodCnt) {
    var popupType = loginType === Tw.AUTH_LOGIN_TYPE.TID ? 'CO_02_01_01_01' : 'CO_02_01_01_02';
    this._popupService.open({
      hbs: popupType,
      layer: true,
      data: {
        cntClass: methodCnt === 1 ? 'one' : methodCnt === 2 ? 'two' : 'three',
        skSms: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS) !== -1,
        skMotp: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_MOTP) !== -1,
        // skMotp: true,
        otherSms: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS) !== -1,
        // otherSms: true,
        save: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SAVE) !== -1,
        // save: true,
        ipin: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.IPIN) !== -1,
        // ipin: true,
        email: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.EMAIL) !== -1,
        // email: true,
        bio: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.BIO) !== -1,
        // bio: true,
        password: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.PASSWORD) !== -1,
        // password: true,
        publicCert: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH) !== -1,
        // publicCert: true,
        smsPassword: methods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SMS_PASSWORD) !== -1
        // smsPassword: true
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
          this._svcInfo, this._authUrl, this._command, this._deferred, this._callback, Tw.AUTH_CERTIFICATION_METHOD.SK_SMS);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.SK_MOTP:
        this._certSk.open(
          this._svcInfo, this._authUrl, this._command, this._deferred, this._callback, Tw.AUTH_CERTIFICATION_METHOD.SK_MOTP);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS:
        this._openCertBrowser('/auth/cert/nice?authUrl=' + this._authUrl + '&resultUrl=' + this._resultUrl + '&niceType=' + this._niceType);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.IPIN:
        this._openCertBrowser('/auth/cert/ipin?authUrl=' + this._authUrl + '&resultUrl=' + this._resultUrl);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.EMAIL:
        this._certEmail.open(this._svcInfo, this._authUrl, this._command, this._deferred, this._callback);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.PASSWORD:
        this._certPassword.open(this._svcInfo, this._authUrl, this._command, this._deferred, this._callback);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH:
        this._certPublic.open(this._svcInfo, this._urlMeta, this._authUrl, this._command, this._deferred, this._callback);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.BIO:
        this._popupService.openAlert('Not Supported (Bio)');
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.SMS_PASSWORD:
        this._certSmsPw.open(this._svcInfo, this._authUrl, this._command, this._deferred, this._callback);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.FINANCE_AUTH:
        this._certFinance.open(this._svcInfo, this._authUrl, this._command, this._deferred, this._callback);
        break;
      default:
        this._popupService.openAlert('Not Supported');
        break;
    }
  },
  _onOpenSelectPopup: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-sk', $.proxy(this._onClickSkSms, this));
    $popupContainer.on('click', '#fe-bt-motp', $.proxy(this._onClickMotp, this));
    $popupContainer.on('click', '#fe-bt-kt', $.proxy(this._onClickKtSms, this));
    $popupContainer.on('click', '#fe-bt-lg', $.proxy(this._onClickLgSms, this));
    $popupContainer.on('click', '#fe-bt-save', $.proxy(this._onClickSaveSms, this));
    $popupContainer.on('click', '#fe-bt-ipin', $.proxy(this._onClickIpin, this));
    $popupContainer.on('click', '#fe-bt-email', $.proxy(this._onClickEmail, this));
    $popupContainer.on('click', '#fe-bt-bio', $.proxy(this._onClickBio, this));
    $popupContainer.on('click', '#fe-bt-password', $.proxy(this._onClickSkPassword, this));
    $popupContainer.on('click', '#fe-bt-public', $.proxy(this._onClickSkPublic, this));
    $popupContainer.on('click', '#fe-bt-smspw', $.proxy(this._onClickSmsPw, this));
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
  _onClickMotp: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.SK_MOTP;
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
  _onClickEmail: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.EMAIL;
    this._popupService.close();
  },
  _onClickBio: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.BIO;
    this._popupService.close();
  },
  _onClickSkPassword: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.PASSWORD;
    this._popupService.close();
  },
  _onClickSkPublic: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH;
    this._popupService.close();
  },
  _onClickSmsPw: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.SMS_PASSWORD;
    this._popupService.close();
  },
  _onPopupCallback: function (resp) {
    this._callback({ code: Tw.API_CODE.CODE_00 }, this._deferred, this._command);
  }
};
