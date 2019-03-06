/**
 * FileName: certification.select.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationSelect = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._certMethod = null;
  this._openCert = false;
  this._niceKind = null;
  this._authKind = null;

  this._opMethods = '';
  this._optMethods = '';
  this._methodCnt = 1;
  this._enableFido = false;
  this._registerFido = false;
  this._useFido = false;
  this._fidoTarget = '';

  this._svcInfo = null;
  this._certInfo = null;
  this._authUrl = null;
  this._command = null;
  this._deferred = null;
  this._callback = null;
  this._prodAuthKey = '';

  this._smsBlock = false;
  this._optionCert = false;

  this._certSk = new Tw.CertificationSk();
};


Tw.CertificationSelect.prototype = {
  FIDO_TYPE: {
    '0': Tw.FIDO_TYPE.FINGER,
    '1': Tw.FIDO_TYPE.FACE
  },
  open: function (certInfo, authUrl, command, deferred, callback) {
    this._certInfo = certInfo;
    this._command = command;
    this._authUrl = authUrl;
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
    this._authKind = this._certInfo.authClCd;

    switch ( this._authKind ) {
      case Tw.AUTH_CERTIFICATION_KIND.R:  // 상품
        this._openProductCert();
        break;
      case Tw.AUTH_CERTIFICATION_KIND.A:  // 마스킹
        this._openMaskingCert();
        break;
      case Tw.AUTH_CERTIFICATION_KIND.P:  // 업무c
      case Tw.AUTH_CERTIFICATION_KIND.O:  // 업무 & 마스킹
        this._openBusinessCert();
        break;
      case Tw.AUTH_CERTIFICATION_KIND.F:  // 미환급금
        this._openRefundCert();
        break;
      default:
        Tw.Logger.error('[Cert] Not supported', this._authKind);
        break;
    }
  },
  _fidoType: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_TYPE, {}, $.proxy(this._onFidoType, this));
  },
  _onFidoType: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 || resp.resultCode === Tw.NTV_CODE.CODE_01 ) {
      this._enableFido = true;
      this._fidoTarget = this.FIDO_TYPE[resp.resultCode];
      this._checkFido();
    } else {
      this._checkSmsPri();
    }
  },
  _checkFido: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_CHECK, { svcMgmtNum: this._svcInfo.svcMgmtNum }, $.proxy(this._onCheckFido, this));
  },
  _onCheckFido: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._registerFido = true;
      this._checkFidoUse();
    } else {
      this._checkSmsPri();
    }
  },
  _checkFidoUse: function () {
    this._nativeService.send(Tw.NTV_CMD.LOAD, { key: Tw.NTV_STORAGE.FIDO_USE + ':' + this._svcInfo.svcMgmtNum }, $.proxy(this._onCheckFidoUse, this));
  },
  _onCheckFidoUse: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      if ( resp.params.value === 'Y' ) {
        this._useFido = true;
        this._openCertPopup(Tw.AUTH_CERTIFICATION_METHOD.BIO);
      } else {
        this._checkSmsPri();
      }
    } else {
      this._checkSmsPri();
    }
  },
  _checkSmsPri: function () {
    if ( this._includeSkSms() ) {
      this._openCertPopup(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS);
    } else {
      this._openSelectPopup(true);
    }
  },
  _openOpCert: function () {
    if ( this._opMethods.indexOf(',') !== -1 ) {
      this._methodCnt = this._opMethods.split(',').length;
    }

    if ( this._methodCnt === 1 ) {
      this._openCertPopup(this._opMethods);
    } else {
      // 인증그룹2 인경우 App/Web 에 따라 FIDO/SMS 우선인증 체크필요
      if ( this._includeFido() ) {
        this._fidoType();
      } else {
        this._checkSmsPri();
      }
    }
  },
  _includeFido: function () {
    return this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.BIO) !== -1;
  },
  _includeSkSms: function () {
    return this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS) !== -1 ||
      this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE) !== -1;
  },
  _openMaskingCert: function () {
    var methods = Tw.BrowserHelper.isApp() ? this._certInfo.mobileApp : this._certInfo.mobileWeb;
    this._opMethods = methods.opAuthMethods;
    this._optMethods = methods.optAuthMethods || '';
    this._openOpCert();
  },
  _openBusinessCert: function () {
    var methods = Tw.BrowserHelper.isApp() ? this._certInfo.mobileApp : this._certInfo.mobileWeb;
    if ( !Tw.FormatHelper.isEmpty(this._authKind) ) {
      this._opMethods = methods.opAuthMethods;
      this._optMethods = methods.optAuthMethods || '';
    }
    if ( !Tw.FormatHelper.isEmpty(this._optMethods) && this._optMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.PASSWORD) !== -1 ) {
      this._optionCert = true;
    }
    this._openOpCert();
  },
  _openProductCert: function () {
    this._prodAuthKey = this._certInfo.prodAuthKey;
    this._opMethods = this._certInfo.opAuthMethods;
    this._optMethods = this._certInfo.optAuthMethods;

    if ( !Tw.FormatHelper.isEmpty(this._optMethods) && this._optMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.PASSWORD) !== -1 ) {
      this._optionCert = true;
    }
    this._openOpCert();
  },
  _openRefundCert: function () {
    this._popupService.open({
      hbs: 'CO_CE_02_01_refund',
      layer: true
    }, $.proxy(this._opOpenRefundSelectPopup, this), $.proxy(this._onCloseSelectPopup, this), 'certSelect');
  },

  _openSelectPopup: function (isWelcome) {
    var methods = {
      skSms: !this._smsBlock && (this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS) !== -1 ||
        this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE) !== -1),
      otherSms: this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS) !== -1,
      save: this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SAVE) !== -1,
      publicCert: this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH) !== -1,
      ipin: this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.IPIN) !== -1,
      bio: this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.BIO) !== -1 &&
        ((this._enableFido && !this._registerFido) || (this._enableFido && this._registerFido && this._useFido))
    };

    var enableMethod = _.find(methods, $.proxy(function (method) {
      return method === true;
    }, this));

    if ( Tw.FormatHelper.isEmpty(enableMethod) ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_BLOCK.TITLE, Tw.BUTTON_LABEL.CLOSE);
      return;
    }

    this._popupService.open({
      hbs: 'CO_CE_02_01',
      layer: true,
      data: {
        isWelcome: isWelcome,
        sLogin: this._svcInfo.loginType === Tw.AUTH_LOGIN_TYPE.EASY,
        masking: this._authKind === Tw.AUTH_CERTIFICATION_KIND.A,
        cntClass: this._methodCnt === 1 ? 'one' : this._methodCnt === 2 ? 'two' : 'three',
        methods: methods
      }
    }, $.proxy(this._onOpenSelectPopup, this), $.proxy(this._onCloseSelectPopup, this), 'certSelect');
  },
  _openCertPopup: function (methods) {
    var isWelcome = false;
    if ( !Tw.FormatHelper.isEmpty(methods) ) {
      this._certMethod = methods;
      isWelcome = true;
    }

    switch ( this._certMethod ) {
      case Tw.AUTH_CERTIFICATION_METHOD.SK_SMS:
        this._certSk.open(
          this._svcInfo, this._authUrl, this._authKind, this._prodAuthKey, $.proxy(this._completeCert, this),
          this._opMethods, this._optMethods, isWelcome, this._methodCnt);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS:
        this._certNice = new Tw.CertificationNice();
        this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, this._niceKind, this._prodAuthKey, $.proxy(this._completeCert, this));
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.IPIN:
        this._certNice = new Tw.CertificationNice();
        this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.IPIN, this._niceKind, this._prodAuthKey, $.proxy(this._completeCert, this));
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.PASSWORD:
        this._certPassword = new Tw.CertificationPassword();
        this._certPassword.open(this._authUrl, this._authKind, this._prodAuthKey, $.proxy(this._completeCert, this));
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH:
        this._certPublic = new Tw.CertificationPublic();
        this._certPublic.open(this._authUrl, this._authKind, this._prodAuthKey, this._command, $.proxy(this._completeCert, this));
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.BIO:
        this._certBio = new Tw.CertificationBio();
        this._certBio.open(this._authUrl, this._authKind, this._prodAuthKey, this._svcInfo,
          $.proxy(this._completeCert, this), this._registerFido, this._fidoTarget);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.FINANCE_AUTH:
        this._certFinance = new Tw.CertificationFinance();
        this._certFinance.open(this._svcInfo, this._authUrl, this._authKind, this._prodAuthKey, this._command, $.proxy(this._completeCert, this));
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.SMS_REFUND:
        (new Tw.CertificationSkSmsRefund()).openSmsPopup($.proxy(this._completeCert, this));
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
    $popupContainer.on('click', '#fe-bt-kt-refund', $.proxy(this._onClickKtSms, this));
    $popupContainer.on('click', '#fe-bt-lg-refund', $.proxy(this._onClickLgSms, this));
    $popupContainer.on('click', '#fe-bt-save-refund', $.proxy(this._onClickSaveSms, this));
    $popupContainer.on('click', '#fe-bt-ipin-refund', $.proxy(this._onClickIpin, this));
  },
  _onCloseSelectPopup: function () {
    if ( this._openCert ) {
      this._openCert = false;
      this._openCertPopup();
    }
  },
  _onClickSkSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.SK_SMS;
    this._openCert = true;
    this._userSmsOpen = true;
    this._popupService.close();
  },
  _onClickKtSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS;
    this._niceKind = Tw.AUTH_CERTIFICATION_NICE.KT;
    this._openCert = true;
    this._popupService.close();
  },
  _onClickLgSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS;
    this._niceKind = Tw.AUTH_CERTIFICATION_NICE.LG;
    this._openCert = true;
    this._popupService.close();
  },
  _onClickSaveSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS;
    this._niceKind = Tw.AUTH_CERTIFICATION_NICE.SAVE;
    this._openCert = true;
    this._popupService.close();
  },
  _onClickIpin: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.IPIN;
    this._openCert = true;
    this._popupService.close();
  },
  _onClickBio: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.BIO;
    this._openCert = true;
    this._popupService.close();
  },
  _onClickSkPublic: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH;
    this._openCert = true;
    this._popupService.close();
  },
  _onClickSkSmsRefund: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.SMS_REFUND;
    this._openCert = true;
    this._popupService.close();
  },
  _completeCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( this._optionCert ) {
        this._optionCert = false;
        this._certPassword = new Tw.CertificationPassword();
        this._certPassword.open(this._authUrl, this._authKind, this._command, $.proxy(this._completeCert, this));
      } else {
        resp.authKind = this._authKind;
        if ( !Tw.FormatHelper.isEmpty(this._svcInfo) ) {
          resp.svcMgmtNum = this._svcInfo.svcMgmtNum;
        } else {
          resp.svcMgmtNum = '';
        }
        this._callback(resp, this._deferred, this._command);
      }
    } else if ( resp.code === Tw.API_CODE.CERT_SELECT ) {
      if ( !Tw.FormatHelper.isEmpty(resp.target) && resp.target === Tw.AUTH_CERTIFICATION_METHOD.SK_SMS ) {
        this._openSelectPopup(false);
      } else {
        this._checkSmsEnable();
      }
    } else if ( resp.code === Tw.API_CODE.CERT_SMS_BLOCK ) {
      this._smsBlock = true;
      this._openSelectPopup(false);
    } else {
      // TODO: 인증 실패
      this._callback(resp, this._deferred, this._command);
    }
  },
  _checkSmsEnable: function () {
    this._certSk.checkSmsEnable(this._svcInfo, this._opMethods, this._optMethods, this._methodCnt, $.proxy(this._completeCheckSmsEnable, this));
  },
  _completeCheckSmsEnable: function (resp) {
    if ( resp.code === Tw.API_CODE.CERT_SMS_BLOCK ) {
      this._smsBlock = true;
    }
    this._openSelectPopup(false);
  }
};
