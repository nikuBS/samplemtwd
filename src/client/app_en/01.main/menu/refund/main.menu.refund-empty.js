/**
 * @file 미환급금 없을 경우 페이지에서의 처리
 * @author Hakjoon Sim
 * @since 2018-11-16
 */

/**
 * @class
 * @param  {Object} rootEl 최상위 element
 */
Tw.MainMenuRefundEmpty = function (rootEl) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();

  this._bindEvents();
};

Tw.MainMenuRefundEmpty.prototype = {
  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvents: function () {
    this.$container.on('click', '#fe-outlink-smartchoice', $.proxy(this._onOutToSmartChoice, this));
    this.$container.on('click', '#fe-confirm', $.proxy(this._onConfirm, this));
  },

  /**
   * @function
   * @desc app인 경우 과금팝업 발생 후 url로 이동
   */
  _onOutToSmartChoice: function () {
    var move = function () { Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.SMART_CHOICE); };

    if (Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.showDataCharge(function () {
        move();
      });
      return;
    }

    move();
  },

  /**
   * @function
   * @desc confirm 시 뒤로 가기
   */
  _onConfirm: function () {
    this._historyService.goBack();
  }
};