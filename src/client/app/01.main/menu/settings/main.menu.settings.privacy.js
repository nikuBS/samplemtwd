/**
 * @file 개인정보 처리방침 페이지 관련 처리
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.10.04
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 */
Tw.MainMenuSettingsPrivacy = function (rootEl) {
  if (!Tw.BrowserHelper.isApp()) { // App 인 경우에만
    return;
  }

  this.$container = rootEl;

  this._nativeService = Tw.Native;

  this._bindEvents();
};

Tw.MainMenuSettingsPrivacy.prototype = {
  _bindEvents: function () {
    this.$container.on('click', 'a', $.proxy(this._onLink, this));
  },

  /**
   * @function
   * @desc 외부 브라우저로 link 열기
   * @param  {Object} e - click event
   */
  _onLink: function (e) {
    this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
      type: Tw.NTV_BROWSER.EXTERNAL,
      href: e.currentTarget.href
    });
    return false;
  }
};
