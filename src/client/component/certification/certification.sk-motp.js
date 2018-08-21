/**
 * FileName: certification.sk-motp.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationSkMotp = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this.$btCert = null;
  this.$btConfirm = null;
  this.$inputCert = null;
  this.$textValid = null;
  this.$errorConfirm = null;
  this.$errorCert = null;

  this._authUrl = null;
  this._isFirstCert = true;
};


Tw.CertificationSkMotp.prototype = {
  MOTP_ERROR: {
    ATH1232: 'ATH1232',   // 단말기정보가 없습니다.
    ATH1233: 'ATH1233'    // 모바일T 안심인증할 수 없는 단말기 모델입니다.
  },
  openMotpPopup: function () {
    this._popupService.open({
      hbs: 'CO_02_01_02_L02',
      layer: true,
      data: {
        mdn: '000-0000-0000'
      }
    }, $.proxy(this._onOpenMotpPopup, this), $.proxy(this._onCloseMotpPopup, this));
  },
  _onOpenMotpPopup: function ($popupContainer) {
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$textValid = $popupContainer.find('#aria-sms-exp-desc2');
    this.$errorCert = $popupContainer.find('#todo');
    this.$errorConfirm = $popupContainer.find('#aria-sms-exp-desc3');

    this.$btCert.on('click', $.proxy(this._requestSmsCert, this));
    this.$btConfirm.on('click', $.proxy(this._requestMotpConfirm, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));

    this._requestMotpCert();
  },
  _onCloseMotpPopup: function () {

  },
  _requestMotpCert: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0019, { authUrl: '/core-modification/v1/voice-certification' })
      .done($.proxy(this._successMotpCert, this));
  },
  _successMotpCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( this._isFirstCert ) {
        this._isFirstCert = false;
      } else {
        this.showValidText();
      }
    } else if ( resp.code === this.MOTP_ERROR.ATH1233 ) {

    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _onInputCert: function () {
    var inputCert = this.$inputCert.val();
    if ( inputCert.length >= Tw.MOTP_CERT_LEN ) {
      this.$inputCert.val(inputCert.slice(0, Tw.MOTP_CERT_LEN));
      this.$btConfirm.attr('disabled', false);
    }

  },
  _requestMotpConfirm: function() {

  },
  _successMotpConfirm: function (resp) {
    if( resp.code === Tw.API_CODE.CODE_00) {

    }
  },
  showValidText: function () {
    this.$errorCert.addClass('none');
    this.$textValid.removeClass('none');
    this.$btCert.attr('aria-describedby', 'aria-sms-exp-desc2');
  },
  showCertError: function (message) {
    this.$errorCert.html(message);
    this.$textValid.addClass('none');
    this.$errorCert.removeClass('none');
    this.$btCert.attr('aria-describedby', 'aria-sms-exp-desc1');
  },
  showConfirmError: function (message) {
    this.$errorConfirm.html(message);
    this.$errorConfirm.removeClass('none');
    this.$inputCert.parents('.inputbox').addClass('error');
    this.$inputCert.attr('aria-describedby', 'aria-sms-exp-desc3');
  }

};