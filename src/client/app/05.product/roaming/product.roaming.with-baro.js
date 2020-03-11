/**
 * @file product.roaming.with-baro.js
 * @desc T로밍 > baro와 함께 안전하게
 * @author ByungSo Oh
 * @since 2020.03.12
 */

Tw.ProductRoamingWithBaro = function(rootEl) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;

  this._bindEvents();
};

Tw.ProductRoamingWithBaro.prototype = {

  _bindEvents: function () {
    this.$container.on('click', '.fe-link-internal', $.proxy(this._onClickInternal, this));
    this.$container.on('click', '.fe-link-external', $.proxy(this._onClickExternal, this));
  },

  /**
   * @function
   * @desc 요금제 상품 링크 버튼 클릭 핸들러
   * @param {Object} e - 이벤트 객체
   */
  _onClickInternal: function (e) {
    var url = $(e.currentTarget).data('url');
    this._historyService.goLoad(url);

    e.preventDefault();
    e.stopPropagation();
  },


  /**
   * @function
   * @desc 과금 팝업 오픈 후 외부 브라우저 랜딩 처리
   * @param $event 이베트 객체
   * @return {void}
   * @private
   */
  _onClickExternal: function ($e) {
    var url = $($e.currentTarget).data('url');

    if (Tw.FormatHelper.isEmpty(url)) {
      return;
    }

    // app 이 아니면 알러트 제외
    if (!Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.openUrlExternal(url);
    } else {
      Tw.CommonHelper.showDataCharge($.proxy(function(){
        Tw.CommonHelper.openUrlExternal(url);
      },this));
    }
  },

};
