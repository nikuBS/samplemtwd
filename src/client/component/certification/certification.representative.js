/**
 * FileName: certification.representative.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.12
 */

Tw.CertificationRepresentative = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._authUrl = '';
  this._command = null;
  this._deferred = null;
  this._callback = null;
  this._certInfo = null;

  this._smsNumbers = [];
  this.$list = null;
  this.$btCert = null;
  this.$btConfirm = null;
  this._receiverNum = '';

  this._jobCode = Tw.BrowserHelper.isApp() ? 'NFM_MTW_MINORPR_AUTH' : 'NFM_MWB_MINORPR_AUTH';
};

Tw.CertificationRepresentative.prototype = {
  SMS_CERT_ERROR: {
    SMS2003: 'SMS2003'
  },
  SMS_CONFIRM_ERROR: {
    SMS2007: 'SMS2007'
  },

  open: function (certInfo, authUrl, command, deferred, callback) {
    this._certInfo = certInfo;
    this._authUrl = authUrl;
    this._command = command;
    this._deferred = deferred;
    this._callback = callback;

    this._popupService.open({
      hbs: 'MV_01_02_01_01',
      layer: true,
      list: this._makeShowData(certInfo.smsNumbers)
    }, $.proxy(this._onOpenCert, this));
  },
  _makeShowData: function (smsNumbers) {
    this._smsNumbers = smsNumbers;
    return _.map(smsNumbers, $.proxy(function (number, index) {
      return {
        txt: number.nameMask + ' ' + number.numberMask,
        option: index === 0 ? 'checked' : ''
      };
    }, this));
  },
  _onOpenCert: function ($popupContainer) {
    this.$list = $popupContainer.find('.fe-radio-list');
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$validCert = $popupContainer.find('#fe-txt-cert');
    this.$errorCert = $popupContainer.find('#fe-error-cert');
    this.$errorConfirm = $popupContainer.find('#fe-error-confirm');

    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btConfirm.on('click', $.proxy(this._onClickConfirm, this));
    this.$list.on('click', $.proxy(this._onClickList, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));

    if ( this.$list.find(':checked').length > 0 ) {
      this.$btCert.attr('disabled', false);
    }
  },
  _onClickList: function () {
    this.$btCert.attr('disabled', false);
  },
  _onClickCert: function () {
    var $selected = this.$list.find(':checked');
    this._receiverNum = this._smsNumbers[$selected.data('index')].number;

    this._apiService.request(Tw.API_CMD.BFF_01_0058, {
      receiverNum: this._receiverNum,
      jobCode: this._jobCode
    }).done($.proxy(this._successCert, this));
  },
  _onClickConfirm: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0015, {
      jobCode: this._jobCode,
      authNum: this.$inputCert.val(),
      authUrl: this._authUrl,
      receiverNum: this._receiverNum,
      authKind: Tw.AUTH_CERTIFICATION_KIND.R,
      prodAuthKey: this._certInfo.prodAuthKey
    }).done($.proxy(this._completeCert, this));
  },
  _successCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.$validCert.removeClass('none');
    } else if ( resp.code === this.ERROR_CODE.SMS2003 ) {
      this.$validCert.addClass('none');
      this.$errorCert.removeClass('none');
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
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
  _completeCert: function (resp) {
    if ( resp.code === this.SMS_CONFIRM_ERROR.SMS2007 ) {
      this.$errorConfirm.removeClass('none');
    } else {
      this._callback(resp, this._deferred, this._command);
    }
  }
};
