/**
 * @file 이용안내 > 공지사항 > 상세 (검색엔진 및 서브메인 등에서 진입 시)
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-02-27
 */

/**
 * @class
 * @param rootEl
 */
Tw.CustomerSvcInfoNoticeView = function(rootEl) {
  // 컨테이너 레이어 설정
  this.$container = rootEl;

  // 공통 모듈 로드
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  // 이벤트 바인딩
  this._bindEvent();

  // 최초 동작
  this._init();
};

Tw.CustomerSvcInfoNoticeView.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    Tw.CommonHelper.replaceExternalLinkTarget(this.$container);
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));  // 외부 링크 지원
  },

  /**
   * @function
   * @desc 외부 링크 클릭 시
   * @param e - 클릭 이벤트
   * @returns {*|void}
   */
  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    // 앱이 아니면 외부 링크 즉시 실행
    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  /**
   * @function
   * @desc 외부 링크 실행
   * @param href - 링크 값
   */
  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  }

};
