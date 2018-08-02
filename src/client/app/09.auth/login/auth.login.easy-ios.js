/**
 * FileName: auth.login.easy-ios.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.26
 */

Tw.AuthLoginEasyIos = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

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
  _bindEvent: function () {
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
  },
  _onKeyupMdn: function () {
    var mdnLength = this.$inputMdn.val().length;
    if ( mdnLength === 10 || mdnLength === 11 ) {
      this.$btCert.attr('disabled', false);
    } else {
      this.$btCert.attr('disabled', true);
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
    var mdn = this.$inputMdn.val();
    this._apiService.request(Tw.API_CMD.BFF_03_0019, {}, {}, mdn)
      .done($.proxy(this._successRequestCert, this));
  },
  _successRequestCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.$btLogin.attr('disabled', false);
    }
  },
  _onClickLogin: function () {
    var params = {
      svcNum: this.$inputMdn.val(),
      mbrNm: this.$inputName.val(),
      birthDt: this.$inputBirth.val(),
      gender: this.GENDER_CODE[this.$inputGender.filter(':checked').val()],
      authNum: this.$inputCert.val()
    };
    this._apiService.request(Tw.API_CMD.BFF_03_0018, params)
      .done($.proxy(this._successRequestLogin, this));
  },
  _successRequestLogin: function (resp) {
    console.log(resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {

    }
  }
};