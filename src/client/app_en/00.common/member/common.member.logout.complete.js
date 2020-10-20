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

    // 로그아웃 시 sessionStorage의 TWM 값을 초기화 한다.
    Tw.CommonHelper.removeSessionStorage(Tw.SSTORE_KEY.PRE_TWM);
    // 로그아웃 시 개인화 진입 아이콘 말풍선 활성화를 위해 PERSON_ICO_CLICKED 값을 초기화 한다.
    Tw.CommonHelper.removeSessionStorage(Tw.PERSON_ICO_CLICK_KEY);
  }
};
