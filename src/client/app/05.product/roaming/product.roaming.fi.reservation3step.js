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
    this.$btnGoInquire = this.$container.find('#fe-go-inquire');
  },

  _bindEvent: function() {
    this.$btnGoInquire.on('click', $.proxy(this._goRoamingFiInquire, this));
  },

  _goRoamingFiInquire: function() {
    this._historyService.goLoad('/product/roaming/fi/inquire');
  }

};
