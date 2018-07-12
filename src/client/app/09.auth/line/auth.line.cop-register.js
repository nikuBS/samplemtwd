/**
 * FileName: auth.line.cop-register.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.12
 */

Tw.AuthLineCopRegister = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this.$inputMdn = null;
  this.$inputCop = null;
  this.$inputCopNum = null;
  this.$inputNickname = null;

  this._cachedElement();
  this._bindEvent();
};

Tw.AuthLineCopRegister.prototype = {
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
    console.log('nickname');

  },
  _onClickCancel: function () {
    console.log('cancel');

  },
  _onClickRegister: function () {
    console.log('register');

  }
};
