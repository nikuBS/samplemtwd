/**
 * FileName: certification.select.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationSelect = function () {
  this._certSk = new Tw.CertificationSk();
  this._certEmail = new Tw.CertificationEmail();
  this._certPassword = new Tw.CertificationPassword();
  this._historyService = new Tw.HistoryService();

  this._popupService = Tw.Popup;

  this._certMethod = null;
  this._niceType = null;
  this._authUrl = '/myt';
  this._resultUrl = '/home';
};


Tw.CertificationSelect.prototype = {
  open: function (loginType, method) {
    console.log(loginType, method);
    if(loginType === 'T') {
      this.openSelectPopup('CO_02_01_01_L01');
    } else {
      this.openSelectPopup('CO_02_01_01_L02');
    }
  },
  openSelectPopup: function (popupType) {
    this._popupService.open({
      hbs: popupType,
      layer: true,
      data: {
        skSms: true,
        otherSms: true,
        ipin: true,
        email: true,
        bio: false,
        password: true,
        finance: true
      }
    }, $.proxy(this._onOpenSelectPopup, this), $.proxy(this._onCloseSelectPopup, this));
  },
  _onOpenSelectPopup: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-sk', $.proxy(this._onClickSkSms, this));
    $popupContainer.on('click', '#fe-bt-kt', $.proxy(this._onClickKtSms, this));
    $popupContainer.on('click', '#fe-bt-lg', $.proxy(this._onClickLgSms, this));
    $popupContainer.on('click', '#fe-bt-save', $.proxy(this._onClickSaveSms, this));
    $popupContainer.on('click', '#fe-bt-ipin', $.proxy(this._onClickIpin, this));
    $popupContainer.on('click', '#fe-bt-email', $.proxy(this._onClickEmail, this));
    $popupContainer.on('click', '#fe-bt-bio', $.proxy(this._onClickBio, this));
    $popupContainer.on('click', '#fe-bt-password', $.proxy(this._onClickSkPassword, this));
    $popupContainer.on('click', '#fe-bt-finance', $.proxy(this._onClickSkFinance, this));

  },
  _onCloseSelectPopup: function () {
    if ( !Tw.FormatHelper.isEmpty(this._certMethod) ) {
      switch ( this._certMethod ) {
        case Tw.AUTH_CERTIFIATION_METHOD.SK_SMS:
          this._certSk.open();
          break;
        case Tw.AUTH_CERTIFIATION_METHOD.OTHER_SMS:
          this._historyService.goLoad('/auth/cert/nice?authUrl=' + this._authUrl + '&resultUrl=' + this._resultUrl + '&niceType=' + this._niceType);
          break;
        case Tw.AUTH_CERTIFIATION_METHOD.IPIN:
          this._historyService.goLoad('/auth/cert/ipin?authUrl=' + this._authUrl + '&resultUrl=' + this._resultUrl);
          break;
        case Tw.AUTH_CERTIFIATION_METHOD.EMAIL:
          this._certEmail.open();
          break;
        case Tw.AUTH_CERTIFIATION_METHOD.PASSWORD:
          this._certPassword.open();
          break;
        case Tw.AUTH_CERTIFIATION_METHOD.FINANCE_AUTH:
          this._popupService.openAlert('Not Supported (Finance)');
          break;
        case Tw.AUTH_CERTIFIATION_METHOD.BIO:
          this._popupService.openAlert('Not Supported (Bio)');
          break;
        default:
          this._popupService.openAlert('Not Supported');
          break;
      }
    }
  },
  _onClickSkSms: function () {
    this._certMethod = Tw.AUTH_CERTIFIATION_METHOD.SK_SMS;
    this._popupService.close();
  },
  _onClickKtSms: function () {
    this._certMethod = Tw.AUTH_CERTIFIATION_METHOD.OTHER_SMS;
    this._niceType = Tw.AUTH_CERTIFICATION_NICE.KT;
    this._popupService.close();
  },
  _onClickLgSms: function () {
    this._certMethod = Tw.AUTH_CERTIFIATION_METHOD.OTHER_SMS;
    this._niceType = Tw.AUTH_CERTIFICATION_NICE.LG;
    this._popupService.close();
  },
  _onClickSaveSms: function () {
    this._certMethod = Tw.AUTH_CERTIFIATION_METHOD.OTHER_SMS;
    this._niceType = Tw.AUTH_CERTIFICATION_NICE.SAVE;
    this._popupService.close();
  },
  _onClickIpin: function () {
    this._certMethod = Tw.AUTH_CERTIFIATION_METHOD.IPIN;
    this._popupService.close();
  },
  _onClickEmail: function () {
    this._certMethod = Tw.AUTH_CERTIFIATION_METHOD.EMAIL;
    this._popupService.close();
  },
  _onClickBio: function () {
    this._certMethod = Tw.AUTH_CERTIFIATION_METHOD.BIO;
    this._popupService.close();
  },
  _onClickSkPassword: function () {
    this._certMethod = Tw.AUTH_CERTIFIATION_METHOD.PASSWORD;
    this._popupService.close();
  },
  _onClickSkFinance: function () {
    this._certMethod = Tw.AUTH_CERTIFIATION_METHOD.FINANCE_AUTH;
    this._popupService.close();
  }
};
