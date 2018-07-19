/**
 * FileName: auth.line.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.05
 */

Tw.AuthLine = function (rootEl, nicknamePopup) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._nicknamePopup = nicknamePopup;

  this.$inputNickname = null;
  this.$showNickname = null;

  this._bindEvent();
};

Tw.AuthLine.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.bt-nickname', $.proxy(this._openNickname, this));
    this.$container.on('click', '#cop-password', $.proxy(this._openCopPassword, this));
  },

  _openNickname: function ($event) {
    var $btNickname = $($event.currentTarget);
    var svcMgntNum = $btNickname.data('svcmgmtnum');
    var $currentLine = $btNickname.parents('.widget');

    this.$inputNickname = $currentLine.find('.input-nickname');
    this.$showNickname = $currentLine.find('.show-nickname');
    this._nicknamePopup.openNickname(svcMgntNum, $.proxy(this._onCloseNickname, this));
  },
  _onCloseNickname: function(nickname) {
    this.$inputNickname.val(nickname);
    this.$showNickname.html(nickname);
  },

  _openCopPassword: function () {
    this._popupService.open({
      hbs: 'CO_01_05_02_P01'
    }, $.proxy(this._onOpenCopPassword, this));
  },
  _onOpenCopPassword: function ($layer) {
    $layer.on('click', '.authority-bt', $.proxy(this._confirmCopPassword, this));
  },
  _confirmCopPassword: function () {
    this._popupService.close();
  }

};
