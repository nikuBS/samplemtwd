/**
 * @file common.member.init.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.19
 */

/**
 * @class
 * @desc Native Session 전달
 * @param rootEl
 * @constructor
 */
Tw.CommonMemberInit = function (rootEl) {
  this.$container = rootEl;

  this._nativeService = new Tw.NativeService();
  this._init();
};

Tw.CommonMemberInit.prototype = {
  /**
   * @function
   * @desc 세션 전달
   * @private
   */
  _init: function () {
    this._nativeService.sendInitSession(Tw.NTV_CMD.SESSION, {
      serverSession: Tw.CommonHelper.getCookie('TWM'),
      expired: Tw.SESSION_EXPIRE_TIME,
      loginType: 'N'
    });
  }
};
