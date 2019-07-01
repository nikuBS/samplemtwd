/**
 * @file product.roaming.info.secure-troaming.js
 * @desc T로밍 > 로밍안내 > 자동안심 T로밍이란? (RM_16_03)
 * @author Eunjung Jung
 * @since 2018.11.12
 */

Tw.ProductRoamingSecureTroaming = function (rootEl) {
  this.$container = rootEl;

  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);

  this._bindEvents();
};

Tw.ProductRoamingSecureTroaming.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-roaming-baro3gb', $.proxy(this._goLoadProduct, this, 'NA00006489'));
    this.$container.on('click', '.fe-roaming-baro4gb', $.proxy(this._goLoadProduct, this, 'NA00006493'));
    this.$container.on('click', '.fe-roaming-baro7gb', $.proxy(this._goLoadProduct, this, 'NA00006497'));
    this.$container.on('click', '.fe-roaming-baroOp300', $.proxy(this._goLoadProduct, this, 'NA00003196'));
    this.$container.on('click', '.fe-roaming-baroOp500', $.proxy(this._goLoadProduct, this, 'NA00005049'));
    this.$container.on('click', '.fe-roaming-baroOpVip', $.proxy(this._goLoadProduct, this, 'NA00006486'));
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
