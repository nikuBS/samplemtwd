/**
 * FileName: main.menu.settings.biometrics.cert.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.13
 */

Tw.MainMenuSettingsBiometricsCert = function (target) {
  this._target = target;
  this._apiService = Tw.Api;

  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;

  this._biometiricsRegister = new Tw.MainMenuSettingsBiometricsRegister(this._target);
  this._certSk = new Tw.CertificationSk();
  this._certPublic = new Tw.CertificationPublic();
  this._certNice = new Tw.CertificationNice();

  this._svcInfo = null;
  this._authUrl = 'GET|/v1/dummy/auth';
  this._authKind = Tw.AUTH_CERTIFICATION_KIND.P;

  this._getSvcInfo();
};

Tw.MainMenuSettingsBiometricsCert.prototype = {
  open: function () {
    this._popupService.open({
      hbs: 'MA_03_01_02_01_02',
      layer: true,
      data: {
        isFinger: this._target === Tw.FIDO_TYPE.FINGER
      }
    }, $.proxy(this._onOpenBioCert, this), null, 'cert');
  },
  _onOpenBioCert: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-sk', $.proxy(this._onClickSkSms, this));
    $popupContainer.on('click', '#fe-bt-kt', $.proxy(this._onClickKtSms, this));
    $popupContainer.on('click', '#fe-bt-lg', $.proxy(this._onClickLgSms, this));
    $popupContainer.on('click', '#fe-bt-ipin', $.proxy(this._onClickIpin, this));
    $popupContainer.on('click', '#fe-bt-public', $.proxy(this._onClickPublic, this));
  },
  _getSvcInfo: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successSvcInfo, this))
      .fail($.proxy(this._failSvcInfo, this));
  },
  _successSvcInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcInfo = resp.result;
    }
  },
  _failSvcInfo: function () {

  },
  _onClickSkSms: function () {
    this._certSk.open(
      this._svcInfo, this._authUrl, this._authKind, null, Tw.AUTH_CERTIFICATION_METHOD.SK_SMS, $.proxy(this._completeIdentification, this));
  },
  _onClickKtSms: function () {
    this._certNice.open(
      this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.KT, null, $.proxy(this._completeIdentification, this));
  },
  _onClickLgSms: function () {
    this._certNice.open(
      this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.LG, null, $.proxy(this._completeIdentification, this));
  },
  _onClickIpin: function () {
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.IPIN, this._niceKind, null, $.proxy(this._completeIdentification, this));
  },
  _onClickPublic: function () {
    this._certPublic.open(this._svcInfo, this._authUrl, this._authKind, null, $.proxy(this._completeIdentification, this));
  },
  _completeIdentification: function (resp) {
    this._biometiricsRegister.open();
  }
};
