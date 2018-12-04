/**
 * FileName: prodcut.roaming.fi.reservation1step.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.12.04
 */

Tw.ProductRoamingFiReservation1step = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingFiReservation1step.prototype = {

  _cachedElement: function() {
    this.$btnPopupClose = this.$container.find('.popup-closeBtn');
  },

  _bindEvent: function() {
    this.$btnPopupClose.on('click', $.proxy(this._goRoamingGuide, this));
  },

  _goRoamingGuide: function() {
    this._historyService.replaceURL('/product/roaming/fi/guide');
  }

};
