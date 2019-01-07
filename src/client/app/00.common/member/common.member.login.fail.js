/**
 * FileName: common.member.login.fail.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.19
 */

Tw.CommonMemberLoginFail = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;

  this._init();
};

Tw.CommonMemberLoginFail.prototype = {
  _init: function () {
    this._apiService.sendNativeSession('');
  }
};
