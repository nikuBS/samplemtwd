/**
 * FileName: product.join.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

Tw.ProductJoin = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductJoin.prototype = {

  _cachedElement: function() {},

  _bindEvent: function() {}

};