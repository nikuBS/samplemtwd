/**
 * FileName: auth.line.cop-register.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.12
 */

Tw.AuthLineCopRegister = function (rootEl, nicknamePopup) {

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nicknamePopup = nicknamePopup;

  this.$inputMdn = null;
  this.$inputCop = null;
  this.$inputCopNum = null;
  this.$inputNickname = null;

  this._cachedElement();
  this._bindEvent();
};

Tw.AuthLineCopRegister.prototype = {
  ERROR_CODE: {
    ATH0020: 'ATH0020',     // 법인회선아님
    ATH0021: 'ATH0021',     // SWING 법인실사용자 등록 회선 (수동등록 불가)
    ATH0022: 'ATH0022',	    // 입력 정보 불일치 - 명의자 법인명 불일치
    ATH0023: 'ATH0023'      // 입력 정보 불일치 - 명의자 법인명 불일치
  },

  _cachedElement: function () {
    this.$inputMdn = this.$container.find('#input-mdn');
    this.$inputCop = this.$container.find('#input-cop');
    this.$inputCopNum = this.$container.find('#input-cop-number');
    this.$inputNickname = this.$container.find('#input-nickname');

  },
  _bindEvent: function () {
    this.$container.on('click', '#bt-nickname', $.proxy(this._onClickNickname, this));
    this.$container.on('click', '.bt-white1', $.proxy(this._onClickCancel, this));
    this.$container.on('click', '.bt-blue1', $.proxy(this._onClickRegister, this));
  },
  _onClickNickname: function () {
    this._nicknamePopup.openNickname(null, $.proxy(this._onCloseNickname, this));
  },
  _onClickCancel: function () {
    history.back();

  },
  _onClickRegister: function () {
    if ( this._isValidInput() ) {
      this._sendBizSession();
    }
  },
  _isValidInput: function () {
    if ( Tw.FormatHelper.isEmpty(this.$inputMdn.val()) ) {
      this._popupService.openAlert(Tw.MSG_AUTH.LINE_A31);
      return false;
    } else if ( Tw.FormatHelper.isEmpty(this.$inputCop.val()) ) {
      this._popupService.openAlert(Tw.MSG_AUTH.LINE_A32);
      return false;
    } else if ( Tw.FormatHelper.isEmpty(this.$inputCopNum.val()) ) {
      this._popupService.openAlert(Tw.MSG_AUTH.LINE_A33);
      return false;
    }
    return true;
  },
  _sendBizSession: function () {
    var params = {
      svcNum: this.$inputMdn.val(),
      ctzCorpNm: this.$inputCop.val(),
      ctzCorpNum: this.$inputCopNum.val()
    };
    this._apiService.request(Tw.API_CMD.BFF_03_0012, params)
      .done($.proxy(this._successBizSession, this))
      .fail($.proxy(this._failBizSession, this));
  },
  _successBizSession: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var svcMgmtNum = resp.result.svcMgmtNum;
      this._sendRegisterBiz(svcMgmtNum);
    } else {
      this._handleError(resp.code, resp.msg);
    }
  },
  _failBizSession: function (error) {
    Tw.Logger.error(error);
  },
  _sendRegisterBiz: function (svcMgmtNum) {
    var params = {
      svcMgmtNum: svcMgmtNum,
      nickNm: this.$inputNickname.val()
    };
    this._apiService.request(Tw.API_CMD.BFF_03_0013, params)
      .done($.proxy(this._successRegisterBiz, this))
      .fail($.proxy(this._failRegisterBiz, this));
  },
  _successRegisterBiz: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      history.back();
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _failRegisterBiz: function (error) {
    Tw.Logger.error(error);
  },
  _onCloseNickname: function (nickname) {
    this.$inputNickname.val(nickname);
  },
  _handleError: function (code, message) {
    if ( code === this.ERROR_CODE.ATH0020 ) {
      this._popupService.openAlert(message);
    } else if ( code === this.ERROR_CODE.ATH0021 ) {
      this._popupService.openAlert(Tw.MSG_AUTH.LINE_A42);
    } else if ( code === this.ERROR_CODE.ATH0022 ) {
      this._popupService.openAlert(Tw.MSG_AUTH.LINE_A41);
    } else if ( code === this.ERROR_CODE.ATH0023 ) {
      this._popupService.openAlert(Tw.MSG_AUTH.LINE_A41);
    } else {
      this._popupService.openAlert(code + ' ' + message);
    }
  }
};
