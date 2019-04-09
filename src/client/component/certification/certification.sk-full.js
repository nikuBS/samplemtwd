/**
 * @file certification.sk-full.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.01
 */

Tw.CertificationSkFull = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;

  this.mdn = '';
  this.certSeq = '';
  this._jobCode = null;
  this._result = null;

  this._addTimer = null;
  this._addTime = null;

  // window.onRefresh = $.proxy(this._onRefreshCallback, this);
};

Tw.CertificationSkFull.prototype = {
  GENDER_CODE: {
    '1': 'M',
    '2': 'F'
  },
  SMS_ERROR: {
    ATH2001: 'ATH2001',
    ATH8006: 'ATH8006',     // 입력하신 정보가 일치하지 않습니다.
    ATH2003: 'ATH2003',     // 재전송 제한시간이 지난 후에 이용하시기 바랍니다.
    ATH2006: 'ATH2006',     // 제한시간 내에 보낼 수 있는 발송량이 초과하였습니다.
    ATH2007: 'ATH2007',     // 입력하신 인증번호가 맞지 않습니다.
    ATH2008: 'ATH2008',     // 인증번호를 입력할 수 있는 시간이 초과하였습니다.
    ATH2009: 'ATH2009',
    ATH1221: 'ATH1221',     // 인증번호 유효시간이 경과되었습니다.
    ATH2011: 'ATH2011',
    ATH2013: 'ATH2013',
    ATH2014: 'ATH2014',
    ATH8007: 'ATH8007',
    ICAS3101: 'ICAS3101',
    ICAS3162: 'ICAS3162'
  },
  open: function (authUrl, authKind, callback) {
    this._authUrl = authUrl;
    this._authKind = authKind;
    this._callback = callback;

    this._popupService.open({
      hbs: 'CO_CE_02_05_01_01_01',
      layer: true
    }, $.proxy(this._onOpenSmsFull, this), $.proxy(this._onCloseSmsFull, this), 'sms-full');

  },
  _onOpenSmsFull: function ($popupContainer) {
    this.$inputName = $popupContainer.find('#fe-input-name');
    this.$inputBirth = $popupContainer.find('#fe-input-birth');
    this.$inputGender = $popupContainer.find('.fe-radio-gender');
    this.$inputMdn = $popupContainer.find('#fe-input-mdn');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btReCert = $popupContainer.find('#fe-bt-recert');
    this.$btCertAdd = $popupContainer.find('#fe-bt-cert-add');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$showTime = $popupContainer.find('#fe-sms-time');

    this.$inputboxName = $popupContainer.find('#fe-inputbox-name');
    this.$inputboxBirth = $popupContainer.find('#fe-inputbox-birth');
    this.$inputboxGender = $popupContainer.find('#fe-inputbox-gender');
    this.$inputboxMdn = $popupContainer.find('#fe-inputbox-mdn');
    this.$inputboxCert = $popupContainer.find('#fe-inputbox-cert');

    this.$errorName = $popupContainer.find('#aria-phone-tx1');
    this.$errorNameMismatch = $popupContainer.find('#aria-phone-tx2');
    this.$errorBirth = $popupContainer.find('#aria-birth-tx1');
    this.$errorBirthLen = $popupContainer.find('#aria-birth-tx2');
    this.$errorGender = $popupContainer.find('#aria-gender-tx5');

    this.$validCert = $popupContainer.find('#aria-cert-num2');
    this.$validAddCert = $popupContainer.find('#aria-cert-num1');
    this.$errorCertTime = $popupContainer.find('#aria-cert-num3');
    this.$errorCertCount = $popupContainer.find('#aria-cert-num4');
    this.$errorCertAddTime = $popupContainer.find('#aria-cert-num5');
    this.$errorCertStop = $popupContainer.find('#aria-cert-num6');
    this.$errorCertBlock = $popupContainer.find('#aria-cert-num7');
    this.$errorConfirmCert = $popupContainer.find('#aria-phone-err1');
    this.$errorConfirmTime = $popupContainer.find('#aria-phone-err2');
    this.$errorConfirmCnt = $popupContainer.find('#aria-phone-err3');

    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btReCert.on('click', $.proxy(this._onClickReCert, this));
    this.$btCertAdd.on('click', $.proxy(this._onClickCertAdd, this));
    this.$btConfirm.click(_.debounce($.proxy(this._onClickConfirm, this), 500));
    this.$inputMdn.on('input', $.proxy(this._onInputMdn, this));
    this.$inputGender.on('click', $.proxy(this._onClickGender, this));
    this.$inputBirth.on('input', $.proxy(this._onInputBirth, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));

    $popupContainer.on('click', '.fe-bt-mdn-delete', $.proxy(this._onInputMdn, this));
    $popupContainer.on('click', '.fe-bt-cert-delete', $.proxy(this._onInputCert, this));

    new Tw.InputFocusService($popupContainer, this.$btConfirm);
  },
  _onCloseSmsFull: function () {
    if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
      clearInterval(this._addTimer);
    }

    if ( !Tw.FormatHelper.isEmpty(this._result) ) {
      this._callback(this._result);
    }
  },
  _onInputMdn: function ($event) {
    if ( !Tw.FormatHelper.isEmpty($event) ) {
      Tw.InputHelper.inputNumberOnly($event.target);
    }
    var mdnLength = this.$inputMdn.val().length;
    if ( mdnLength === Tw.MIN_MDN_LEN || mdnLength === Tw.MAX_MDN_LEN ) {
      this.$btCert.attr('disabled', false);
      this.$btReCert.attr('disabled', false);
    } else {
      this.$btCert.attr('disabled', true);
      this.$btReCert.attr('disabled', true);
    }
    this._checkEnableConfirmButton();
  },
  _onInputBirth: function ($event) {
    if ( !Tw.FormatHelper.isEmpty($event) ) {
      Tw.InputHelper.inputNumberOnly($event.target);
    }
    var inputBirth = this.$inputBirth.val();
    if ( inputBirth.length >= Tw.BIRTH_LEN ) {
      this.$inputBirth.val(inputBirth.slice(0, Tw.BIRTH_LEN));
    }
  },
  _onInputCert: function ($event) {
    if ( !Tw.FormatHelper.isEmpty($event) ) {
      Tw.InputHelper.inputNumberOnly($event.target);
    }
    var inputCert = this.$inputCert.val();
    if ( inputCert.length >= Tw.DEFAULT_CERT_LEN ) {
      this.$inputCert.val(inputCert.slice(0, Tw.DEFAULT_CERT_LEN));
    }
    this._checkEnableConfirmButton();
  },
  _checkEnableConfirmButton: function () {
    var inputCert = this.$inputCert.val();
    var inputMdn = this.$inputMdn.val();
    var mdnLength = inputMdn ? inputMdn.length : 0;
    if ( inputCert.length >= Tw.DEFAULT_CERT_LEN && (mdnLength === Tw.MIN_MDN_LEN || mdnLength === Tw.MAX_MDN_LEN) ) {
      this.$btConfirm.attr('disabled', false);
    } else {
      this.$btConfirm.attr('disabled', true);
    }
  },
  _onClickGender: function ($event) {
    var $currentTarget = $($event.currentTarget);
    this.$inputGender.prop('checked', false);
    this.$inputGender.parent().removeClass('checked');
    this.$inputGender.attr('aria-checked', false);
    $currentTarget.prop('checked', true);
    $currentTarget.parent().addClass('checked');
    $currentTarget.attr('aria-checked', true);
  },
  _onClickCert: function () {
    this._requestCert();
  },
  _onClickReCert: function () {
    this._sendCert(true);
  },
  _requestCert: function () {
    this._apiService.request(Tw.NODE_CMD.GET_URL_META, {})
      .done($.proxy(this._successGetUrlMeta, this));
  },
  _successGetUrlMeta: function (resp) {
    this._jobCode = Tw.BrowserHelper.isApp() ? 'NFM_MTW_CMNBSNS_AUTH' : 'NFM_MWB_CMNBSNS_AUTH';
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.auth && resp.result.auth.jobCode ) {
        if ( !Tw.FormatHelper.isEmpty(resp.result.auth.jobCode) ) {
          this._jobCode = Tw.BrowserHelper.isApp() ? resp.result.auth.jobCode.mobileApp : resp.result.auth.jobCode.mobileWeb;
        }
      }
    }
    this._sendCert();
  },
  _sendCert: function (reCert) {
    if ( Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.READY_SMS, {}, $.proxy(this._onReadSms, this, reCert));
    } else {
      this._sendCertApi(reCert);
    }
  },
  _onReadSms: function (reCert, resp) {
    this._sendCertApi(reCert);
  },
  _sendCertApi: function(reCert) {
    if ( this._checkCertValidation() ) {
      this.mdn = this.$inputMdn.val();
      var params = {
        jobCode: this._jobCode,
        receiverNum: this.mdn,
        name: this.$inputName.val(),
        birthDate: this.$inputBirth.val(),
        sex: this.GENDER_CODE[this.$inputGender.filter(':checked').val()]
      };
      this._apiService.request(Tw.API_CMD.BFF_01_0028, params)
        .done($.proxy(this._successRequestCert, this, reCert));
    }
  },
  _onClickCertAdd: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0027, { seqNo: this.certSeq })
      .done($.proxy(this._successRequestCertAdd, this));
  },
  _successRequestCert: function (reCert, resp) {
    this._clearCertError();
    this._clearConfirmError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.certSeq = resp.result.seqNo;
      this.$btCertAdd.attr('disabled', false);
      this._getCertNum();
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$validCert);
      if ( !reCert ) {
        this.$btCert.addClass('none');
        this.$btReCert.removeClass('none');
      }
      if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
        clearInterval(this._addTimer);
      }
      this._addTime = new Date();
      this._addTimer = setInterval($.proxy(this._showTimer, this, this._addTime), 1000);
    } else {
      this._checkCertError(resp.code, resp.msg);
    }
  },
  _getCertNum: function () {
    if ( Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.GET_CERT_NUMBER, {}, $.proxy(this._onCertNum, this));
    }
  },
  _onCertNum: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this.$inputCert.val(resp.params.cert);
      this._onInputCert();
    }
  },
  _checkCertError: function (errorCode, errorMsg) {
    // this._clearCertError();
    if ( errorCode === this.SMS_ERROR.ATH2003 ) {
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$errorCertTime);
    } else if ( errorCode === this.SMS_ERROR.ATH2006 ) {
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$errorCertCount);
    } else if ( errorCode === this.SMS_ERROR.ATH8006 ) {
      this._showError(this.$inputboxName, this.$inputName, this.$errorNameMismatch, 'aria-phone-tx2');
    } else if ( errorCode === this.SMS_ERROR.ATH8007 ) {
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$errorCertStop);
    } else if ( errorCode === this.SMS_ERROR.ICAS3101 || errorCode === this.SMS_ERROR.ICAS3162) {
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$errorCertBlock);
    } else {
      Tw.Error(errorCode, errorMsg).pop();
    }
  },
  _showTimer: function (startTime) {
    var remainedSec = Tw.DateHelper.getRemainedSec(startTime);
    this.$showTime.val(Tw.DateHelper.convertMinSecFormat(remainedSec));
    if ( remainedSec <= 0 ) {
      clearInterval(this._addTimer);
    }
  },
  // _expireAddTime: function () {
  //   this.$btReCert.removeClass('none');
  //   this.$btCertAdd.addClass('none');
  // },
  _successRequestCertAdd: function (resp) {
    if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
      clearTimeout(this._addTimer);
    }
    this._clearConfirmError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$validAddCert);
      if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
        clearInterval(this._addTimer);
      }
      this._addTime = new Date();
      this._addTimer = setInterval($.proxy(this._showTimer, this, this._addTime), 1000);
    } else if ( resp.code === this.SMS_ERROR.ATH1221 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorCertAddTime);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _onClickConfirm: function () {
    var inputCert = this.$inputCert.val();
    var params = {
      jobCode: this._jobCode,
      authNum: inputCert,
      authUrl: this._authUrl,
      receiverNum: this.mdn,
      authKind: this._authKind,
      prodAuthKey: '',
      authMethod: Tw.AUTH_CERTIFICATION_METHOD.SMS_KEYIN
    };
    this._requestConfirm(params);
  },
  _requestConfirm: function (params) {
    this._apiService.request(Tw.API_CMD.BFF_01_0015, params)
      .done($.proxy(this._successRequestConfirm, this));
  },
  _successRequestConfirm: function (resp) {
    this._clearConfirmError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._result = resp;
      this._popupService.close();
    } else if ( resp.code === this.SMS_ERROR.ATH2007 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorConfirmCert);
    } else if ( resp.code === this.SMS_ERROR.ATH2008 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorConfirmTime);
    } else if ( resp.code === this.SMS_ERROR.ATH2011 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorConfirmCnt);
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
  _checkCertValidation: function () {
    var inputName = this.$inputName.val();
    var inputBirth = this.$inputBirth.val();
    var result = true;
    this._clearAllError();
    if ( Tw.FormatHelper.isEmpty(inputName) ) {
      result = false;
      this._showError(this.$inputboxName, this.$inputName, this.$errorName);
    }
    if ( Tw.FormatHelper.isEmpty(inputBirth) ) {
      result = false;
      this._showError(this.$inputboxBirth, this.$inputBirth, this.$errorBirth);
    } else if ( inputBirth.length !== Tw.BIRTH_LEN ) {
      result = false;
      this._showError(this.$inputboxBirth, this.$inputBirth, this.$errorBirthLen);
    }
    if ( this.$inputGender.filter(':checked').length === 0 ) {
      result = false;
      this._showError(this.$inputboxGender, this.$inputGender, this.$errorGender);
    }
    return result;
  },
  _showError: function (inputBox, input, error) {
    inputBox.addClass('error');
    input.attr('aria-describedby', error.attr('id'));
    error.removeClass('none');
    error.attr('aria-hidden', false);
  },
  _clearError: function (inputBox, input, error) {
    inputBox.removeClass('error');
    input.attr('aria-describedby', '');
    error.addClass('none');
    error.attr('aria-hidden', true);
  },
  // _onRefreshCallback: function () {
  //   if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
  //     var interval = new Date().getTime() - this._addTime;
  //
  //     clearTimeout(this._addTimer);
  //     if ( interval > Tw.SMS_CERT_TIME ) {
  //       this._expireAddTime();
  //     } else {
  //       this._addTimer = setTimeout($.proxy(this._expireAddTime, this), Tw.SMS_CERT_TIME - interval);
  //     }
  //   }
  // },
  _clearAllError: function () {
    this._clearError(this.$inputboxName, this.$inputName, this.$errorName);
    this._clearError(this.$inputboxName, this.$inputName, this.$errorNameMismatch);
    this._clearError(this.$inputboxBirth, this.$inputBirth, this.$errorBirth);
    this._clearError(this.$inputboxBirth, this.$inputBirth, this.$errorBirthLen);
    this._clearError(this.$inputboxGender, this.$inputGender, this.$errorGender);
  },
  _clearCertError: function () {
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$validCert);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertTime);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertCount);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertStop);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertBlock);
  },
  _clearConfirmError: function () {
    this._clearError(this.$inputboxCert, this.$inputCert, this.$validAddCert);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorCertAddTime);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorConfirmCert);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorConfirmTime);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorConfirmCnt);
  }
};

