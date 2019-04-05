/**
 * 이용안내 > 이용자피해예방센터 > 이용자 피해예방 관련 사이트
 * @file customer.damage-info.related.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.25
 */

Tw.CustomerDamageInfoRelated = function(rootEl) {
  // 컨테이너 레이어 설정
  this.$container = rootEl;

  // 공통 모듈 설정
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._history = new Tw.HistoryService();

  // 이벤트 바인딩
  this._bindEvent();
};

Tw.CustomerDamageInfoRelated.prototype = {

  // 이벤트 바인딩
  _bindEvent: function() {
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));  // 외부 링크 클릭시
  },

  // 외부 링크 클릭시
  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    // 앱이 아닐땐 과금팝업이 필요 없으므로 바로 연결
    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  // 외부 링크 연결
  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  }

};