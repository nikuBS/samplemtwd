/**
 * FileName: common.member.login.exceed-fail.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.19
 */

Tw.CommonMemberLoginExceedFail = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;

  this._init();
};

Tw.CommonMemberLoginExceedFail.prototype = {
  _init: function () {
    this._apiService.sendNativeSession('');
  }
};
