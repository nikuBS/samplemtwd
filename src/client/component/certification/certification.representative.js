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

  this._addTimer = null;
  this._addTime = null;

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
    ICAS3101: 'ICAS3101',
    ICAS3162: 'ICAS3162'
  },
  open: function (certInfo, authUrl, command, deferred, callback) {
    this._certInfo = certInfo;
    this._authUrl = authUrl;
    this._command = command;
    this._deferred = deferred;
    this._callback = callback;

    this._getMethodBlock();
  },
  _getMethodBlock: function () {
    this._apiService.request(Tw.NODE_CMD.GET_AUTH_METHOD_BLOCK, {})
      .done($.proxy(this._successGetAuthMethodBlock, this));
  },
  _successGetAuthMethodBlock: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._authBlock = this._parseAuthBlock(resp.result);
    }

    if ( this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.SK_SMS] === 'Y' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.TITLE);
    } else {
      this._openPopup();
    }
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
    this._popupService.open({
      hbs: 'MV_01_02_01_01',
      layer: true,
      list: this._makeShowData(this._certInfo.smsNumbers),
      one: this._certInfo.smsNumbers.length === 1
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
    this.$btReCert = $popupContainer.find('#fe-bt-recert');
    this.$btCertAdd = $popupContainer.find('#fe-bt-cert-add');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$validCert = $popupContainer.find('#fe-txt-cert');
    this.$validAddCert = $popupContainer.find('#fe-txt-cert-add');
    this.$errorCertTime = $popupContainer.find('#fe-error-cert-time');
    this.$errorCertCnt = $popupContainer.find('#fe-error-cert-cnt');
    this.$errorCertAddTime = $popupContainer.find('#fe-error-add-time');
    this.$errorCertBlock = $popupContainer.find('#fe-error-cert-block');
    this.$errorConfirm = $popupContainer.find('#fe-error-confirm');
    this.$errorConfirmTime = $popupContainer.find('#fe-error-confirm-time');
    this.$errorConfirmCnt = $popupContainer.find('#fe-error-confirm-cnt');

    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btReCert.on('click', $.proxy(this._onClickReCert, this));
    this.$btCertAdd.on('click', $.proxy(this._onClickCertAdd, this));
    this.$btConfirm.on('click', $.proxy(this._onClickConfirm, this));
    this.$list.on('click', $.proxy(this._onClickList, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));

    this.$showTime = $popupContainer.find('#fe-sms-time');
    // if ( this.$list.find(':checked').length > 0 ) {
    //   this.$btCert.attr('disabled', false);
    // }
  },
  _onCloseCert: function () {
    if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
      clearInterval(this._addTimer);
    }

    if ( !Tw.FormatHelper.isEmpty(this._callbackParam) ) {
      this._callback(this._callbackParam, this._deferred, this._command);
    }
  },
  _onClickList: function () {
    this.$btCert.attr('disabled', false);
  },
  _onClickCert: function () {
    this._sendCert();
  },
  _onClickReCert: function () {
    this._sendCert(true);
  },
  _onClickCertAdd: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0027, { seqNo: this._seqNo })
      .done($.proxy(this._successCertAdd, this));
  },
  _successCertAdd: function (resp) {
    this._clearConfirmError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.$validAddCert.removeClass('none');
      this.$validAddCert.attr('aria-hidden', false);
      if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
        clearInterval(this._addTimer);
      }
      this._addTime = new Date();
      this._addTimer = setInterval($.proxy(this._showTimer, this, this._addTime), 1000);
    } else if ( resp.code === this.SMS_ERROR.ATH1221 ) {
      this.$errorCertAddTime.removeClass('none');
      this.$errorCertAddTime.attr('aria-hidden', false);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
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
  _sendCert: function (reCert) {
    if ( this._smsNumbers.length > 1 ) {
      var $selected = this.$list.find(':checked');
      this._receiverNum = this._smsNumbers[$selected.data('index')].number;
    } else {
      this._receiverNum = this._smsNumbers[0].number;
    }

    this._apiService.request(Tw.API_CMD.BFF_01_0058, {
      receiverNum: this._receiverNum,
      jobCode: this._jobCode
    }).done($.proxy(this._successCert, this, reCert));
  },
  _successCert: function (reCert, resp) {
    this._clearCertError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.$btCertAdd.attr('disabled', false);
      this._seqNo = resp.result.seqNo;
      this.$validCert.removeClass('none');
      this.$validCert.attr('aria-hidden', false);
      if ( !reCert ) {
        this.$btCert.addClass('none');
        this.$btReCert.removeClass('none');
      }
      if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
        clearInterval(this._addTimer);
      }
      this._addTime = new Date();
      this._addTimer = setInterval($.proxy(this._showTimer, this, this._addTime), 1000);
    } else if ( resp.code === this.SMS_ERROR.ATH2003 ) {
      this.$errorCertTime.removeClass('none');
      this.$errorCertTime.attr('aria-hidden', false);
    } else if ( resp.code === this.SMS_ERROR.ATH2006 ) {
      this.$errorCertCnt.removeClass('none');
      this.$errorCertCnt.attr('aria-hidden', false);
    } else if ( resp.code === this.SMS_ERROR.ICAS3101 || resp.code === this.SMS_ERROR.ICAS3162 ) {
      this.$errorCertBlock.removeClass('none');
      this.$errorCertBlock.attr('aria-hidden', false);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _showTimer: function (startTime) {
    var remainedSec = Tw.DateHelper.getRemainedSec(startTime);
    this.$showTime.text(Tw.DateHelper.convertMinSecFormat(remainedSec));
    if ( remainedSec <= 0 ) {
      clearInterval(this._addTimer);
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
    this._clearConfirmError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._callbackParam = resp;
      this._popupService.close();
    } else if ( resp.code === this.SMS_ERROR.ATH2007 ) {
      this.$errorConfirm.removeClass('none');
      this.$errorConfirm.attr('aria-hidden', false);
    } else if ( resp.code === this.SMS_ERROR.ATH2008 ) {
      this.$errorConfirmTime.removeClass('none');
      this.$errorConfirmTime.attr('aria-hidden', false);
    } else if ( resp.code === this.SMS_ERROR.ATH2011 ) {
      this.$errorConfirmCnt.removeClass('none');
      this.$errorConfirmCnt.attr('aria-hidden', true);
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
    this.$validCert.attr('aria-hidden', true);
    this.$errorCertTime.addClass('none');
    this.$errorCertTime.attr('aria-hidden', true);
    this.$errorCertCnt.addClass('none');
    this.$errorCertCnt.attr('aria-hidden', true);
    this.$errorCertBlock.addClass('none');
    this.$errorCertBlock.attr('aria-hidden', true);
  },
  _clearConfirmError: function () {
    this.$validAddCert.addClass('none');
    this.$validAddCert.attr('aria-hidden', true);
    this.$errorCertAddTime.addClass('none');
    this.$errorCertAddTime.attr('aria-hidden', true);
    this.$errorConfirm.addClass('none');
    this.$errorConfirm.attr('aria-hidden', true);
    this.$errorConfirmTime.addClass('none');
    this.$errorConfirmTime.attr('aria-hidden', true);
    this.$errorConfirmCnt.addClass('none');
    this.$errorConfirmCnt.attr('aria-hidden', true);
  }
};
