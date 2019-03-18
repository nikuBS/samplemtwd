/**
 * FileName: common.member.line.biz-register.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.27
 */

Tw.CommonMemberLineBizRegister = function (rootEl) {

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nicknamePopup = new Tw.NicknameComponent();
  this._historyService = new Tw.HistoryService();

  this.$inputMdn = null;
  this.$inputCop = null;
  this.$inputCopNum = null;
  this.$inputNickname = null;
  this._nickName = '';

  this._cachedElement();
  this._bindEvent();
};

Tw.CommonMemberLineBizRegister.prototype = {
  ERROR_CODE: {
    ATH0020: 'ATH0020',     // 법인회선아님
    ATH0021: 'ATH0021',     // SWING 법인실사용자 등록 회선 (수동등록 불가)
    ATH0022: 'ATH0022',	    // 입력 정보 불일치 - 명의자 법인명 불일치
    ATH0023: 'ATH0023',     // 입력 정보 불일치 - 명의자 법인명 불일치
    ICAS4027: 'ICAS4027'
  },

  _cachedElement: function () {
    this.$inputMdn = this.$container.find('#fe-input-mdn');
    this.$inputCop = this.$container.find('#fe-input-cop');
    this.$inputCopNum = this.$container.find('#fe-input-cop-number');
    this.$inputNickname = this.$container.find('#fe-input-nickname');
    this.$btConfirm = this.$container.find('#fe-bt-confirm');

  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-bt-nickname', $.proxy(this._onClickNickname, this));

    this.$btConfirm.on('click', $.proxy(this._onClickRegister, this));
    this.$inputMdn.on('input', $.proxy(this._onInputMdn, this));
    this.$inputCop.on('input', $.proxy(this._onInputCop, this));
    this.$inputCopNum.on('input', $.proxy(this._onInputCopNum, this));
  },
  _onClickNickname: function () {
    this._nicknamePopup.openNickname('', null, $.proxy(this._onCloseNickname, this));
  },
  _onClickRegister: function ($event) {
    var $target = $($event.currentTarget);
    this._sendBizSession($target);
  },
  _onInputMdn: function () {
    this._isEnableConfirm();
  },
  _onInputCop: function () {
    this._isEnableConfirm();
  },
  _onInputCopNum: function () {
    this._isEnableConfirm();
  },
  _isEnableConfirm: function () {
    if ( !Tw.FormatHelper.isEmpty(this.$inputMdn.val()) && !Tw.FormatHelper.isEmpty(this.$inputCop.val()) &&
      !Tw.FormatHelper.isEmpty(this.$inputCopNum.val()) ) {
      this.$btConfirm.attr('disabled', false);
    } else {
      this.$btConfirm.attr('disabled', true);
    }
  },
  _sendBizSession: function ($target) {
    var params = {
      svcNum: this.$inputMdn.val(),
      ctzCorpNm: this.$inputCop.val(),
      ctzCorpNum: this.$inputCopNum.val()
    };
    this._apiService.request(Tw.API_CMD.BFF_03_0012, params)
      .done($.proxy(this._successBizSession, this, $target));
  },
  _successBizSession: function ($target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var svcMgmtNum = resp.result.svcMgmtNum;
      this._sendRegisterBiz(svcMgmtNum, $target);
    } else {
      this._handleError(resp.code, resp.msg, $target);
    }
  },
  _sendRegisterBiz: function (svcMgmtNum, $target) {
    var params = {
      svcMgmtNum: svcMgmtNum
    };
    if ( !Tw.FormatHelper.isEmpty(this._nickName) ) {
      params.nickNm = this._nickName;
    }
    this._apiService.request(Tw.API_CMD.BFF_03_0013, params)
      .done($.proxy(this._successRegisterBiz, this, $target))
      .fail($.proxy(this._failRegisterBiz, this));
  },
  _successRegisterBiz: function ($target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {})
        .done($.proxy(this._successUpdateSvc, this));
    } else if ( resp.code === this.ERROR_CODE.ICAS4027 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.ALERT_4_A8, null, null, null, null, $target);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _successUpdateSvc: function (resp) {
    this._historyService.goBack();
  },
  _failRegisterBiz: function (error) {
    Tw.Logger.error(error);
  },
  _onCloseNickname: function (nickname) {
    this._nickName = nickname;
    this.$inputNickname.val(nickname);
  },
  _handleError: function (code, message, $target) {
    if ( code === this.ERROR_CODE.ATH0020 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.ALERT_4_ATH0020, null, null, null, null, $target);
    } else if ( code === this.ERROR_CODE.ATH0021 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.ALERT_4_A8, null, null, null, null, $target);
    } else if ( code === this.ERROR_CODE.ATH0022 && code === this.ERROR_CODE.ATH0023 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.ALERT_4_A7, null, null, null, null, $target);
    } else {
      Tw.Error(code, message).pop();
    }
  }
};
