/**
 * FileName: common.member.logout.expire.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.19
 */

Tw.CommonMemberLogoutExpire = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;

  this._init();
};

Tw.CommonMemberLogoutExpire.prototype = {
  _init: function () {
    this._apiService.request(Tw.NODE_CMD.CHECK_SESSION, {})
      .done($.proxy(this._successCheckSession, this));
  },
  _successCheckSession: function () {
    this._apiService.sendNativeSession('');
  }
};
