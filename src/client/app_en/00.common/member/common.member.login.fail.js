/**
 * @file common.member.login.fail.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.19
 */

/**
 * @class
 * @desc 공통 > 로그인/로그아웃 > 로그인 실패
 * @param rootEl
 * @constructor
 */
Tw.CommonMemberLoginFail = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;

  this._init();
};

Tw.CommonMemberLoginFail.prototype = {
  /**
   * @function
   * @desc Native 세션 삭제
   * @private
   */
  _init: function () {
    this._apiService.sendNativeSession('');
  }
};
