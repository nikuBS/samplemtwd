/**
 * FileName: certification.sk-sms-refund.js
 * Author: Hakjoon. sim (hakjoon.sim@sk.com)
 * Date: 2018.11.29
 */

Tw.CertificationSkSmsRefund = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._gender = undefined;  // 2: female, 1: male
  this._isCertRequestSuccess = false;
};


Tw.CertificationSkSmsRefund.prototype = {
  SMS_CERT_ERROR: {
    SMS2003: 'ATH2003', // 재전송 제한시간이 지난 후에 이용
    SMS2006: 'ATH2006', // 제한시간 내 인증번호를 보낼 수 있는 횟수 초과
    SMS2007: 'ATH2007', // 인증번호 불일치
    SMS2008: 'ATH2008'  // 인증번호 입력시간 초과
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
            this._isCertRequestSuccess = true;
            this._showCertSuccess();
          } else {
            this._isCertRequestSuccess = true;
            if (!!this.SMS_CERT_ERROR[res.code]) {
              this._showCertError(res.code);
            } else {
              Tw.Error(res.code, res.msg).pop();
            }
          }
          this._enableConfirmIfPossible();
        }, this))
        .fail($.proxy(function (err) {
          this._isCertRequestSuccess = true;
          this._enableConfirmIfPossible();
          Tw.Error(err.code, err.msg).pop();
        }, this));
    };

    this._requestCaptchaConfirm($.proxy(onCaptchaSuccess, this));
  },
  _enableCertBtnIfPossible: function () {
    if (Tw.FormatHelper.isEmpty(this.$inputNumber.val())) {
      this.$btCert.attr('disabled', 'disabled');
      return;
    }
    this.$btCert.removeAttr('disabled');
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
    this.$container.find('.fe-cert-txt.validation-txt').removeClass('none');
  },
  _showCertError: function (code) {
    this.$container.find('.fe-cert-txt').addClass('none');
    this.$container.find('.fe-cert-txt.' + code).removeClass('none');
  },
  _showCertNumberError: function (code) {
    this.$container.find('.fe-cert-number-txt').addClass('none');
    this.$container.find('.fe-cert-number-txt.' + code).removeClass('none');
  }
};
