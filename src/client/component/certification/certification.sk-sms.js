/**
 * FileName: certification.sk-sms.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationSkSms = function () {
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;

  this.$btCert = null;
  this.$btConfirm = null;
  this.$inputCert = null;
  this.$textValid = null;
  this.$errorConfirm = null;
  this.$errorCert = null;

  this._authURl = null;
  this._isFirstCert = true;
};


Tw.CertificationSkSms.prototype = {
  SMS_CERT_ERROR: {
    SMS2001: 'SMS2001',
    SMS2002: 'SMS2002',
    SMS2003: 'SMS2003',
    SMS2004: 'SMS2004',
    SMS2005: 'SMS2005',
    SMS2006: 'SMS2006',
    SMS2007: 'SMS2007',
    SMS2008: 'SMS2008',
    SMS2009: 'SMS2009',
    SMS2010: 'SMS2010',
    SMS2011: 'SMS2011',
    SMS2013: 'SMS2013',
    SMS2014: 'SMS2014',
    SMS3001: 'SMS3001'
  },

  openSmsPopup: function () {
    this._popupService.open({
      hbs: 'CO_02_01_02_L01',
      layer: true,
      data: {
        mdn: '010-****-****'
      }
    }, $.proxy(this._onOpenSmsPopup, this), $.proxy(this._onCloseSmsPopup, this));
  },
  _onOpenSmsPopup: function ($popupContainer) {
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$textValid = $popupContainer.find('#aria-sms-exp-desc2');
    this.$errorCert = $popupContainer.find('#aria-sms-exp-desc1');
    this.$errorConfirm = $popupContainer.find('#aria-sms-exp-desc3');

    this.$btCert.on('click', $.proxy(this._requestSmsCert, this));
    this.$btConfirm.on('click', $.proxy(this._requestSmsConfirm, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));

    this._requestSmsCert();
  },
  _onCloseSmsPopup: function () {

  },
  _requestSmsCert: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CERT, {}, $.proxy(this._onNativeCert, this));

    this._apiService.request(Tw.API_CMD.BFF_01_0014, { jobCode: 'NFM_TWD_MBIMASK_AUTH' })
      .done($.proxy(this._successSendSmsCert, this));
  },
  _successSendSmsCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( this._isFirstCert ) {
        this._isFirstCert = false;
      } else {
        // this.showValidText();
        this.showCertError(Tw.MSG_AUTH.CERT_01);
      }
    } else if ( resp.code === this.SMS_CERT_ERROR.SMS2003 ) {
      this.showCertError(Tw.MSG_AUTH.CERT_01);
    } else if ( resp.code === this.SMS_CERT_ERROR.SMS2006 ) {
      this.showCertError(Tw.MSG_AUTH.CERT_02);
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _onNativeCert: function (resp) {
    if ( resp.code === Tw.NTV_CODE.CODE_00 ) {

    }
  },
  _onInputCert: function () {
    var inputCert = this.$inputCert.val();
    if ( inputCert.length >= Tw.DEFAULT_CERT_LEN ) {
      this.$inputCert.val(inputCert.slice(0, Tw.DEFAULT_CERT_LEN));
      this.$btConfirm.attr('disabled', false);
    }
  },
  _requestSmsConfirm: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0015, {
      jobCode: 'NFM_TWD_MBIMASK_AUTH',
      authNum: this.$inputCert.val(),
      authUrl: ''
    }).done($.proxy(this._successSmsConfirm, this));
  },
  _successSmsConfirm: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      // TODO success

    } else if ( resp.code === this.SMS_CERT_ERROR.SMS2007 ) {
      this.showConfirmError(Tw.MSG_AUTH.CERT_03);
    } else if ( resp.code === this.SMS_CERT_ERROR.SMS2008 ) {
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
  }

};
