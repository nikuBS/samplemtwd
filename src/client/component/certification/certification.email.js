/**
 * FileName: certification.email.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationEmail = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this.$btCert = null;
  this.$btConfirm = null;
  this.$inputEmail = null;
  this.$inputCert = null;
  this.$textValid = null;
  this.$errorConfirm = null;
  this.$errorCert = null;
  this.$blockEmail = null;
  this.$btCheckEmail = null;

  this._authUrl = null;
  this._command = null;
  this._deferred = null;
  this._callback = null;
  this._authKind = null;
  this._certResult = null;
};


Tw.CertificationEmail.prototype = {
  ERROR_EMAIL_CERT: {
    ATH8000: 'ATH8000',
    ATH8001: 'ATH8001',
    ATH8002: 'ATH8002',
    ATH8003: 'ATH8003',
    ATH8004: 'ATH8004',
    ATH8005: 'ATH8005'
  },

  open: function (svcInfo, authUrl, command, deferred, callback, authKind) {
    this._authUrl = authUrl;
    this._command = command;
    this._deferred = deferred;
    this._callback = callback;
    this._authKind = authKind;

    this._popupService.open({
      hbs: 'CO_02_01_03',
      layer: true
    }, $.proxy(this._onOpenEmailPopup, this), $.proxy(this._onCloseEmailPopup, this));
  },
  _onOpenEmailPopup: function ($popupContainer) {
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$inputEmail = $popupContainer.find('#fe-input-email');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$textValid = $popupContainer.find('#aria-sms-exp-desc2');
    this.$errorCert = $popupContainer.find('#aria-sms-exp-desc1');
    this.$errorConfirm = $popupContainer.find('#aria-sms-exp-desc3');
    this.$blockEmail = $popupContainer.find('#fe-block-check-email');
    this.$btCheckEmail = $popupContainer.find('#fe-bt-check-email');

    this.$btCert.on('click', $.proxy(this._requestEmailCert, this));
    this.$btConfirm.on('click', $.proxy(this._requestEmailConfirm, this));
    this.$inputEmail.on('input', $.proxy(this._onInputEmail, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));
    this.$btCheckEmail.on('click', $.proxy(this._checkEmail, this));

    $popupContainer.on('click', '#fe-bt-account-external', $.proxy(this._onClickBtAccountExternal, this));

  },
  _onCloseEmailPopup: function () {
    this._callback(this._certResult, this._deferred, this._command);
  },
  _onInputEmail: function () {
    var emailLength = this.$inputEmail.val().length;
    if ( emailLength > 0 ) {
      this.$btCert.parent().removeClass('disabled');
      this.$btCert.attr('disabled', false);
    } else {
      this.$btCert.parent().addClass('disabled');
      this.$btCert.attr('disabled', true);
    }
  },
  _requestEmailCert: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0017, {
      certCode: Tw.EMAIL_CERT_CODE.SECOND_AUTH,
      email: this.$inputEmail.val()
    }).done($.proxy(this._successSendEmailCert, this));

  },
  _successSendEmailCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.showValidText();
      this.showEmailBlock(new Date());
    } else if ( resp.code === this.ERROR_EMAIL_CERT.ATH8001 ) {
      this.showCertError(Tw.MSG_AUTH.CERT_05);
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _onInputCert: function () {
    var inputCert = this.$inputCert.val();
    if ( inputCert.length >= Tw.DEFAULT_CERT_LEN ) {
      this.$inputCert.val(inputCert.slice(0, Tw.DEFAULT_CERT_LEN));
      this.$btConfirm.attr('disabled', false);
    }

  },
  _requestEmailConfirm: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0018, {
      certCode: Tw.EMAIL_CERT_CODE.SECOND_AUTH,
      email: this.$inputEmail.val(),
      authNum: this.$inputCert.val(),
      authUrl: this._authUrl,
      authTerm: 1000,
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._command.params.prodId + this._command.params.prodProctypeCd : ''
    }).done($.proxy(this._successEmailConfirm, this));
  },
  _successEmailConfirm: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._certResult = resp;
      this._popupService.close();
    } else if ( resp.code === this.ERROR_EMAIL_CERT.ATH8004 ) {
      this.showConfirmError(Tw.MSG_AUTH.CERT_03);
    } else if ( resp.code === this.ERROR_EMAIL_CERT.ATH8005 ) {
      this.showConfirmError(Tw.MSG_AUTH.CERT_04);
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  showValidText: function () {
    this.$errorCert.addClass('none');
    this.$textValid.removeClass('none');
    this.$btCert.parents('.inputbox').removeClass('error');
    this.$btCert.parents('.inputbox').addClass('validation');
    this.$btCert.attr('aria-describedby', 'aria-sms-exp-desc2');
  },
  showCertError: function (message) {
    this.$errorCert.html(message);
    this.$textValid.addClass('none');
    this.$errorCert.removeClass('none');
    this.$btCert.parents('.inputbox').removeClass('validation');
    this.$btCert.parents('.inputbox').addClass('error');
    this.$btCert.attr('aria-describedby', 'aria-sms-exp-desc1');
  },
  showConfirmError: function (message) {
    this.$errorConfirm.html(message);
    this.$errorConfirm.removeClass('none');
    this.$inputCert.parents('.inputbox').addClass('error');
    this.$inputCert.attr('aria-describedby', 'aria-sms-exp-desc3');
  },
  showEmailBlock: function (time) {
    this.$blockEmail.removeClass('none');
    this.$blockEmail.find('.out-time').html(Tw.DateHelper.getShortDateAndTime(time));
  },
  _checkEmail: function () {
    var email = this.$inputEmail.val();
    if(email.indexOf('@')) {
      var url = email.split('@')[1];
      Tw.CommonHelper.openUrlExternal(url);
    }

  },
  _onClickBtAccountExternal: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(Tw.NTV_CMD.ACCOUNT, {}, $.proxy(this._onNativeAccount, this));
    } else {
      window.open('/auth/tid/account', '_blank');
    }
  },
  _onNativeAccount: function () {
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeAccount' });
  }
};
