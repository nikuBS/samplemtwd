/**
 * 이용안내 > 이용자피해예방센터 > 최신 이용자 피해예방 주의보 (상세)
 * @file customer.damage-info.warning.view.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019.01.31
 */

Tw.CustomerDamageInfoWarningView = function(rootEl) {
  // 컨테이너 레이어 설정
  this.$container = rootEl;

  // 이벤트 바인딩
  this._bindEvent();
  this._init();
};

Tw.CustomerDamageInfoWarningView.prototype = {

  _init: function() {
    Tw.CommonHelper.replaceExternalLinkTarget(this.$container);
  },

  // 이벤트 바인딩
  _bindEvent: function() {
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));  // 외부 링크 클릭시
  },

  // 외부 링크 클릭시
  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    // 앱이 아닐때는 과금팝업 띄워줄 필요가 없으므로 바로 연결
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
