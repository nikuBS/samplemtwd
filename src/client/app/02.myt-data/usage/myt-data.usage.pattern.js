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
    // 나의 데이터 통화로
    this.$container.on('click', 'button.prev-step', $.proxy(this._historyService.goBack, /* function () {
      this._historyService.goBack// .replaceURL('/myt-data/submain');
    }, */ this));
  }
};
