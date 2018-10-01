/**
 * FileName: auth.line.nickname.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.12
 */
Tw.NicknameComponent = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this.$nicknameInput = null;
  this.$nicknameConfirm = null;
  this.$nicknameError = null;
  this.$nicknameGuide = null;
  this.$nicknameLength = null;

  this._closeCallback = null;
  this._svcMgmtNum = null;
  this._isChanged = false;
};

Tw.NicknameComponent.prototype = {
  openNickname: function (nickname, svcMgmtNum, closeCallback) {
    this._closeCallback = closeCallback;
    this._svcMgmtNum = svcMgmtNum;
    this._popupService.open({
      hbs: 'CO_01_05_02_01',
      layer: true
    }, $.proxy(this._onOpenNickname, this, nickname), $.proxy(this._onCloseNickname, this), 'nickname');

  },
  _onOpenNickname: function (nickname, $popup) {
    console.log($popup);
    this.$nicknameInput = $popup.find('#fe-input-nickname');
    this.$nicknameConfirm = $popup.find('#fe-bt-confirm');
    this.$nicknameError = $popup.find('#aria-exp-desc1');
    this.$nicknameGuide = $popup.find('#aria-from-label1');
    this.$nicknameLength = $popup.find('#fe-span-length');

    this.$nicknameInput.val(nickname);
    this.$nicknameInput.on('input', $.proxy(this._onKeyupNickname, this));
    this.$nicknameConfirm.on('click', $.proxy(this._onClickConfirmNickname, this));
  },
  _onCloseNickname: function () {
    if ( this._isChanged ) {
      this._closeCallback(this.$nicknameInput.val());
      this._closeCallback = null;
    }

  },
  _onClickConfirmNickname: function ($event) {
    $event.stopPropagation();
    var inputValue = this.$nicknameInput.val();
    if ( inputValue.length === 0 ) {
      return;
    }
    if ( Tw.ValidationHelper.containSpecial(inputValue, 1) || Tw.ValidationHelper.containNumber(inputValue, 2) ) {
      this.$nicknameError.parents('.inputbox').addClass('error');
    } else {
      this._changeNickname(inputValue);
    }
  },
  _onKeyupNickname: function () {
    var textNickname = this.$nicknameInput.val();
    var textLength = textNickname.length;
    this.$nicknameLength.html(textLength >= Tw.MAX_NICKNAME_LEN ? Tw.MAX_NICKNAME_LEN : textLength);
    if ( textLength >= Tw.MAX_NICKNAME_LEN ) {
      this.$nicknameInput.val(textNickname.slice(0, Tw.MAX_NICKNAME_LEN));
    }
    this._checkEnableConfirm(textLength);
  },
  _checkEnableConfirm: function (textLength) {
    if ( textLength > 0 ) {
      this.$nicknameConfirm.attr('disabled', false);
    } else {
      this.$nicknameConfirm.attr('disabled', true);
    }
  },
  _changeNickname: function (nickname) {
    if ( !Tw.FormatHelper.isEmpty(this._svcMgmtNum) ) {
      var params = {
        nickNm: nickname
      };
      this._apiService.request(Tw.API_CMD.BFF_03_0006, params, {}, this._svcMgmtNum)
        .done($.proxy(this._successChangeNickname, this, nickname));
    } else {
      this._isChanged = true;
      this._popupService.close();
    }
  },
  _successChangeNickname: function (nickname, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._isChanged = true;
      this._popupService.close();
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  }
};
