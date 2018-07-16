/**
 * FileName: auth.line.edit.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.06
 */

Tw.AuthLineEdit = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._init();
};

Tw.AuthLineEdit.prototype = {
  _init: function () {
    skt_landing.dev.sortableInit({
      axis: 'y'
    });
  }
};
