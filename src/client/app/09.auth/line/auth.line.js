/**
 * FileName: auth.line.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.05
 */

Tw.AuthLine = function (rootEl) {
  this.$container = rootEl;
  this.$document = $(document);
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._bindEvent();
};

Tw.AuthLine.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.bt-link-tx', $.proxy(this._openNickname, this));
  },
  _openNickname: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CHANGE_NICKNAME, '', Tw.POPUP_TPL.CHANGE_NICKNAME, $.proxy(this._confirmNickname, this));
    this.$document.on('keyup', '#nickname', $.proxy(this._onKeyupNickname, this));

  },
  _confirmNickname: function () {
    var inputValue = $('#nickname').val();
    if ( inputValue.length === 0 ) {
      return;
    }
    if ( Tw.ValidationHelper.containSpecial(inputValue, 1) || Tw.ValidationHelper.containNumber(inputValue, 2) ) {
      // show guide text
    } else {
      this._apiService.request(Tw.API_CMD.BFF_03_0006, {}, {}, inputValue)
        .done($.proxy(this._successChangeNickname, this))
        .fail($.proxy(this._failChangeNickname, this));
      this._popupService.close();
    }
  },
  _onKeyupNickname: function () {
    var $nickname = $('#nickname');
    var $length = $('.byte-current');
    $length.html($nickname.val().length);
  },
  _successChangeNickname: function () {

  },
  _failChangeNickname: function () {

  }
};
