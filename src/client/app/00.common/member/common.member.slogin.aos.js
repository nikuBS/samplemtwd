/**
 * @file common.member.slogin.aos.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.26
 */

/**
 * @class
 * @desc 공통 > 로그인/로그아웃 > AOS 간편로그인
 * @param rootEl
 * @param existMdn
 * @param target
 * @constructor
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
  /**
   * @member {object}
   * @desc AOS 간편로그인 오류 코드
   * @readonly
   * @prop {string} ATH1005 입력하신 정보가 일치하지 않습니다. 확인 후 재입력해 주세요.
   * @prop {string} ATH1004 휴대폰번호 입력오류
   */
  ERROR_CODE: {
    ATH1004: 'ATH1004',
    ATH1005: 'ATH1005'
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
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

  /**
   * @function
   * @desc 간편로그인 버튼 클릭 처리
   * @private
   */
  _onClickEasyLogin: function () {
    var params = {
      svcNum: this._svcNum,
      birthDt: this.$inputBirth.val()
    };
    this._requestLogin(params);
  },

  /**
   * @function
   * @desc 생년월일 input event 처리
   * @private
   */
  _onInputBirth: function () {
    var inputBirth = this.$inputBirth.val();
    if ( inputBirth.length >= Tw.BIRTH_LEN && !Tw.FormatHelper.isEmpty(this._svcNum) ) {
      this.$inputBirth.val(inputBirth.slice(0, Tw.BIRTH_LEN));
      this.$btnLogin.attr('disabled', false);
    } else {
      this.$btnLogin.attr('disabled', true);
    }
  },

  /**
   * @function
   * @desc AOS 간편로그인 API 요청
   * @param params
   * @private
   */
  _requestLogin: function (params) {
    this._apiService.request(Tw.NODE_CMD.EASY_LOGIN_AOS, params)
      .done($.proxy(this._successLogin, this))
      .fail($.proxy(this._failLogin, this));
  },

  /**
   * @function
   * @desc 간편로그인 API 응답 처리
   * @param resp
   * @private
   */
  _successLogin: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( Tw.FormatHelper.isEmpty(this._target) || this._target === 'undefined' ) {
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

  /**
   * @function
   * @desc 간편로그인 API 실패 처리
   * @param error
   * @private
   */
  _failLogin: function(error) {
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc Native MDN 요청
   * @private
   */
  _getMdn: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_MDN, {}, $.proxy(this._onMdn, this));
  },

  /**
   * @function
   * @desc Native MDN 응답 처리
   * @param resp
   * @private
   */
  _onMdn: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._svcNum = resp.params.mdn;
      this.$mdn.text(Tw.FormatHelper.conTelFormatWithDash(this._svcNum));
    }
  }
};