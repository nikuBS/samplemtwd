/**
 * FileName: product.current-setting.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

Tw.ProductCurrentSetting = function(rootEl) {
  this.$container = rootEl;
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductCurrentSetting.prototype = {

  _cachedElement: function() {
  },

  _bindEvent: function() {
  }

};
