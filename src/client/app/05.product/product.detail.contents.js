/**
 * FileName: product.detail.content.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.09.17
 */

Tw.ProductDetailContents = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvents();
};

Tw.ProductDetailContents.prototype = {

  _cachedElement: function() {
    this.$btnClose = this.$container.find('.fe-btn_close');
  },

  _bindEvents: function() {
    this.$btnClose.on('click', $.proxy(this._close, this));
  },

  _close: function() {
    this._historyService.goBack();
  }

};
