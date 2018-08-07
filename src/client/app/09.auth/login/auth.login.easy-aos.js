/**
 * FileName: auth.login.easy-aos.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.26
 */

Tw.AuthLoginEasyAos = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this.$inputBirth = null;
  this.$btnLogin = null;
  this.$mdn = null;
  this.$errorTxt = null;
  this.$inputBox = null;
  this.$btDel = null;
  this._bindEvent();
};

Tw.AuthLoginEasyAos.prototype = {
  ERROR_CODE: {
    ATH1004: 'ATH1004',   // 입력하신 정보가 일치하지 않습니다. 확인 후 재입력해 주세요.
    ATH1005: 'ATH1005'    // 휴대폰번호 입력오류
  },
  _bindEvent: function () {
    this.$btnLogin = this.$container.find('#fe-easy-login');
    this.$inputBirth = this.$container.find('#fe-input-birth');
    this.$mdn = this.$container.find('#fe-mdn');
    this.$errorTxt = this.$container.find('.fe-error');
    this.$inputBox = this.$container.find('#fe-inputbox');
    this.$btDel = this.$container.find('#fe-bt-del');

    this.$btnLogin.on('click', $.proxy(this._onClickEasyLogin, this));
    this.$inputBirth.on('input', $.proxy(this._onInputBirth, this));
    this.$btDel.on('click', $.proxy(this._onClickDel, this));
  },
  _onClickEasyLogin: function () {
    var params = {
      svcNum: this.$mdn.data('mdn'),
      birthDt: this.$inputBirth.val()
    };
    this._requestLogin(params);
  },
  _onInputBirth: function () {
    var inputBirth = this.$inputBirth.val();
    if ( inputBirth.length >= Tw.BIRTH_LEN ) {
      this.$inputBirth.val(inputBirth.slice(0, Tw.BIRTH_LEN));
      this.$btnLogin.attr('disabled', false);
    } else {
      this.$btnLogin.attr('disabled', true);
    }
  },
  _requestLogin: function (params) {
    this._apiService.request(Tw.NODE_CMD.EASY_LOGIN_AOS, params)
      .done($.proxy(this._successLogin, this));
  },
  _successLogin: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.UIService.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'Y');
      this._historyService.goBack();
    } else if ( resp.code === this.ERROR_CODE.ATH1005 ) {
      this.$errorTxt.removeClass('none');
      this.$inputBox.addClass('error');
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _onClickDel: function () {
    this.$inputBirth.val('');
  }
};