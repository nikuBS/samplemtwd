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
  this._historyService = new Tw.HistoryService(rootEl);

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._bindEvents();
};

Tw.CustomerAgentsearchRepairManufacturer.prototype = {
  _bindEvents: function () {
    this.$container.on('click', 'a[target="_blank"]', $.proxy(this._onExternalLink, this));
    this.$container.on('click', '.fe-link-internal', $.proxy(this._openInternalUrl, this));
  },

  /**
   * @function
   * @desc 외부 링크 클릭 시 과금팝업 발생 후 동의 시 외부 브라우저로 이동
   * @param  {Object} e - click event
   */
  _onExternalLink: function (e) {
    if(Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.showDataCharge(
          $.proxy(function () {
            var url = $(e.currentTarget).attr('href');
            Tw.CommonHelper.openUrlExternal(url);
          }, this)
      );
    } else {
      var url = $(e.currentTarget).attr('href');
      Tw.CommonHelper.openUrlExternal(url);
    }

    return false;
  },


  /**
   * @desc 내부이동링크
   * @param {event} e
   */
  _openInternalUrl: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._historyService.goLoad(location.origin + $(e.currentTarget).attr('href'));
  }

};


