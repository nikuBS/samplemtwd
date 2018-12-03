/**
 * FileName: certification.finance.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.10
 */

Tw.CertificationFinance = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._certSkFull = new Tw.CertificationSkFull();
  this._certPublic = new Tw.CertificationPublic();

  this._svcInfo = null;
  this._authUrl = null;
  this._command = null;
  this._callback = null;
  this._authKind = null;
  this._isCompleteIden = false;
  this._isCheckTerm = true;

  this.$privacyCheck = null;
};


Tw.CertificationFinance.prototype = {

  open: function (svcInfo, authUrl, authKind, command, callback) {
    this._svcInfo = svcInfo;
    this._authUrl = authUrl;
    this._command = command;
    this._callback = callback;
    this._authKind = authKind;

    this._popupService.open({
      hbs: 'CO_02_02_01',
      layer: true
    }, $.proxy(this._onOpenFinancePopup, this), $.proxy(this._onCloseFinancePopup, this));
  },
  _onOpenFinancePopup: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-sk', $.proxy(this._onClickSkSms, this));
    $popupContainer.on('click', '#fe-bt-kt', $.proxy(this._onClickKtSms, this));
    $popupContainer.on('click', '#fe-bt-lg', $.proxy(this._onClickLgSms, this));
    $popupContainer.on('click', '#fe-bt-ipin', $.proxy(this._onClickIpin, this));
    $popupContainer.on('click', '#fe-bt-bio', $.proxy(this._onClickBio, this));
  },
  _onCloseFinancePopup: function () {
    if ( this._isCompleteIden ) {
      this._openPublic();
    }
  },
  _onClickSkSms: function () {
    console.log('cert sms');
    this._certSkFull.open(this._authUrl,  this._authKind, $.proxy(this._completeIdentification, this));
  },
  _onClickKtSms: function () {
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.KT, this._command,
      $.proxy(this._completeIdentification, this));
  },
  _onClickLgSms: function () {
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.LG, this._command,
      $.proxy(this._completeIdentification, this));
  },
  _onClickIpin: function () {
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.IPIN, null, this._command, $.proxy(this._completeIdentification, this));
  },
  _onClickBio: function () {
  },
  _openCertBrowser: function (path) {
    this._apiService.request(Tw.NODE_CMD.GET_DOMAIN, {})
      .done($.proxy(this._successGetDomain, this, path));
  },
  _successGetDomain: function (path, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.openUrlInApp('http://' + resp.result.domain + path, 'status=1,toolbar=1');
      // Tw.CommonHelper.openUrlInApp('http://150.28.69.23:3000' + path, 'status=1,toolbar=1');
    }
  },
  _completeIdentification: function (result) {
    if ( result.code === Tw.API_CODE.CODE_00 ) {
      // this._isCompleteIden = true;
      // this._popupService.close();
      this._openPublic();
    } else {
      Tw.Error(result.code, result.msg).pop();
    }
  },
  _openPublic: function () {
    this._popupService.open({
      hbs: 'CO_CE_02_05_02',
      layer: true
    }, $.proxy(this._onOpenPublicPopup, this), $.proxy(this._onClosePublicPopup, this));
  },
  _onOpenPublicPopup: function ($popupContainer) {
    this.$privacyCheck = $popupContainer.find('#fe-cb-privacy');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');

    this.$privacyCheck.on('change', $.proxy(this._onChangePrivacy, this));
    this.$btConfirm.on('click', $.proxy(this._onClickConfirm, this));

  },
  _onClosePublicPopup: function () {
    if ( this._isCheckTerm ) {
      this._certPublic.open(this._svcInfo, this._authUrl, this._authKind, this._command, this._callback);
    }
  },
  _onChangePrivacy: function () {
    if ( this.$privacyCheck.is(':checked') ) {
      this.$btConfirm.attr('disabled', false);
    } else {
      this.$btConfirm.attr('disabled', false);
    }
  },
  _onClickConfirm: function () {
    this._isCheckTerm = true;
    this._popupService.close();
  }
};
