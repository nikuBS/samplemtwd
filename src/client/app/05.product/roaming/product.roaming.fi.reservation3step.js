/**
 * FileName: product.roaming.fi.reservation3step.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.16
 */

Tw.ProductRoamingFiReservation3step = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingFiReservation3step.prototype = {

  _cachedElement: function() {
    this.$btnPopupClose = this.$container.find('.popup-closeBtn');
  },

  _bindEvent: function() {
    this.$btnPopupClose.on('click', $.proxy(this._goRoamingGuide, this));
  },

  _goRoamingGuide: function() {
    this._historyService.replaceURL('/product/roaming/fi/guide');
  },

  _reload: function() {
    this._historyService.reload();
  }

};
