/**
 * FileName: product.roaming.fi.inquire.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.12
 */

Tw.ProductRoamingFiInquire = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingFiInquire.prototype = {

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
