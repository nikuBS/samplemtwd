/**
 * @file 이용안내 > 이용자피해예방센터 > 최신 이용자 피해예방 주의보 (상세)
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-01-31
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 */
Tw.CustomerDamageInfoWarningView = function(rootEl) {
  // 컨테이너 레이어 설정
  this.$container = rootEl;

  // 이벤트 바인딩
  this._bindEvent();

  // 최초 동작
  this._init();
};

Tw.CustomerDamageInfoWarningView.prototype = {

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
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));  // 외부 링크 클릭시
  },

  /**
   * @function
   * @desc 외부 링크 클릭시
   * @param e - 외부 링크 클릭 이벤트
   * @returns {*|void}
   */
  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    // 앱이 아닐때는 과금팝업 띄워줄 필요가 없으므로 바로 연결
    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  /**
   * @function
   * @desc 외부 링크 연결
   * @param href - 링크 값
   */
  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  }

};
