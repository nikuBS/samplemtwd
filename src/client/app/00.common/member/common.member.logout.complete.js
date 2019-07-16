/**
 * @file common.member.logout.complete.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.19
 */

/**
 * @class
 * @desc 공통 > 로그인/로그아웃 > 로그아웃 완료
 * @param rootEl
 * @constructor
 */
Tw.CommonMemberLogoutComplete = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;

  this._init();
};

Tw.CommonMemberLogoutComplete.prototype = {
  /**
   * @function
   * @desc Native 세션 삭제
   * @private
   */
  _init: function () {
    this._apiService.sendNativeSession('');
    Tw.CommonHelper.removeLocalStorage(Tw.LSTORE_KEY.HOME_BILL);
    Tw.CommonHelper.removeLocalStorage(Tw.LSTORE_KEY.HOME_MICRO_CONTENTS);
  }
};
