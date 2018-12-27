/**
 * FileName: certification.sk-full.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.01
 */

Tw.CertificationSkFull = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;

  this.mdn = '';
  this.certSeq = '';
  this._jobCode = null;
};

Tw.CertificationSkFull.prototype = {
  GENDER_CODE: {
    '1': 'M',
    '2': 'F'
  },
  ERROR_CODE: {
    SMS2003: 'SMS2003',   // 1분 안에 재발송 오류 처리
    SMS2006: 'SMS2006',   // 5분 안에 4회 발송 오류 처리
    SMS2008: 'SMS2008',   // 인증번호를 입력할 수 있는 시간이 초과 하였습니다.
    SMS2007: 'SMS2007',   // 입력하신 인증번호가 맞지 않습니다. 다시 입력해 주세요.
    ATH8006: 'ATH8006'    // 입력하신 정보가 일치하지 않습니다. 확인 후 재입력해 주세요.
  },
  open: function (authUrl, authKind, callback) {
    this._authUrl = authUrl;
    this._authKind = authKind;
    this._callback = callback;

    this._popupService.open({
      hbs: 'CO_CE_02_05_01_01_01',
      layer: true
    }, $.proxy(this._onOpenSmsFull, this), $.proxy(this._onCloseSmsFull, this));

  },
  _onOpenSmsFull: function ($popupContainer) {
    this.$inputName = $popupContainer.find('#fe-input-name');
    this.$inputBirth = $popupContainer.find('#fe-input-birth');
    this.$inputGender = $popupContainer.find('.fe-radio-gender');
    this.$inputMdn = $popupContainer.find('#fe-input-mdn');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btCertAdd = $popupContainer.find('#fe-bt-cert-add');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');

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

    this.$validSendCert = $popupContainer.find('#aria-cert-num2');
    this.$validAddCert = $popupContainer.find('#aria-cert-num1');
    this.$errorCertTime = $popupContainer.find('#aria-cert-num3');
    this.$errorCertCount = $popupContainer.find('#aria-cert-num4');
    this.$errorLoginCert = $popupContainer.find('#aria-phone-err1');
    this.$errorLoginTime = $popupContainer.find('#aria-phone-err2');

    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btCertAdd.on('click', $.proxy(this._onClickCertAdd, this));
    this.$btConfirm.on('click', $.proxy(this._onClickConfirm, this));
    this.$inputMdn.on('keyup', $.proxy(this._onKeyupMdn, this));
    this.$inputGender.on('click', $.proxy(this._onClickGender, this));
    this.$inputBirth.on('input', $.proxy(this._onInputBirth, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));
  },
  _onCloseSmsFull: function () {

  },
  _onKeyupMdn: function () {
    var mdnLength = this.$inputMdn.val().length;
    if ( mdnLength === Tw.MIN_MDN_LEN || mdnLength === Tw.MAX_MDN_LEN ) {
      this.$btCert.attr('disabled', false);
    } else {
      this.$btCert.attr('disabled', true);
    }
  },
  _onInputBirth: function () {
    var inputBirth = this.$inputBirth.val();
    if ( inputBirth.length >= Tw.BIRTH_LEN ) {
      this.$inputBirth.val(inputBirth.slice(0, Tw.BIRTH_LEN));
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
  _onClickGender: function ($event) {
    var $currentTarget = $($event.currentTarget);
    this.$inputGender.prop('checked', false);
    this.$inputGender.removeClass('checked');
    this.$inputGender.attr('aria-checked', false);
    $currentTarget.prop('checked', true);
    $currentTarget.addClass('checked');
    $currentTarget.attr('aria-checked', true);
  },
  _onClickCert: function () {
    this._requestCert();
  },
  _requestCert: function () {
    this._apiService.request(Tw.NODE_CMD.GET_URL_META, {})
      .done($.proxy(this._successGetUrlMeta, this));
  },
  _successGetUrlMeta: function (resp) {
    this._jobCode = Tw.BrowserHelper.isApp() ? 'NFM_MTW_CMNBSNS_AUTH' : 'NFM_MWB_CMNBSNS_AUTH';
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.auth && resp.result.auth.jobCode ) {
        this._jobCode = Tw.BrowserHelper.isApp() ? resp.result.auth.jobCode.mobileApp : resp.result.auth.jobCode.mobileWeb;
      }
    }
    this._sendCert();
  },
  _sendCert: function () {
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
        .done($.proxy(this._successRequestCert, this));
    }
  },
  _onClickCertAdd: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0027, { seqNo: this.certSeq })
      .done($.proxy(this._successRequestCertAdd, this));
  },
  _successRequestCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._clearCertError();
      this.certSeq = resp.result.seqNo;
      this.$btCert.addClass('none');
      this.$btCertAdd.removeClass('none');
      this.$validSendCert.removeClass('none');
    } else {
      this._checkCertError(resp.code);
    }
  },
  _successRequestCertAdd: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._clearCertError();
      this.$btCertAdd.addClass('none');
      this.$btCert.text(Tw.BUTTON_LABEL.RETRY);
      this.$btCert.removeClass('none');
      this.$validAddCert.removeClass('none');
    } else {
      this._checkCertError(resp.code, resp.msg);
    }
  },
  _checkCertError: function (errorCode, errorMsg) {
    if ( errorCode === this.ERROR_CODE.SMS2003 ) {
      this._clearCertError();
      this.$errorCertTime.removeClass('none');
    } else if ( errorCode === this.ERROR_CODE.SMS2006 ) {
      this._clearCertError();
      this.$errorCertCount.removeClass('none');
    } else if ( errorCode === this.ERROR_CODE.ATH8006 ) {
      this._showError(this.$inputboxName, this.$inputName, this.$errorNameMismatch, 'aria-phone-tx2');
    } else {
      Tw.Error(errorCode, errorMsg).pop();
    }
  },

  _onClickConfirm: function () {
    var inputCert = this.$inputCert.val();
    var params = {
      jobCode: 'NFM_TWD_MBIMASK_AUTH',
      authNum: inputCert,
      authUrl: this._authUrl,
      receiverNum: this.mdn,
      authKind: this._authKind,
      prodAuthKey: '',
      method: Tw.AUTH_CERTIFICATION_METHOD.SMS_KEYIN
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
      this._callback(resp);
    } else if ( resp.code === this.ERROR_CODE.SMS2007 ) {
      this.$errorLoginCert.removeClass('none');
    } else if ( resp.code === this.ERROR_CODE.SMS2008 ) {
      this.$errorLoginTime.removeClass('none');
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
      this._showError(this.$inputboxName, this.$inputName, this.$errorName, 'aria-phone-tx1');
    }
    if ( Tw.FormatHelper.isEmpty(inputBirth) ) {
      result = false;
      this._showError(this.$inputboxBirth, this.$inputBirth, this.$errorBirth, 'aria-birth-tx1');
    } else if ( inputBirth.length !== Tw.BIRTH_LEN ) {
      result = false;
      this._showError(this.$inputboxBirth, this.$inputBirth, this.$errorBirthLen, 'aria-birth-tx2');
    }
    if ( this.$inputGender.filter(':checked').length === 0 ) {
      result = false;
      this._showError(this.$inputboxGender, this.$inputGender, this.$errorGender, 'aria-gender-tx5');
    }
    return result;
  },
  _showError: function (inputBox, input, error, ariaName) {
    inputBox.addClass('error');
    input.attr('aria-describedby', ariaName);
    error.removeClass('none');
  },
  _clearError: function (inputBox, input, error) {
    inputBox.removeClass('error');
    input.attr('aria-describedby', '');
    error.addClass('none');
  },
  _clearAllError: function () {
    this._clearError(this.$inputboxName, this.$inputName, this.$errorName);
    this._clearError(this.$inputboxName, this.$inputName, this.$errorNameMismatch);
    this._clearError(this.$inputboxBirth, this.$inputBirth, this.$errorBirth);
    this._clearError(this.$inputboxBirth, this.$inputBirth, this.$errorBirthLen);
    this._clearError(this.$inputboxGender, this.$inputGender, this.$errorGender);
  },
  _clearCertError: function () {
    this.$validSendCert.addClass('none');
    this.$validAddCert.addClass('none');
    this.$errorCertTime.addClass('none');
    this.$errorCertCount.addClass('none');
  },
  _clearConfirmError: function () {
    this.$errorLoginCert.addClass('none');
    this.$errorLoginTime.addClass('none');
  }
};

