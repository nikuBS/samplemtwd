/**
 * @file biometrics.cert.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.13
 */

Tw.BiometricsCert = function (target, userId) {
  this._target = target;
  this._userId = userId;
  this._callback = null;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._svcInfo = null;
  this._authUrl = 'GET|/v1/dummy/auth';
  this._authKind = Tw.AUTH_CERTIFICATION_KIND.P;

  this._getSvcInfo();
};

Tw.BiometricsCert.prototype = {
  RESULT: {
    COMPLETE: '00',
    CANCEL: '01'
  },
  open: function (callback, closeCallback) {
    this._callback = callback;
    this._closeCallback = closeCallback;

    this._getMethodBlock();
  },
  _getMethodBlock: function () {
    this._apiService.request(Tw.NODE_CMD.GET_AUTH_METHOD_BLOCK, {})
      .done($.proxy(this._successGetAuthMethodBlock, this))
      .fail($.proxy(this._failGetAuthMethodBlock, this));
  },
  _successGetAuthMethodBlock: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._authBlock = this._parseAuthBlock(resp.result);
    }
    this._openPopup();
  },
  _failGetAuthMethodBlock: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
  _parseAuthBlock: function (list) {
    var block = {};
    var today = new Date().getTime();
    _.map(list, $.proxy(function (target) {
      var startTime = Tw.DateHelper.convDateFormat(target.fromDtm).getTime();
      var endTime = Tw.DateHelper.convDateFormat(target.toDtm).getTime();
      if ( today > startTime && today < endTime ) {
        block[target.authMethodCd] = 'Y';
      } else {
        block[target.authMethodCd] = 'N';
      }
    }, this));
    return block;
  },
  _openPopup: function () {
    var methods = {
      skSms: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.SK_SMS] === 'Y'
      },
      otherSms: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS] === 'Y'
      },
      ipin: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.IPIN] === 'Y'
      },
      publicCert: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH] === 'Y'
      }
    };

    var checkBlock = _.find(methods, $.proxy(function (method) {
      return !method.block;
    }, this));

    if ( Tw.FormatHelper.isEmpty(checkBlock) ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.TITLE);
      return;
    }

    this._popupService.open({
      hbs: 'MA_03_01_02_01_02',
      layer: true,
      data: {
        methods: methods,
        isFinger: this._target === Tw.FIDO_TYPE.FINGER
      }
    }, $.proxy(this._onOpenBioCert, this), $.proxy(this._onCloseBioCert, this), 'cert');
  },
  _onOpenBioCert: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-sk', $.proxy(this._onClickSkSms, this));
    $popupContainer.on('click', '#fe-bt-kt', $.proxy(this._onClickKtSms, this));
    $popupContainer.on('click', '#fe-bt-lg', $.proxy(this._onClickLgSms, this));
    $popupContainer.on('click', '#fe-bt-ipin', $.proxy(this._onClickIpin, this));
    $popupContainer.on('click', '#fe-bt-public', $.proxy(this._onClickPublic, this));
    $popupContainer.on('click', '#fe-cancel', $.proxy(this._onClickCancel, this));
  },
  _onCloseBioCert: function () {
    if ( this._allClose && !Tw.FormatHelper.isEmpty(this._closeCallback) ) {
      this._closeCallback(this._closeCode);
    }
  },
  _onClickCancel: function () {
    // this._popupService.closeAll();
    this._allClose = true;
    if ( !Tw.FormatHelper.isEmpty(this._closeCallback) ) {
      this._closeCallback(this._closeCode);
    }
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
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
  _onClickSkSms: function () {
    this._certSk = new Tw.CertificationSk();
    this._certSk.open(
      this._svcInfo, this._authUrl, this._authKind, '', $.proxy(this._completeIdentification, this), '', '', false, 1);
  },
  _onClickKtSms: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(
      this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.KT, null, $.proxy(this._completeIdentification, this));
  },
  _onClickLgSms: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(
      this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.LG, null, $.proxy(this._completeIdentification, this));
  },
  _onClickIpin: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.IPIN, this._niceKind, null, $.proxy(this._completeIdentification, this));
  },
  _onClickPublic: function () {
    this._certPublic = new Tw.CertificationPublic();
    this._certPublic.open(this._authUrl, this._authKind, null, null, $.proxy(this._completeIdentification, this));
  },
  _completeIdentification: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var biometricsRegister = new Tw.BiometricsRegister(this._target, this._userId);
      biometricsRegister.open(this._callback, $.proxy(this._onCloseCallback, this));
    } else if ( resp.code === Tw.API_CODE.CERT_SMS_BLOCK ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_SMS_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_SMS_BLOCK.TITLE, Tw.BUTTON_LABEL.CLOSE);
    } else if ( resp.code === Tw.API_CODE.CERT_CANCEL ) {

    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _onCloseCallback: function (code) {
    this._allClose = true;
    this._closeCode = code;
    this._popupService.close();
  }
};
