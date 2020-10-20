/**
 * @file common.member.login.exceed-fail.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.19
 */

/**
 * @class
 * @desc 공통 > 로그인/로그아웃 > 로그인 횟수 초과
 * @param rootEl
 * @constructor
 */
Tw.CommonMemberLoginExceedFail = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;

  this._init();
};

Tw.CommonMemberLoginExceedFail.prototype = {
  /**
   * @function
   * @desc Native 세션 삭제
   * @private
   */
  _init: function () {
    this._apiService.sendNativeSession('');
  }
};
