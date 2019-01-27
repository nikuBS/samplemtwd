/**
 * FileName: certification.sk-sms-refund.js
 * Author: Hakjoon. sim (hakjoon.sim@sk.com)
 * Date: 2018.11.29
 */

Tw.CertificationSkSmsRefund = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._gender = undefined; // 2: female, 1: male
  this._isCertRequestSuccess = false;
  this._certBtnStatus = 0; // 0: 받기, 1: 시간연장하기, 2: 다시받기

  this._timer = undefined;

  this._seqNo = undefined;
};

Tw.CertificationSkSmsRefund.prototype = {
  SMS_CERT_ERROR: {
    ATH2003: 'ATH2003', // 재전송 제한시간이 지난 후에 이용
    ATH2006: 'ATH2006', // 제한시간 내 인증번호를 보낼 수 있는 횟수 초과
    ATH2007: 'ATH2007', // 인증번호 불일치
    ATH2008: 'ATH2008' // 인증번호 입력시간 초과
  },

  openSmsPopup: function (callback) {
    this._callback = callback;

    this._popupService.open({
      hbs: 'MN_01_04_04'
    }, $.proxy(this._onOpenSmsPopup, this));
  },
  _onOpenSmsPopup: function ($popupContainer) {
    this.$container = $popupContainer;
    this.$inputName = $popupContainer.find('#fe-input-name');
    this.$inputBirth = $popupContainer.find('#fe-input-birth');
    this.$inputCaptcha = $popupContainer.find('#fe-input-captcha');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$inputNumber = $popupContainer.find('#fe-input-number');
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$captchaImage = $popupContainer.find('#fe-captcha-image');
    this.$captchaError = $popupContainer.find('.fe-captcha-error');

    $popupContainer.on('change', 'input[type="radio"]', $.proxy(this._onGenderChanged, this));
    $popupContainer.on('click', '.captcha-refresh', $.proxy(this._requestCaptchaImg, this));
    $popupContainer.on('click', '.captcha-sound', $.proxy(this._requestCaptchaSound, this));
    $popupContainer.on('click', '#fe-bt-cert', $.proxy(this._onCert, this));
    this.$inputName.on('keyup', $.proxy(this._enableConfirmIfPossible, this));
    this.$inputBirth.on('keyup', $.proxy(this._enableConfirmIfPossible, this));
    this.$inputCaptcha.on('keyup', $.proxy(this._enableConfirmIfPossible, this));
    this.$inputNumber.on('keyup', $.proxy(this._enableCertBtnIfPossible, this));
    this.$inputCert.on('keyup', $.proxy(this._enableConfirmIfPossible, this));
    this.$btConfirm.on('click', $.proxy(this._requestCertConfirm, this));

    this._requestCaptchaImg();
  },
  _requestCaptchaImg: function () {
    this.$captchaImage.attr('src',
      '/bypass' + Tw.API_CMD.BFF_01_0053.path.replace(':version', 'v1') + '?rnd=' + Math.random());
  },
  _requestCaptchaSound: function () {
    new Audio('/bypass' + Tw.API_CMD.BFF_01_0054.path.replace(':version', 'v1')).play();
  },
  _onGenderChanged: function (e) {
    this._gender = e.currentTarget.value;
    this._enableConfirmIfPossible();
  },
  _onCert: function () {
    if (!this._validate()) {
      return;
    }

    var onCaptchaSuccess = function () {
      var data = {
        name: this.$inputName.val().trim(),
        birthDay: this.$inputBirth.val().trim(),
        gender: this._gender,
        svcNum: this.$inputNumber.val().trim()
      };

      this._apiService.request(Tw.API_CMD.BFF_01_0051, data)
        .done($.proxy(function (res) {
          if (res.code === Tw.API_CODE.CODE_00) {
            clearTimeout(this._timer);
            this._timer = setTimeout($.proxy(this._timeExpired, this), Tw.SMS_CERT_TIME);
            this._isCertRequestSuccess = true;
            this._seqNo = res.result.seqNo;
            this._showCertSuccess();
            this._setCertBtnText();
          } else {
            this._isCertRequestSuccess = false;
            if (!!this.SMS_CERT_ERROR[res.code]) {
              this._showCertError(res.code);
            } else {
              Tw.Error(res.code, res.msg).pop();
            }
          }
          this._enableConfirmIfPossible();
        }, this))
        .fail($.proxy(function (err) {
          this._isCertRequestSuccess = false;
          this._enableConfirmIfPossible();
          Tw.Error(err.code, err.msg).pop();
        }, this));
    };

    if (this._certBtnStatus === 0) {
      this._requestCaptchaConfirm($.proxy(onCaptchaSuccess, this));
    } else if (this._certBtnStatus === 1) {
      this._apiService.request(Tw.API_CMD.BFF_03_0027, { seqNo: this._seqNo })
        .done($.proxy(this._showTimeExpandSuccess, this));
    } else {
      onCaptchaSuccess.call(this);
    }
  },
  _setCertBtnText: function () {
    switch (this._certBtnStatus) {
      case 0:
        this.$btCert.text('시간 연장하기');
        this._certBtnStatus += 1;
        break;
      case 1:
        this.$btCert.text('다시 받기');
        this._certBtnStatus += 1;
        break;
      default:
        break;
    }
  },
  _validate: function () {
    this.$container.find('.error-txt').addClass('none');
    var ret = true;

    // Name
    if (this.$inputName.val().trim().length === 0) {
      this.$container.find('#fe-name-error').removeClass('none');
      ret = false;
    }

    // Birth
    if (this.$inputBirth.val().trim().length === 0) {
      this.$container.find('#fe-birth-error').removeClass('none');
      ret = false;
    } else if (this.$inputBirth.val().trim().length !== 6) {
      this.$container.find('#fe-birth-wrong').removeClass('none');
      ret = false;
    }

    // Gender
    if (!this._gender) {
      this.$container.find('#fe-gender-error').removeClass('none');
      ret = false;
    }


    // Captcha
    if (this.$inputCaptcha.val().trim().length === 0) {
      this.$container.find('#fe-captcha-error').removeClass('none');
      ret = false;
    }

    return ret;
  },
  _enableCertBtnIfPossible: function () {
    var number = this.$inputNumber.val().trim();
    if (number.length === 10 || number.length === 11) {
      this.$btCert.removeAttr('disabled');
      return;
    }
    this.$btCert.attr('disabled', 'disabled');
  },
  _enableConfirmIfPossible: function () {
    if (Tw.FormatHelper.isEmpty(this.$inputName.val()) ||
      Tw.FormatHelper.isEmpty(this.$inputBirth.val())) {
      this.$btConfirm.attr('disabled', 'disabled');
      return;
    }
    if (!this._gender) {
      this.$btConfirm.attr('disabled', 'disabled');
      return;
    }
    if (Tw.FormatHelper.isEmpty(this.$inputCaptcha.val())) {
      this.$btConfirm.attr('disabled', 'disabled');
      return;
    }
    if (!this._isCertRequestSuccess || Tw.FormatHelper.isEmpty(this.$inputCert.val())) {
      this.$btConfirm.attr('disabled', 'disabled');
      return;
    }

    this.$btConfirm.removeAttr('disabled');
  },
  _requestCaptchaConfirm: function (callback) {
    this.$captchaError.addClass('none');

    var answer = this.$inputCaptcha.val().trim();
    if (answer === '') {
      this.$captchaError.removeClass('none');
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_01_0055, {}, {}, [answer])
      .done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          callback();
        } else {
          this.$captchaError.removeClass('none');
        }
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  },
  _requestCertConfirm: function () {
    var data = {
      name: this.$inputName.val().trim(),
      birthDay: this.$inputBirth.val().trim(),
      gender: this._gender,
      svcNum: this.$inputNumber.val().trim(),
      authNum: this.$inputCert.val().trim()
    };
    this._apiService.request(Tw.API_CMD.BFF_01_0052, data)
      .then($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          this._popupService.close();
          if (!!this._callback) {
            this._callback(res);
          }
        } else {
          if (!!this.SMS_CERT_ERROR[res.code]) {
            this._showCertNumberError(res.code);
          } else {
            Tw.Error(res.code, res.msg).pop();
          }
        }
      }, this))
      .fail($.proxy(function (err) {
        Tw.Error(err.code, err.msg).pop();
      }, this));
  },

  _showCertSuccess: function () {
    this.$container.find('.fe-cert-txt').addClass('none');
    this.$container.find('#fe-req-cert-success').removeClass('none');
  },
  _showTimeExpandSuccess: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      clearTimeout(this._timer);
      this._timer = setTimeout($.proxy(this._timeExpired, this), Tw.SMS_CERT_TIME);
      this.$container.find('.fe-cert-txt').addClass('none');
      this.$container.find('#fe-time-expanded').removeClass('none');
      this._setCertBtnText();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _showCertError: function (code) {
    this.$container.find('.fe-cert-txt').addClass('none');
    this.$container.find('.fe-cert-txt.' + code).removeClass('none');
  },
  _showCertNumberError: function (code) {
    this.$container.find('.fe-cert-number-txt').addClass('none');
    this.$container.find('.fe-cert-number-txt.' + code).removeClass('none');
  },
  _timeExpired: function () {
    this._showCertNumberError('ATH2008');
    this.$btConfirm.attr('disabled', 'disabled');
  }
};