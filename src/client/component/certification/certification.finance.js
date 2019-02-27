/**
 * FileName: certification.finance.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.10
 */

Tw.CertificationFinance = function () {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._svcInfo = null;
  this._authUrl = null;
  this._callback = null;
  this._authKind = null;
  this._prodAuthKey = null;
  this._command = null;
  this._isCompleteIden = false;
  this._isCheckTerm = true;
  this._fidoTarget = '';

  this.$privacyCheck = null;
};


Tw.CertificationFinance.prototype = {
  FIDO_TYPE: {
    '0': Tw.FIDO_TYPE.FINGER,
    '1': Tw.FIDO_TYPE.FACE
  },
  open: function (svcInfo, authUrl, authKind, prodAuthKey, command, callback) {
    this._svcInfo = svcInfo;
    this._authUrl = authUrl;
    this._callback = callback;
    this._authKind = authKind;
    this._prodAuthKey = prodAuthKey;
    this._command = command;

    this._fidoType();
  },
  _fidoType: function () {
    // this._nativeService.send(Tw.NTV_CMD.FIDO_TYPE, {}, $.proxy(this._onFidoType, this));
    this._openFinance(false);
  },
  _onFidoType: function (resp) {
    var enableFido = false;
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 || resp.resultCode === Tw.NTV_CODE.CODE_01 ) {
      enableFido = true;
      this._fidoTarget = this.FIDO_TYPE[resp.resultCode];
    }
    this._openFinance(enableFido);
  },
  _openFinance: function (enableFido) {
    this._popupService.open({
      hbs: 'CO_02_02_01',
      layer: true,
      enableFido: enableFido
    }, $.proxy(this._onOpenFinancePopup, this), null);
  },
  _onOpenFinancePopup: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-sk', $.proxy(this._onClickSkSms, this));
    $popupContainer.on('click', '#fe-bt-kt', $.proxy(this._onClickKtSms, this));
    $popupContainer.on('click', '#fe-bt-lg', $.proxy(this._onClickLgSms, this));
    $popupContainer.on('click', '#fe-bt-ipin', $.proxy(this._onClickIpin, this));
    $popupContainer.on('click', '#fe-bt-bio', $.proxy(this._onClickBio, this));
  },
  _onClickSkSms: function () {
    this._certSkFull = new Tw.CertificationSkFull();
    this._certSkFull.open(this._authUrl, this._authKind, $.proxy(this._completeIdentification, this));
  },
  _onClickKtSms: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.KT, '',
      $.proxy(this._completeIdentification, this));
  },
  _onClickLgSms: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.LG, '',
      $.proxy(this._completeIdentification, this));
  },
  _onClickIpin: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.IPIN, null, '', $.proxy(this._completeIdentification, this));
  },
  _onClickBio: function () {
    this._checkFido();
  },
  _checkFido: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_CHECK, { svcMgmtNum: this._svcInfo.svcMgmtNum }, $.proxy(this._onCheckFido, this));
  },
  _onCheckFido: function (resp) {
    this._certBio = new Tw.CertificationBio();
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._certBio.open(this._authUrl, this._authKind, this._prodAuthKey, this._svcInfo,
        $.proxy(this._completeIdentification, this), true, this._fidoTarget);
    } else {
      this._certBio.open(this._authUrl, this._authKind, this._prodAuthKey, this._svcInfo,
        $.proxy(this._completeIdentification, this), false, this._fidoTarget);
    }
  },
  _completeIdentification: function (result) {
    if ( result.code === Tw.API_CODE.CODE_00 ) {
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

    $popupContainer.on('click', '#fe-cancel', $.proxy(this._onClickCancel, this));
  },
  _onClosePublicPopup: function () {
    if ( this._allClose ) {
      this._popupService.close();
    }
  },
  _onChangePrivacy: function () {
    if ( this.$privacyCheck.is(':checked') ) {
      this.$btConfirm.attr('disabled', false);
    } else {
      this.$btConfirm.attr('disabled', true);
    }
  },
  _onClickConfirm: function () {
    this._certPublic = new Tw.CertificationPublic();
    this._certPublic.open(this._authUrl, this._authKind, this._prodAuthKey, this._command, this._callback);
  },
  _onClickCancel: function () {
    this._allClose = true;
    this._popupService.close();
  }
};
