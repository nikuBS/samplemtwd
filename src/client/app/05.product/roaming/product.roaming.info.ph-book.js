/**
 * @file product.roaming.info.ph-book.js
 * @author SeungKyu Kim (ksk4788@pineone.com)
 * @since 2018.1.19
 */

Tw.ProductRoamingInfoPhBook = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingInfoPhBook.prototype = {

  _cachedElement: function() {
    this.$btnPopClose = this.$container.find('.popup-closeBtn');
  },

  _bindEvent: function() {
    this.$btnPopClose.on('click', $.proxy(this._goBack, this));
  },

  _goBack: function() {
    this._historyService.goBack();
  }
};
