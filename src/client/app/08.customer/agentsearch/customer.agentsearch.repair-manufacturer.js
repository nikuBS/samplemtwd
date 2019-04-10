/**
 * @file 제조사 수리센터 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-11-01
 */

/**
 * @function
 * @param  {Object} rootEl - 최상위 elem
 */
Tw.CustomerAgentsearchRepairManufacturer = function (rootEl) {
  if (!Tw.BrowserHelper.isApp()) {
    return;
  }
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._bindEvents();
};

Tw.CustomerAgentsearchRepairManufacturer.prototype = {
  _bindEvents: function () {
    this.$container.on('click', 'a[target="_blank"]', $.proxy(this._onExternalLink, this));
  },

  /**
   * @function
   * @desc 외부 링크 클릭 시 과금팝업 발생 후 동의 시 외부 브라우저로 이동
   * @param  {Object} e - click event
   */
  _onExternalLink: function (e) {
    var confirmed = false;
    Tw.CommonHelper.showDataCharge(
      function () {
        confirmed = true;
      },
      $.proxy(function () {
        if (confirmed) {
          var url = $(e.currentTarget).attr('href');
          Tw.CommonHelper.openUrlExternal(url);
        }
      }, this)
    );

    return false;
  }
};


