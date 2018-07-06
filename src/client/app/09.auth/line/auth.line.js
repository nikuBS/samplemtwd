/**
 * FileName: auth.line.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.05
 */

Tw.AuthLine = function (rootEl) {
  this.$container = rootEl;
  this.popupService = Tw.Popup;

  this._bindEvent();
};

Tw.AuthLine.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.bt-link-tx', $.proxy(this._openNickname, this));
  },
  _openNickname: function () {
    this.popupService.openConfirm(Tw.POPUP_TITLE.CHANGE_NICKNAME, '', Tw.POPUP_TPL.CHANGE_NICKNAME, $.proxy(this._confirmNickname, this));
  },
  _confirmNickname: function() {
    Tw.Logger.log($('#nickname').val());
    this.popupService.close();
  }
};
