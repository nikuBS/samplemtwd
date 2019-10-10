/**
 * @file product.roaming.info.secure-troaming.js
 * @desc T로밍 > 로밍안내 > 자동안심 T로밍이란? (RM_16_03)
 * @author Eunjung Jung
 * @since 2018.11.12
 */

Tw.ProductRoamingSecureTroaming = function (rootEl) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;

  this._bindEvents();
};

Tw.ProductRoamingSecureTroaming.prototype = {

  _bindEvents: function () {
    this.$container.on('click', '.fe-link-internal', $.proxy(this._onClickInternal, this));
    this.$container.on('click', '#fe-reaming-qanda', $.proxy(this._onShowRoamingQandA, this));

    // this.$container.on('click', '.fe-roaming-baro3gb', $.proxy(this._goLoadProduct, this, 'NA00006489'));
    // this.$container.on('click', '.fe-roaming-baro4gb', $.proxy(this._goLoadProduct, this, 'NA00006493'));
    // this.$container.on('click', '.fe-roaming-baro7gb', $.proxy(this._goLoadProduct, this, 'NA00006497'));
    // this.$container.on('click', '.fe-roaming-baroOp300', $.proxy(this._goLoadProduct, this, 'NA00003196'));
    // this.$container.on('click', '.fe-roaming-baroOp500', $.proxy(this._goLoadProduct, this, 'NA00005049'));
    // this.$container.on('click', '.fe-roaming-baroOpVip', $.proxy(this._goLoadProduct, this, 'NA00006486'));
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
   * @desc 자동안심 T로밍’에 대해 자주 하는 질문과 답변 레이어 팝업
   */
  _onShowRoamingQandA: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.open({
      hbs: 'RM_16_03_L01',// hbs의 파일명
      layer: true
    }, null, null, null, null);
  // }, $.proxy(this._openCallback, this), null, this._hbs, $(e.currentTarget));
  }


  // /**
  //  * @function
  //  * @desc 상품원장으로 이동
  //  * @param prodId
  //  * @private
  //  */
  // _goLoadProduct: function (prodId) {
  //   var reqUrl = '/product/callplan?prod_id=' + prodId;
  //   this._history.goLoad(reqUrl);
  // }
};
