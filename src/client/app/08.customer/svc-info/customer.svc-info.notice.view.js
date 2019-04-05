/**
 * 이용안내 > 공지사항 > 상세 (검색엔진 및 서브메인 등에서 진입 시)
 * @file customer.svc-info.notice.view.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019.02.27
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
};

Tw.CustomerSvcInfoNoticeView.prototype = {

  // 최초 동작
  _init: function() {
    Tw.CommonHelper.replaceExternalLinkTarget(this.$container);
  },

  // 이벤트 바인딩
  _bindEvent: function() {
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));  // 외부 링크 지원
  },

  // 외부 링크 클릭 시
  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    // 앱이 아니면 외부 링크 즉시 실행
    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  // 외부 링크 실행
  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  }

};
