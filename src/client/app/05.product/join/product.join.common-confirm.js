/**
 * FileName: product.join.common-confirm.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.09
 */

Tw.ProductJoinCommonConfirm = function(rootEl, isPopup) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  if (isPopup) {
    this._openPop();
  } else {
    this._setContainer(rootEl);
  }
};

Tw.ProductJoinCommonConfirm.prototype = {

  _cachedElement: function() {
    this._bindEvent();
  },

  _bindEvent: function() {},

  _openPop: function() {
    this._popupService.open({}, $.proxy(this._setContainer, this), $.proxy(this._closePop, this));
  },

  _setContainer: function($container) {
    this.$container = $container;
    this._cachedElement();
  },

  _closePop: function() {}

};
