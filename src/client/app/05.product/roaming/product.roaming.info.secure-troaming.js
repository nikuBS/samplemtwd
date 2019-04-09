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
    this.$container.on('click', '.fe-roaming-kcj', $.proxy(this._goLoadProduct, this, 'NA00005699'));
    this.$container.on('click', '.fe-roaming-asia', $.proxy(this._goLoadProduct, this, 'NA00005900'));
    this.$container.on('click', '.fe-roaming-usa', $.proxy(this._goLoadProduct, this, 'NA00006038'));
    this.$container.on('click', '.fe-roaming-europe', $.proxy(this._goLoadProduct, this, 'NA00006046'));
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
