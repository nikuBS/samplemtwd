/**
 * @file 나의 결합상품 < 나의 가입 정보 < MyT
 * @author 양정규
 * @since 2019.11.20
 */

Tw.MyTJoinCombinations = function (rootEl, options) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._init(options);
};

Tw.MyTJoinCombinations.prototype = {

  /**
   * @desc 초기화
   * @param options
   */
  _init: function (options) {
    this._bindEvent();
    if (options.pageId === 'tb-free') {
      new Tw.MyTJoinCombinationsTBFree(this.$container, JSON.parse(window.unescape(options.svcInfo)));
    }
  },

  /**
   * @desc 이벤트 바인딩
   */
  _bindEvent: function () {
    this.$container.on('click', '[data-url]', $.proxy(this._goLoad, this));
  },

  /**
   * @desc url 이동
   * @param e event
   */
  _goLoad: function (e) {
    this._historyService.goLoad($(e.currentTarget).data('url'));
  }

};
