/**
 * FileName: common.line.empty-register.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.02
 */

Tw.CommonLineEmptyRegister = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.CommonLineEmptyRegister.prototype = {
  _bindEvent: function() {
    this.$container.on('click', '#fe-bt-cop-password', $.proxy(this._openCopPassword, this));
  },
  _openCopPassword: function () {
    this._popupService.open({
      hbs: 'CO_01_05_02_02'
    }, null, null, 'cop-password');
  }
};