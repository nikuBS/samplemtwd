/**
 * @file product.roaming.info.barocall.js
 * @desc T로밍 > 로밍안내 > baro 통화 (RM_18)
 * @author p026951
 * @since 2019.05.15
 */

Tw.ProductRoamingBaroCall = function (rootEl) {
  this.$container = rootEl;

  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);

  this._bindEvents();
};

Tw.ProductRoamingBaroCall.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-roaming-baro-Tcall', $.proxy(this._goLoadApp, this, 'TW50000002'));
  },
  /**
   * @function
   * @desc 상품원장으로 이동
   * @param prodId
   * @private
   */
  _goLoadProduct: function (prodId) {
    var reqUrl = '/product/callplan?prod_id=' + prodId;
    this._history.goLoad(reqUrl);
  },
  /**
   * @function
   * @desc T앱으로 이동
   * @param appId
   * @private
   */
  _goLoadApp: function (appId) {
    var reqUrl = '/product/apps/app?appId=' + appId;
    this._history.goLoad(reqUrl);
  }
};
