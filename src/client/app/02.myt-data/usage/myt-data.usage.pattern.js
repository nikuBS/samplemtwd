/**
 * MenuName: 나의 데이터/통화 > 최근 사용량
 * @file myt-data.usage.pattern.js
 * @author 김한수 (keiches@sptek.co.kr, skt.p148890@partner.sk.com)
 * @since 2019.10.14
 * Summary: 실시간 잔여량 및 부가 서비스 조회
 */
Tw.MyTDataUsagePattern = function (rootEl, options) {
  this.$container = rootEl;
  this._options = options;
  this._historyService = new Tw.HistoryService();
  // NOTE: 특별히 처리할 필요가 없을 듯하여, "fe-common-back"에 맡긴다.
  this._bindEvent();
};

Tw.MyTDataUsagePattern.prototype = {
  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    // 나의 데이터/통화로 이동
    /*
    this.$container.on('click', 'button.prev-step', $.proxy(this._historyService.goBack, /!* function () {
      this._historyService.goBack// .replaceURL('/myt-data/submain');
    }, *!/ this));
    */
    // TODO: Tab을 switching하는 것은 widget(widgets.js:component_tabs)의 영역이므로, 추후 기준이 정리되면 제거되어야 함
    // NOTE: 다른 탭으로 이동 (상위 컨테이너 기준으로 이벤트를 거는 것이 좋으나, 이 경우는 오직 LI에만 필요함)
    this.$container.find('.data-used').find('.tab-linker').children('ul').on('click', 'li', $.proxy(this._onTabClicked, this));
  },
  // TODO: Tab을 switching하는 것은 widget(widgets.js:component_tabs)의 영역이므로, 추후 기준이 정리되면 제거되어야 함
  _onTabClicked: function (event) {
    // 마우스로 LI를 클릭했을 때만, 발생시키기 위해
    if (event.originalEvent && event.target.tagName === 'LI') {
      var $target = $(event.target);
      if ($target.attr('aria-selected') !== 'true') {
        $target.children('button').trigger('click');
      }
    }
  }
};
