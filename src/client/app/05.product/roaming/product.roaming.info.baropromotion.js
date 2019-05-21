/**
 * @file product.roaming.info.baropromotion.js
 * @desc T로밍 > 로밍안내 > baro 무료 체험 프로모션 (RM_20)
 * @author p026951
 * @since 2019.05.15
 */

Tw.ProductRoamingBaroPromotion = function (rootEl) {
  this.$container = rootEl;

  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);

  this._bindEvents();
};

Tw.ProductRoamingBaroPromotion.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-roaming-baro-3gb', $.proxy(this._goLoadProduct, this, 'NA00006489'));
    this.$container.on('click', '.fe-roaming-baro-yt4gb', $.proxy(this._goLoadProduct, this, 'NA00006491'));
    this.$container.on('click', '.fe-roaming-baro-4gb', $.proxy(this._goLoadProduct, this, 'NA00006493'));
    this.$container.on('click', '.fe-roaming-baro-yt5gb', $.proxy(this._goLoadProduct, this, 'NA00006495'));
    this.$container.on('click', '.fe-roaming-baro-7gb', $.proxy(this._goLoadProduct, this, 'NA00006497'));
    this.$container.on('click', '.fe-roaming-baro-yt8gb', $.proxy(this._goLoadProduct, this, 'NA00006499'));
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
