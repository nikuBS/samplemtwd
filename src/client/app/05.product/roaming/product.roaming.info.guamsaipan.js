/**
 * @file product.roaming.info.guamsaipan.js
 * @desc T로밍 > 로밍안내 > T괌사이판 국내처럼 (RM_19)
 * @author p026951
 * @since 2019.05.15
 */

Tw.ProductRoamingGuamSaipan = function (rootEl) {
  this.$container = rootEl;

  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);

  this._bindEvents();
};

Tw.ProductRoamingGuamSaipan.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-roaming-guamsaipan1', $.proxy(this._goLoadProduct, this, 'NA00006226'));
    this.$container.on('click', '.fe-roaming-guamsaipan2', $.proxy(this._goLoadProduct, this, 'NA00006229'));
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
  }
};
