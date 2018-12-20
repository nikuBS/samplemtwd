/**
 * FileName: common.member.init.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.19
 */

Tw.CommonMemberInit = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._init();
};

Tw.CommonMemberInit.prototype = {
  _init: function () {
    this._apiService.sendNativeSession('N');
  }
};
