/**
 * FileName: certification.select.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationSelect = function () {
  this._certSk = new Tw.CertificationSk();
  this._certNice = new Tw.CertificationNice();
  this._certIpin = new Tw.CertificationIpin();
  this._certEmail = new Tw.CertificationEmail();
  this._certPassword = new Tw.CertificationPassword();

  this._popupService = Tw.Popup;

  this._certMethod = null;
  this._niceType = null;
};


Tw.CertificationSelect.prototype = {
  open: function (loginType, method) {
    console.log(loginType, method);
    this.openSelectPopupTidLogin();

  },
  openSelectPopupTidLogin: function () {
    this._popupService.open({
      hbs: 'CO_02_01_01_L01',
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
    }, $.proxy(this._onOpenSelectPopupTidLogin, this), $.proxy(this._onCloseSelectPopup, this));
  },
  openSelectPopupEasyLogin: function () {
    this._popupService.open({
      hbs: 'CO_02_01_01_L02',
      layer: true,
      data: {
        skSms: true,
        bio: false,
        finance: true
      }
    }, $.proxy(this._onOpenSelectPopupEasyLogin, this), $.proxy(this._onCloseSelectPopup, this));

  },
  _onOpenSelectPopupTidLogin: function ($popupContainer) {
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
  _onOpenSelectPopupEasyLogin: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-sk', $.proxy(this._onClickSkSms, this));
    $popupContainer.on('click', '#fe-bt-bio', $.proxy(this._onClickBio, this));
    $popupContainer.on('click', '#fe-bt-finance', $.proxy(this._onClickSkFinance, this));
  },
  _onCloseSelectPopup: function () {
    if ( !Tw.FormatHelper.isEmpty(this._certMethod) ) {
      switch ( this._certMethod ) {
        case Tw.AUTH_CERTIFIATION_METHOD.SK_SMS:
          this._certSk.open();
          break;
        case Tw.AUTH_CERTIFIATION_METHOD.OTHER_SMS:
          this._certNice.open(this._niceType);
          break;
        case Tw.AUTH_CERTIFIATION_METHOD.IPIN:
          this._certIpin.open();
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
