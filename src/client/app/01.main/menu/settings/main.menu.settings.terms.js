/**
 * @file 약관 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-10
 */

Tw.MainMenuSettingsTerms = function (rootEl) {
  this.$container = rootEl;

  this._bindEvents();
};

Tw.MainMenuSettingsTerms.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onOutLink, this));
  },

  /**
   * @function
   * @desc 링크 외브 브라우저로 열기
   * @param  {Object} e - click event
   */
  _onOutLink: function (e) {
    Tw.CommonHelper.openUrlExternal(e.currentTarget.value);
  }
};
