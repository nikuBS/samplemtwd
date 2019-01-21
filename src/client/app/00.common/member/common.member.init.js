/**
 * FileName: common.member.init.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.19
 */

Tw.CommonMemberInit = function (rootEl) {
  this.$container = rootEl;

  this._nativeService = new Tw.NativeService();
  this._init();
};

Tw.CommonMemberInit.prototype = {
  _init: function () {
    this._nativeService.sendInitSession(Tw.NTV_CMD.SESSION, {
      serverSession: Tw.CommonHelper.getCookie('TWM'),
      expired: Tw.SESSION_EXPIRE_TIME,
      loginType: 'N'
    });
  }
};
