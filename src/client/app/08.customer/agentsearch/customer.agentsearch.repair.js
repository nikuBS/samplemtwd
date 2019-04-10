/**
 * @file A/S센터 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-12-19
 */

Tw.CustomerAgentsearchRepair = function (rootEl) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;

  this._bindEvents();
};

Tw.CustomerAgentsearchRepair.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '#fe-view', $.proxy(this._onView, this));
  },

  /**
   * @function
   * @desc 유상수리 판단기준 보기 클릭 시 레이어 팝업으로 해당 내용 표시
   * @param  {Object} e - click event
   */
  _onView: function (e) {
    this._popupService.open({
      hbs: 'CS_03_01_L01'
    }, null, null, null, e);
  }
};
