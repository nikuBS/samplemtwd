/**
 * FileName: common.member.slogin.aos.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.26
 */

Tw.CommonMemberSloginAos = function (rootEl, existMdn, target) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._target = target;

  this.$inputBirth = null;
  this.$btnLogin = null;
  this.$mdn = null;
  this.$errorTxt = null;
  this.$inputBox = null;
  this._bindEvent();
  if ( existMdn === 'false' ) {
    this._getMdn();
  }
};

Tw.CommonMemberSloginAos.prototype = {
  ERROR_CODE: {
    ATH1004: 'ATH1004',   // 입력하신 정보가 일치하지 않습니다. 확인 후 재입력해 주세요.
    ATH1005: 'ATH1005'    // 휴대폰번호 입력오류
  },
  _bindEvent: function () {
    this.$btnLogin = this.$container.find('#fe-easy-login');
    this.$inputBirth = this.$container.find('#fe-input-birth');
    this.$mdn = this.$container.find('.fe-mdn');
    this.$errorTxt = this.$container.find('.fe-error');
    this.$inputBox = this.$container.find('#fe-inputbox');

    this.$btnLogin.on('click', $.proxy(this._onClickEasyLogin, this));
    this.$inputBirth.on('input', $.proxy(this._onInputBirth, this));
    this.$container.on('click', '#fe-bt-delete', $.proxy(this._onInputBirth, this));

    this._svcNum = this.$mdn.data('mdn');
  },
  _onClickEasyLogin: function () {
    var params = {
      svcNum: this._svcNum,
      birthDt: this.$inputBirth.val()
    };
    this._requestLogin(params);
  },
  _onInputBirth: function () {
    var inputBirth = this.$inputBirth.val();
    if ( inputBirth.length >= Tw.BIRTH_LEN && !Tw.FormatHelper.isEmpty(this._svcNum) ) {
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
      if ( Tw.FormatHelper.isEmpty(this._target) ) {
        this._historyService.goBack();
      } else {
        this._historyService.replaceURL(this._target);
      }
    } else if ( resp.code === this.ERROR_CODE.ATH1004 ) {
      this.$errorTxt.removeClass('none');
      this.$inputBox.addClass('error');
      this.$inputBirth.attr('aria-describedby', 'aria-id-num');
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _getMdn: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_MDN, {}, $.proxy(this._onMdn, this));
  },
  _onMdn: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._svcNum = resp.params.mdn;
      this.$mdn.text(Tw.FormatHelper.conTelFormatWithDash(this._svcNum));
    }
  }
};