/**
 * FileName: product.roaming.fi.reservation-complete.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.16
 */

Tw.ProductRoamingFiReservationComplete = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingFiReservationComplete.prototype = {

  _cachedElement: function() {
    this.$btnGoInquire = this.$container.find('#fe-go-inquire');
    this.$btnOk = this.$container.find('#fe-ok');
  },

  _bindEvent: function() {
    this.$btnGoInquire.on('click', $.proxy(this._goRoamingFiInquire, this));
    this.$btnOk.on('click', $.proxy(this._goRoamingFiInquire, this));
  },

  _goRoamingFiInquire: function() {
    this._historyService.replaceURL('/product/roaming/fi/inquire');
  }

};
