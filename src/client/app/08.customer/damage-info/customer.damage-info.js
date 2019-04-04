/**
 * 이용안내 > 이용자피해예방센터 > 메인
 * @file customer.damage-info.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019.02.11
 */

Tw.CustomerDamageInfo = function(rootEl) {
  // 컨테이너 레이어 설정
  this.$container = rootEl;

  // 이벤트 바인딩
  this._bindEvent();
};

Tw.CustomerDamageInfo.prototype = {

  // 이벤트 바인딩
  _bindEvent: function() {
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));  // 외부 링크 클릭시
  },

  // 외부 링크 클릭시
  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var $elem = $(e.currentTarget),
      elemHref = $elem.attr('href');

    // 앱이 아닐땐 과금 팝업 띄울 필요 없으므로 바로 연결 & 개인정보취급방침
    if (!Tw.BrowserHelper.isApp() || $elem.hasClass('fe-no_msg')) {
      return this._openExternalUrl(elemHref);
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, elemHref));
  },

  // 외부 링크 연결
  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  }

};
