/**
 * @file 사업자 정보 화면 처리
 * @author Hakjoon Sim
 * @since 2018-10-05
 */

/**
 * @class
 * @param (Object) rootEl - 최상위 element
 */
Tw.MainMenuSettingsBusinessInfo = function (rootEl) {
  this.$container = rootEl;

  this._nativeService = Tw.Native;

  this._bindEvents();
};

Tw.MainMenuSettingsBusinessInfo.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onLink, this));
  },

  /**
   * @function
   * @desc 링크 선택시 이동. app인 경우 과금 팝업 발생
   * @param  {Object} e click event
   */
  _onLink: function (e) {
    var url = $(e.currentTarget).attr('href');
    if (Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.showDataCharge(function () {
        Tw.CommonHelper.openUrlExternal(url);
      });
    } else {
      Tw.CommonHelper.openUrlExternal(url);
    }
    return false;
  }
};
