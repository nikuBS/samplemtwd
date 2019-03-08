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
    this._apiService.sendNativeSession('');
    Tw.CommonHelper.removeLocalStorage(Tw.LSTORE_KEY.HOME_BILL);
    Tw.CommonHelper.removeLocalStorage(Tw.LSTORE_KEY.HOME_MICRO_CONTENTS);
  }
};
