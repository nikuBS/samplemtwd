/**
 * FileName: auth.login.easy-aos.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.26
 */

Tw.AuthLoginEasyAos = function (rootEl) {
  this.$container = rootEl
  this._apiService = Tw.Api;

  this.$inputBirth = null;
  this.$btnLogin = null;
  this.$mdn = null;
  this._bindEvent();
};

Tw.AuthLoginEasyAos.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.fe-easy-login', $.proxy(this._onClickEasyLogin, this));
    this.$container.on('input', '.fe-input-birth', $.proxy(this._onKeyupBirth, this));

    this.$btnLogin = this.$container.find('.fe-easy-login');
    this.$inputBirth = this.$container.find('.fe-input-birth');
    this.$mdn = this.$container.find('.fe-mdn');
  },
  _onClickEasyLogin: function () {
    var params = {
      svcNum: this.$mdn.data('mdn'),
      birthDt: this.$inputBirth.val()
    };
    this._requestLogin(params);
  },
  _onKeyupBirth: function () {
    var inputBirth = this.$inputBirth.val();
    if ( inputBirth.length >= 6 ) {
      this.$inputBirth.val(inputBirth.slice(0, 6));
      this.$btnLogin.attr('disabled', false);
    } else {
      this.$btnLogin.attr('disabled', true);
    }
  },
  _requestLogin: function (params) {
    this._apiService.request(Tw.API_CMD.BFF_03_0017, params)
      .done($.proxy(this._successLogin, this));
  },
  _successLogin: function (resp) {
    console.log(resp);
  }
};