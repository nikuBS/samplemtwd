/**
 * @file common.member.logout.expire.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.19
 */

/**
 * @class
 * @desc 공통 > 로그인/로그아웃 > 세션만료
 * @param rootEl
 * @constructor
 */
Tw.CommonMemberLogoutExpire = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;

  this._init();
};

Tw.CommonMemberLogoutExpire.prototype = {
  /**
   * @function
   * @desc Native 세션 삭제
   * @private
   */
  _init: function () {
    this._apiService.sendNativeSession('');
    Tw.CommonHelper.removeLocalStorage(Tw.LSTORE_KEY.HOME_BILL);
    Tw.CommonHelper.removeLocalStorage(Tw.LSTORE_KEY.HOME_MICRO_CONTENTS);

    // 로그아웃 시 sessionStorage의 TWM 값을 초기화 한다.
    Tw.CommonHelper.removeSessionStorage(Tw.SSTORE_KEY.PRE_TWM);
  }
};
