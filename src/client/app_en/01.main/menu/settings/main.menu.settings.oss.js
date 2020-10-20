/**
 * @file 오픈소르 라이센스 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2019.1.25
 */

/**
 * @class
 * @param {Object} rootEl - 최상위 element
 */
Tw.MainMenuSettingsOss = function (rootEl) {
  if (!Tw.BrowserHelper.isApp()) { // App 인 경우에만 JS 실행
    return;
  }

  this.$container = rootEl;

  this._bindEvents();
};

Tw.MainMenuSettingsOss.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onLink, this));
  },

  /**
   * @function
   * @desc app인 경우 과금 팝업 발생 후 link 이동
   * @param  {Object} e - click event
   */
  _onLink: function (e) {
    var url = $(e.currentTarget).attr('href');

    Tw.CommonHelper.showDataCharge(function () {
      Tw.CommonHelper.openUrlExternal(url);
    });
    return false;
  }
};
