/**
 * FileName: certification.sk-keyin.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationSkKeyin = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this.$btCert = null;
  this.$btConfirm = null;
  this.$inputMdn = null;
  this.$inputCert = null;
  this.$textValid = null;
  this.$errorConfirm = null;
  this.$errorCert = null;

  this._urlMeta = null;
  this._authUrl = null;
  this._command = null;
  this._deferred = null;
  this._callback = null;
  this._certResult = null;

  this._corpPwdAuthYn = false;
};


Tw.CertificationSkKeyin.prototype = {
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
  openKeyinPopup: function (svcInfo, urlMeta, authUrl, command, deferred, callback) {
    this._urlMeta = urlMeta;
    this._authUrl = authUrl;
    this._command = command;
    this._deferred = deferred;
    this._callback = callback;

    this._popupService.open({
      hbs: 'CO_02_01_02_01_L01',
      layer: true
    }, $.proxy(this._onOpenKeyinPopup, this), $.proxy(this._onCloseKeyjnPopup, this));

  },
  _onOpenKeyinPopup: function ($popupContainer) {
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$inputMdn = $popupContainer.find('#fe-input-mdn');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$errorCert = $popupContainer.find('#aria-sms-exp-desc1');
    this.$textValid = $popupContainer.find('#aria-sms-exp-desc2');
    this.$errorConfirm = $popupContainer.find('#aria-sms-exp-desc3');

    this.$btCert.on('click', $.proxy(this._requestKeyinCert, this));
    this.$btConfirm.on('click', $.proxy(this._requestKeyinConfirm, this));
    this.$inputMdn.on('input', $.proxy(this._onInputMdn, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));

  },
  _onCloseKeyjnPopup: function () {
    this._callback(this._certResult, this._deferred, this._command);
  },
  _onInputMdn: function () {
    var mdnLength = this.$inputMdn.val().length;
    if ( mdnLength === Tw.MIN_MDN_LEN || mdnLength === Tw.MAX_MDN_LEN ) {
      this.$btCert.parent().addClass('disabled');
      this.$btCert.attr('disabled', false);
    } else {
      this.$btCert.parent().removeClass('disabled');
      this.$btCert.attr('disabled', true);
    }
  },
  _requestKeyinCert: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CERT, {}, $.proxy(this._onNativeCert, this));

    this._apiService.request(Tw.API_CMD.BFF_01_0014, {
      jobCode: 'NFM_TWD_MBIMASK_AUTH',
      receiverNum: this.$inputMdn.val()
    }).done($.proxy(this._successSendKeyinCert, this));
  },
  _successSendKeyinCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.corpPwdAuthYn === 'Y' ) {
        // 법인 본인확인 비밀번호 입력
        this._openCorpPasswordCert();
      } else {
        this.showValidText();
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
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this.$inputCert.text(resp.params.cert);
      this.$inputCert.trigger('input');
    }
  },
  _openCorpPasswordCert: function () {
    this._popupService.open({
      hbs: 'CO_02_01_02_01_L01_L01',
      layer: true
    }, $.proxy(this._onOpenCorpPasswordCert, this));
  },
  _onOpenCorpPasswordCert: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-complete', $.proxy(this._onClickCorpPwComplete, this));
  },
  _onClickCorpPwComplete: function () {
    this._popupService.close();
  },
  _onInputCert: function () {
    var inputCert = this.$inputCert.val();
    if ( inputCert.length >= Tw.DEFAULT_CERT_LEN ) {
      this.$inputCert.val(inputCert.slice(0, Tw.DEFAULT_CERT_LEN));
      this.$btConfirm.attr('disabled', false);
    } else {
      this.$btConfirm.attr('disabled', true);
    }
  },
  _requestKeyinConfirm: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0015, {
      receiverNum: this.$inputMdn.val(),
      jobCode: 'NFM_TWD_MBIMASK_AUTH',
      authNum: this.$inputCert.val(),
      authUrl: this._authUrl
    }).done($.proxy(this._successKeyinConfirm, this));
  },
  _successKeyinConfirm: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._certResult = resp;
      this._popupService.close();
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
    this.$inputMdn.parents('.inputbox').removeClass('error');
    this.$inputMdn.parents('.inputbox').addClass('validation');
    this.$inputMdn.attr('aria-describedby', 'aria-sms-exp-desc2');

  },
  showCertError: function (message) {
    this.$errorCert.html(message);
    this.$textValid.addClass('none');
    this.$errorCert.removeClass('none');
    this.$inputMdn.parents('.inputbox').removeClass('validation');
    this.$inputMdn.parents('.inputbox').addClass('error');
    this.$inputMdn.attr('aria-describedby', 'aria-sms-exp-desc1');
  },
  showConfirmError: function (message) {
    this.$errorConfirm.html(message);
    this.$errorConfirm.removeClass('none');
    this.$inputCert.parents('.inputbox').addClass('error');
    this.$inputCert.attr('aria-describedby', 'aria-sms-exp-desc3');
  }


};
