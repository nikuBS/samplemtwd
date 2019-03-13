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
  this._callbackParam = null;

  this._jobCode = Tw.BrowserHelper.isApp() ? 'NFM_MTW_MINORPR_AUTH' : 'NFM_MWB_MINORPR_AUTH';
};

Tw.CertificationRepresentative.prototype = {
  SMS_ERROR: {
    ATH2001: 'ATH2001',
    ATH2003: 'ATH2003',     // 재전송 제한시간이 지난 후에 이용하시기 바랍니다.
    ATH2006: 'ATH2006',     // 제한시간 내에 보낼 수 있는 발송량이 초과하였습니다.
    ATH2007: 'ATH2007',     // 입력하신 인증번호가 맞지 않습니다.
    ATH2008: 'ATH2008',     // 인증번호를 입력할 수 있는 시간이 초과하였습니다.
    ATH2009: 'ATH2009',
    ATH1221: 'ATH1221',     // 인증번호 유효시간이 경과되었습니다.
    ATH2011: 'ATH2011',
    ATH2013: 'ATH2013',
    ATH2014: 'ATH2014',
    ICAS3101: 'ICAS3101'
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
      list: this._makeShowData(certInfo.smsNumbers),
      one: certInfo.smsNumbers.length === 1
    }, $.proxy(this._onOpenCert, this), $.proxy(this._onCloseCert, this));
  },
  _makeShowData: function (smsNumbers) {
    this._smsNumbers = smsNumbers;
    return _.map(smsNumbers, $.proxy(function (number) {
      return {
        txt: smsNumbers.length === 1 ? Tw.FormatHelper.conTelFormatWithDash(number.numberMask) :
          number.nameMask + ' ' + Tw.FormatHelper.conTelFormatWithDash(number.numberMask)
        // option: smsNumbers.length === 1 && index === 0 ? 'checked' : ''
      };
    }, this));
  },
  _onOpenCert: function ($popupContainer) {
    this.$list = $popupContainer.find('.fe-radio-list');
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$validCert = $popupContainer.find('#fe-txt-cert');
    this.$errorCertTime = $popupContainer.find('#fe-error-cert-time');
    this.$errorCertCnt = $popupContainer.find('#fe-error-cert-cnt');
    this.$errorCertBlock = $popupContainer.find('#fe-error-cert-block');
    this.$errorConfirm = $popupContainer.find('#fe-error-confirm');
    this.$errorConfirmTime = $popupContainer.find('#fe-error-confirm-time');
    this.$errorConfirmCnt = $popupContainer.find('#fe-error-confirm-cnt');

    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btConfirm.on('click', $.proxy(this._onClickConfirm, this));
    this.$list.on('click', $.proxy(this._onClickList, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));

    // if ( this.$list.find(':checked').length > 0 ) {
    //   this.$btCert.attr('disabled', false);
    // }
  },
  _onCloseCert: function () {
    if ( !Tw.FormatHelper.isEmpty(this._callbackParam) ) {
      this._callback(this._callbackParam, this._deferred, this._command);
    }
  },
  _onClickList: function () {
    this.$btCert.attr('disabled', false);
  },
  _onClickCert: function () {
    if ( this._smsNumbers.length > 1 ) {
      var $selected = this.$list.find(':checked');
      this._receiverNum = this._smsNumbers[$selected.data('index')].number;
    } else {
      this._receiverNum = this._smsNumbers[0].number;
    }

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
      this._clearCertError();
      this.$validCert.removeClass('none');
    } else if ( resp.code === this.SMS_ERROR.ATH2003 ) {
      this._clearCertError();
      this.$errorCertTime.removeClass('none');
    } else if ( resp.code === this.SMS_ERROR.ATH2006 ) {
      this._clearCertError();
      this.$errorCertCnt.removeClass('none');
    } else if ( resp.code === this.SMS_ERROR.ICAS3101 ) {
      this.$errorCertBlock.removeClass('none');
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
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._callbackParam = resp;
      this._popupService.close();
    } else if ( resp.code === this.SMS_ERROR.ATH2007 ) {
      this._clearConfirmError();
      this.$errorConfirm.removeClass('none');
    } else if ( resp.code === this.SMS_ERROR.ATH2008 ) {
      this._clearConfirmError();
      this.$errorConfirmTime.removeClass('none');
    } else if ( resp.code === this.SMS_ERROR.ATH2011 ) {
      this.$errorConfirmCnt.removeClass('none');
    } else if ( resp.code === this.SMS_ERROR.ATH2001 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2001);
    } else if ( resp.code === this.SMS_ERROR.ATH2009 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2009);
    } else if ( resp.code === this.SMS_ERROR.ATH2013 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2013);
    } else if ( resp.code === this.SMS_ERROR.ATH2014 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2014);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _clearCertError: function () {
    this.$validCert.addClass('none');
    this.$errorCertTime.addClass('none');
    this.$errorCertCnt.addClass('none');
    this.$errorCertBlock.addClass('none');
  },
  _clearConfirmError: function () {
    this.$errorConfirm.addClass('none');
    this.$errorConfirmTime.addClass('none');
    this.$errorConfirmCnt.addClass('none');
  }
};
