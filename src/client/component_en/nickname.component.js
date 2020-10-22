/**
 * @file auth.line.nickname.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.12
 */

/**
 * @class
 * @desc 공통 > 회선 > 닉네임 변경
 * @constructor
 */
Tw.NicknameComponent = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this.$nicknameInput = null;
  this.$nicknameConfirm = null;
  this.$nicknameError = null;
  // this.$nicknameGuide = null;
  this.$nicknameLength = null;

  this._closeCallback = null;
  this._svcMgmtNum = null;
  this._isChanged = false;
};

Tw.NicknameComponent.prototype = {
  /**
   * @function
   * @desc 닉네임 변경 팝업 요청
   * @param nickname
   * @param svcMgmtNum
   * @param closeCallback
   * @param $target
   */
  openNickname: function (nickname, svcMgmtNum, closeCallback, $target) {
    this._closeCallback = closeCallback;
    this._svcMgmtNum = svcMgmtNum;
    this._popupService.open({
      hbs: 'CO_01_05_02_01',
      layer: true,
      data: {
        nickname: nickname,
        nicknameLen: nickname.length
      }
    }, $.proxy(this._onOpenNickname, this, nickname), $.proxy(this._onCloseNickname, this), 'nickname', $target);

  },

  /**
   * @function
   * @desc 닉네임 변경 팝업 오픈 콜백 (이벤트 바인딩)
   * @param nickname
   * @param $popup
   * @private
   */
  _onOpenNickname: function (nickname, $popup) {
    Tw.CommonHelper.focusOnActionSheet($popup);

    this.$nicknameInput = $popup.find('#fe-input-nickname');
    this.$nicknameConfirm = $popup.find('#fe-bt-confirm');
    this.$nicknameError = $popup.find('#aria-exp-desc1');
    // this.$nicknameGuide = $popup.find('#aria-from-label1');
    this.$nicknameLength = $popup.find('#fe-span-length');

    // this.$nicknameInput.val(nickname);
    this.$nicknameInput.on('input', $.proxy(this._onInputNickname, this));
    this.$nicknameConfirm.on('click', $.proxy(this._onClickConfirmNickname, this));

    $popup.on('click', '.fe-bt-nickname-delete', $.proxy(this._onInputNickname, this));
  },

  /**
   * @function
   * @desc 닉네임 변경 팝업 클로즈 콜백
   * @private
   */
  _onCloseNickname: function () {
    if ( this._isChanged ) {
      this._closeCallback(this.$nicknameInput.val());
      this._closeCallback = null;
      this._isChanged = false;
    }

  },

  /**
   * @function
   * @desc 닉네임 변경 버튼 click event 처리
   * @param $event
   * @private
   */
  _onClickConfirmNickname: function ($event) {
    $event.stopPropagation();
    var inputValue = this.$nicknameInput.val();
    if ( inputValue.length === 0 ) {
      return;
    }
    if ( Tw.ValidationHelper.containSpecial(inputValue, 1) || Tw.ValidationHelper.containNumber(inputValue, 3) ) {
      this.$nicknameError.parents('.inputbox').addClass('error');
      this.$nicknameError.text(Tw.ALERT_MSG_AUTH.NICKNAME_VALID);
    } else {
      this._changeNickname(inputValue);
    }
  },

  /**
   * @function
   * @desc 닉네임 input event 처리
   * @private
   */
  _onInputNickname: function () {
    var textNickname = this.$nicknameInput.val();
    var textLength = textNickname.length;
    this.$nicknameLength.html(textLength >= Tw.MAX_NICKNAME_LEN ? Tw.MAX_NICKNAME_LEN : textLength);
    if ( textLength >= Tw.MAX_NICKNAME_LEN ) {
      this.$nicknameInput.val(textNickname.slice(0, Tw.MAX_NICKNAME_LEN));
    }
    this._checkEnableConfirm(textLength);
  },

  /**
   * @function
   * @desc 닉네임 변경하기 버튼 enable/disable 판단
   * @param textLength
   * @private
   */
  _checkEnableConfirm: function (textLength) {
    if ( textLength > 0 ) {
      this.$nicknameConfirm.attr('disabled', false);
    } else {
      this.$nicknameConfirm.attr('disabled', true);
    }
  },

  /**
   * @function
   * @desc 닉네임 변경 요청
   * @param nickname
   * @private
   */
  _changeNickname: function (nickname) {
    if ( !Tw.FormatHelper.isEmpty(this._svcMgmtNum) ) {
      var params = {
        nickNm: nickname
      };
      this._apiService.request(Tw.NODE_CMD.CHANGE_NICKNAME, {
        params: params,
        pathParams: [this._svcMgmtNum]
      }).done($.proxy(this._successChangeNickname, this, nickname))
        .fail($.proxy(this._failChangeNickname, this));

    } else {
      this._isChanged = true;
      this._popupService.close();
    }
  },

  /**
   * @function
   * @desc 닉네임 변경 응답 처리
   * @param nickname
   * @param resp
   * @private
   */
  _successChangeNickname: function (nickname, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._isChanged = true;
      this._popupService.close();
    } else {
      this.$nicknameError.parents('.inputbox').addClass('error');
      this.$nicknameError.text(Tw.ALERT_MSG_AUTH.NICKNAME_ERROR);
    }
  },

  /**
   * @function
   * @desc 닉네임 변경 요청 실패 처리
   * @param error
   * @private
   */
  _failChangeNickname: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  }
};
