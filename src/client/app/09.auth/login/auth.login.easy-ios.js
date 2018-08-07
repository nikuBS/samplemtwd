/**
 * FileName: auth.login.easy-ios.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.26
 */

Tw.AuthLoginEasyIos = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this.$inputName = null;
  this.$inputBirth = null;
  this.$inputGender = null;
  this.$inputMdn = null;
  this.$inputCert = null;
  this.$btCert = null;
  this.$btLogin = null;

  this._bindEvent();
};

Tw.AuthLoginEasyIos.prototype = {
  GENDER_CODE: {
    '1': 'MALE',
    '2': 'FEMALE'
  },
  ERROR_CODE: {
    SMS2003: 'SMS2003',   // 1분 안에 재발송 오류 처리
    SMS2006: 'SMS2006',   // 5분 안에 4회 발송 오류 처리
    SMS2008: 'SMS2008',   // 인증번호를 입력할 수 있는 시간이 초과 하였습니다.
    SMS2007: 'SMS2007',   // 입력하신 인증번호가 맞지 않습니다. 다시 입력해 주세요.
    ATH1004: 'ATH1004',   // 입력하신 정보가 일치하지 않습니다. 확인 후 재입력해 주세요.
    ATH1005: 'ATH1005'    // 휴대폰번호 입력오류
  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-bt-cop', $.proxy(this._onClickCopBtn, this));

    this.$inputName = this.$container.find('#fe-input-name');
    this.$inputBirth = this.$container.find('#fe-input-birth');
    this.$inputGender = this.$container.find('.fe-radio-gender');
    this.$inputMdn = this.$container.find('#fe-input-mdn');
    this.$inputCert = this.$container.find('#fe-input-cert');
    this.$btCert = this.$container.find('#fe-bt-cert');
    this.$btLogin = this.$container.find('#fe-bt-login');

    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btLogin.on('click', $.proxy(this._onClickLogin, this));
    this.$inputMdn.on('keyup', $.proxy(this._onKeyupMdn, this));
    this.$inputGender.on('click', $.proxy(this._onClickGender, this));
    this.$inputBirth.on('input', $.proxy(this._onInputBirth, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));
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
    if ( this._checkCertValidation() ) {
      var mdn = this.$inputMdn.val();
      this._apiService.request(Tw.API_CMD.BFF_03_0019, {}, {}, mdn)
        .done($.proxy(this._successRequestCert, this));
    }
  },
  _successRequestCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.$btLogin.attr('disabled', false);
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_L04);
    } else if ( resp.code === this.ERROR_CODE.SMS2003 ) {
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_L51);
    } else if ( resp.code === this.ERROR_CODE.SMS2006 ) {
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_L52);
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
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
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.UIService.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'Y');
      this._historyService.goBack();
    } else if ( resp.code === this.ERROR_CODE.SMS2007 ) {
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_L62);
    } else if ( resp.code === this.ERROR_CODE.SMS2008 ) {
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_L63);
    } else if ( resp.code === this.ERROR_CODE.ATH1004 || resp.code === this.ERROR_CODE.ATH1005 ) {
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_L03);
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }

  },
  _checkCertValidation: function () {
    var inputName = this.$inputName.val();
    var inputBirth = this.$inputBirth.val();
    if ( Tw.FormatHelper.isEmpty(inputName) ) {
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_L11);
      return false;
    } else if ( Tw.FormatHelper.isEmpty(inputBirth) ) {
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_L12);
      return false;
    } else if ( this.$inputGender.filter(':checked').length === 0 ) {
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_L13);
      return false;
    } else if ( inputBirth.length !== Tw.BIRTH_LEN ) {
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_L02);
      return false;
    }
    return true;
  },
  _checkLoginValidation: function (inputCert) {
    if ( Tw.FormatHelper.isEmpty(inputCert) ) {
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_L61);
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