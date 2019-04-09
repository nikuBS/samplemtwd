/**
 * @file product.roaming.fi.guide.js
 * @desc T로밍 > baro Box 임대
 * @author SeungKyu Kim (ksk4788@pineone.com)
 * @since 2018.11.07
 */

Tw.ProductRoamingFiGuide = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingFiGuide.prototype = {

  _cachedElement: function() {
    this.$btnInquire = this.$container.find('#inquire-btn');
    this.$btnReservation = this.$container.find('#reservation-btn');
    this.$btnProduct = this.$container.find('.product-infolink');
  },

  _bindEvent: function() {
    this.$btnInquire.on('click', $.proxy(this._goInquire, this));
    this.$btnReservation.on('click', $.proxy(this._goReservation, this));
    this.$btnProduct.on('click', $.proxy(this._goProductPage, this));
  },

  /**
   * @function
   * @desc baro Box 예약 페이지 이동
   * @private
   */
  _goReservation: function() {
    this._historyService.goLoad('/product/roaming/fi/reservation');
  },

  /**
   * @function
   * @desc baro Box 조회/취소 페이지 이동
   * @private
   */
  _goInquire: function() {
    this._historyService.goLoad('/product/roaming/fi/inquire');
  },

  /**
   * @function
   * @desc baro Box 이용 가능 요금제 상세 페이지 이동
   * @param e - event 객체
   * @private
   */
  _goProductPage: function(e) {
    //baro Box 이용 가능 요금제 상세 페이지 이동
    var productId = $(e.target).parents('button').attr('id') === undefined ? $(e.target).attr('id') : $(e.target).parents('button').attr('id');
    this._historyService.goLoad('/product/callplan?prod_id=' + productId);
  },

  _reload: function() {
    this._historyService.reload();
  }
};
