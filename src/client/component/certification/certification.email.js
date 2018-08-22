/**
 * FileName: certification.email.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationEmail = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this.$btCert = null;
  this.$btConfirm = null;
  this.$inputEmail = null;
  this.$inputCert = null;
  this.$textValid = null;
  this.$errorConfirm = null;
  this.$errorCert = null;

  this._authURl = null;
};


Tw.CertificationEmail.prototype = {
  open: function () {
    this._popupService.open({
      hbs: 'CO_02_01_L01',
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

    this.$btCert.on('click', $.proxy(this._requestEmailCert, this));
    this.$btConfirm.on('click', $.proxy(this._requestEmailConfirm, this));
    this.$inputEmail.on('input', $.proxy(this._onInputEmail, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));

  },
  _onCloseEmailPopup: function () {

  },
  _onInputEmail: function () {
    this.showValidText();
    var emailLength = this.$inputEmail.val().length;
    if ( emailLength > 0 ) {
      this.$btCert.parent().removeClass('disabled');
      this.$btCert.attr('disabled', true);
    } else {
      this.$btCert.parent().addClass('disabled');
      this.$btCert.attr('disabled', false);
    }
  },
  _requestEmailCert: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0017, {
      certCode: '',
      emailAddress: ''
    }, $.proxy(this._successSendEmailCert, this));

  },
  _successSendEmailCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {

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
    this._apiService.reqiest(Tw.API_CMD.BFF_01_0018, {
      certCode: '',
      emailAddress: '',
      authNum: '',
      authUrl: this._authUrl,
      authTerm: ''
    }, $.proxy(this._successEmailConfirm, this));
  },
  _successEmailConfirm: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {

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
  }

};
