/**
 * FileName: auth.line.nickname.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.12
 */
Tw.AuthLineNickname = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this.$nickNameInput = null;
  this.$nickNameGuide = null;
  this.$nickNameConfirm = null;
  this._closeCallback = null;
};

Tw.AuthLineNickname.prototype = {
  openNickname: function (svcMgmtNum, closeCallback) {
    this._closeCallback = closeCallback;
    this._popupService.openConfirm(Tw.POPUP_TITLE.CHANGE_NICKNAME, '', Tw.POPUP_TPL.CHANGE_NICKNAME,
      $.proxy(this._onOpenNickname, this), $.proxy(this._confirmNickname, this, svcMgmtNum));

  },
  _onOpenNickname: function ($popup) {
    $popup.on('keyup', '#nickname', $.proxy(this._onKeyupNickname, this));
    this.$nickNameInput = $popup.find('.inputbox');
    this.$nickNameGuide = $popup.find('.guide-txt');
    this.$nickNameConfirm = $popup.find('.tw-popup-confirm button');
    this.$nickNameConfirm.attr('disabled', true);

  },
  _confirmNickname: function (svcMgmtNum) {
    var inputValue = $('#nickname').val();
    if ( inputValue.length === 0 ) {
      return;
    }
    if ( Tw.ValidationHelper.containSpecial(inputValue, 1) || Tw.ValidationHelper.containNumber(inputValue, 2) ) {
      this.$nickNameInput.addClass('error');
      this.$nickNameGuide.addClass('error-txt');
    } else {
      this._changeNickname(inputValue, svcMgmtNum);
    }
  },
  _onKeyupNickname: function () {
    var $nickname = $('#nickname');
    var $length = $('.byte-current');
    var textLength = $nickname.val().length;
    $length.html(textLength);
    this._checkEnableConfirm(textLength);
  },
  _checkEnableConfirm: function (textLength) {
    if ( textLength > 0 ) {
      this.$nickNameConfirm.attr('disabled', false);
    } else {
      this.$nickNameConfirm.attr('disabled', true);
    }
  },
  _changeNickname: function (nickname, svcMgmtNum) {
    var params = {
      nickNm: nickname
    };
    this._apiService.request(Tw.API_CMD.BFF_03_0006, params, {}, svcMgmtNum)
      .done($.proxy(this._successChangeNickname, this, nickname))
      .fail($.proxy(this._failChangeNickname, this, nickname));
  },
  _successChangeNickname: function (nickname, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.close();
      this._closeCallback(nickname);
      this._closeCallback = null;
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _failChangeNickname: function (nickname, error) {
    console.log('popup change fail', error);
  }
};
