/**
 * FileName: common.member.slogin.ios.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.26
 */

Tw.CommonMemberSloginIos = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this.mdn = '';
  this.certSeq = '';

  this.$inputName = null;
  this.$inputBirth = null;
  this.$inputGender = null;
  this.$inputMdn = null;
  this.$inputCert = null;
  this.$btCert = null;
  this.$btCertAdd = null;
  this.$btLogin = null;

  this.$inputboxName = null;
  this.$inputboxBirth = null;
  this.$inputboxGender = null;
  this.$errorName = null;
  this.$errorNameMismatch = null;
  this.$errorBirth = null;
  this.$errorBirthLen = null;
  this.$errorGender = null;

  this.$validSendCert = null;
  this.$validAddCert = null;
  this.$errorCertTime = null;
  this.$errorCertCount = null;
  this.$errorLoginCert = null;
  this.$errorLoginTime = null;

  this._addTimer = null;
  this._addTime = null;
  window.onRefresh = $.proxy(this._onRefreshCallback, this);
  this._bindEvent();
};

Tw.CommonMemberSloginIos.prototype = {
  GENDER_CODE: {
    '1': 'MALE',
    '2': 'FEMALE'
  },
  SMS_ERROR: {
    ATH1004: 'ATH1004',     // 입력하신 정보가 일치하지 않습니다. 확인 후 재입력해 주세요.
    ATH1005: 'ATH1005',     // 휴대폰번호 입력오류
    ATH2003: 'ATH2003',     // 재전송 제한시간이 지난 후에 이용하시기 바랍니다.
    ATH2006: 'ATH2006',     // 제한시간 내에 보낼 수 있는 발송량이 초과하였습니다.
    ATH2007: 'ATH2007',     // 입력하신 인증번호가 맞지 않습니다.
    ATH2008: 'ATH2008',     // 인증번호를 입력할 수 있는 시간이 초과하였습니다.
    ATH1221: 'ATH1221'      // 인증번호 유효시간이 경과되었습니다.
  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-bt-cop', $.proxy(this._onClickCopBtn, this));

    this.$inputName = this.$container.find('#fe-input-name');
    this.$inputBirth = this.$container.find('#fe-input-birth');
    this.$inputGender = this.$container.find('.fe-radio-gender');
    this.$inputMdn = this.$container.find('#fe-input-mdn');
    this.$inputCert = this.$container.find('#fe-input-cert');
    this.$btCert = this.$container.find('#fe-bt-cert');
    this.$btReCert = this.$container.find('#fe-bt-recert');
    this.$btCertAdd = this.$container.find('#fe-bt-cert-add');
    this.$btLogin = this.$container.find('#fe-bt-login');

    this.$inputboxName = this.$container.find('#fe-inputbox-name');
    this.$inputboxBirth = this.$container.find('#fe-inputbox-birth');
    this.$inputboxGender = this.$container.find('#fe-inputbox-gender');
    this.$errorName = this.$container.find('#aria-phone-tx1');
    this.$errorNameMismatch = this.$container.find('#aria-phone-tx2');
    this.$errorBirth = this.$container.find('#aria-birth-tx1');
    this.$errorBirthLen = this.$container.find('#aria-birth-tx2');
    this.$errorGender = this.$container.find('#aria-gender-tx');

    this.$validSendCert = this.$container.find('#aria-cert-num2');
    this.$validAddCert = this.$container.find('#aria-cert-num1');
    this.$errorCertTime = this.$container.find('#aria-cert-num3');
    this.$errorCertCount = this.$container.find('#aria-cert-num4');
    this.$errorCertAddTime = this.$container.find('#aria-cert-num5');
    this.$errorLoginCert = this.$container.find('#aria-phone-err1');
    this.$errorLoginTime = this.$container.find('#aria-phone-err2');

    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btReCert.on('click', $.proxy(this._onClickReCert, this));
    this.$btCertAdd.on('click', $.proxy(this._onClickCertAdd, this));
    this.$btLogin.on('click', $.proxy(this._onClickLogin, this));
    this.$inputMdn.on('keyup', $.proxy(this._onKeyupMdn, this));
    this.$inputGender.on('click', $.proxy(this._onClickGender, this));
    this.$inputBirth.on('input', $.proxy(this._onInputBirth, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));

    this.$container.on('click', '#fe-bt-cert-delete', $.proxy(this._onInputCert, this));
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
      this.$btLogin.attr('disabled', false);
    } else {
      this.$btLogin.attr('disabled', true);
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
    this._sendCert();
  },
  _onClickReCert: function () {
    this._sendCert(true);
  },
  _sendCert: function(reCert) {
    if ( this._checkCertValidation() ) {
      this.mdn = this.$inputMdn.val();
      var params = {
        mbrNm: this.$inputName.val(),
        birthDt: this.$inputBirth.val(),
        gender: this.GENDER_CODE[this.$inputGender.filter(':checked').val()]
      };
      this._apiService.request(Tw.API_CMD.BFF_03_0019, params, {}, [this.mdn])
        .done($.proxy(this._successRequestCert, this, reCert));
    }
  },
  _onClickCertAdd: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0027, { seqNo: this.certSeq })
      .done($.proxy(this._successRequestCertAdd, this));
  },
  _successRequestCert: function (reCert, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._clearCertError();
      this.certSeq = resp.result.seqNo;
      this.$validSendCert.removeClass('none');
      if ( !reCert ) {
        this.$btReCert.addClass('none');
        this.$btCert.addClass('none');
        this.$btCertAdd.removeClass('none');
        this._addTimer = setTimeout($.proxy(this._expireAddTime, this), Tw.SMS_CERT_TIME);
        this._addTime = new Date().getTime();
      }
    } else {
      this._checkCertError(resp.code);
    }
  },
  _expireAddTime: function () {
    this.$btReCert.parent().removeClass('none');
    this.$btCertAdd.parent().addClass('none');
  },
  _successRequestCertAdd: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._clearCertError();
      this.$btCertAdd.addClass('none');
      this.$btReCert.removeClass('none');
      this.$validAddCert.removeClass('none');
    } else if ( resp.code === this.SMS_ERROR.ATH1221 ) {
      this._clearCertError();
      this.$btCertAdd.parent().addClass('none');
      this.$btReCert.parent().removeClass('none');
      this.$errorCertAddTime.removeClass('none');
    } else {
      this._checkCertError(resp.code, resp.msg);
    }
  },
  _checkCertError: function (errorCode, errorMsg) {
    if ( errorCode === this.SMS_ERROR.ATH2003 ) {
      this._clearCertError();
      this.$errorCertTime.removeClass('none');
    } else if ( errorCode === this.SMS_ERROR.ATH2006 ) {
      this._clearCertError();
      this.$errorCertCount.removeClass('none');
    } else if ( errorCode === this.SMS_ERROR.ATH1004 ) {
      this._showError(this.$inputboxName, this.$inputName, this.$errorNameMismatch, 'aria-phone-tx2');
    } else {
      Tw.Error(errorCode, errorMsg).pop();
    }
  },

  _onClickLogin: function () {
    var inputCert = this.$inputCert.val();
    if ( this._checkLoginValidation(inputCert) ) {
      var params = {
        svcNum: this.$inputMdn.val(),
        mbrNm: this.$inputName.val(),
        birthDt: this.$inputBirth.val(),
        gender: this.GENDER_CODE[this.$inputGender.filter(':checked').val()],
        authNum: inputCert
      };
      this._requestLogin(params);
    }
  },
  _requestLogin: function (params) {
    this._apiService.request(Tw.NODE_CMD.EASY_LOGIN_IOS, params)
      .done($.proxy(this._successRequestLogin, this));
  },
  _successRequestLogin: function (resp) {
    this._clearLoginError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      // Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'Y');
      this._historyService.goBack();
    } else if ( resp.code === this.SMS_ERROR.ATH2007 ) {
      this.$errorLoginCert.removeClass('none');
    } else if ( resp.code === this.SMS_ERROR.ATH2008 ) {
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
      this._showError(this.$inputboxGender, this.$inputGender, this.$errorGender, 'aria-gender-tx1');
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
  _onRefreshCallback: function () {
    if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
      var interval = new Date().getTime() - this._addTime;

      clearTimeout(this._addTimer);
      if ( interval > Tw.SMS_CERT_TIME ) {
        this._expireAddTime();
      } else {
        this._addTimer = setTimeout($.proxy(this._expireAddTime, this), Tw.SMS_CERT_TIME - interval);
      }
    }
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
    this.$errorCertAddTime.addClass('none');
  },
  _clearLoginError: function () {
    this.$errorLoginCert.addClass('none');
    this.$errorLoginTime.addClass('none');
  },
  _checkLoginValidation: function (inputCert) {
    if ( Tw.FormatHelper.isEmpty(inputCert) ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.EMPTY_CERT);
      return false;
    }
    return true;
  },
  _onClickCopBtn: function () {
    this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
      type: Tw.NTV_BROWSER.EXTERNAL,
      href: Tw.URL_PATH.COP_SERVICE
    });
  }
};