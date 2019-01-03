/**
 * FileName: customer.svc-info.site.mcenter.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018. 12. 18
 */
Tw.CustomerSvcInfoMcenter = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._cachedElement();
  this._bindEvent();

  this._init();
};

Tw.CustomerSvcInfoMcenter.prototype = {
  _init : function() {
    
  },
  _cachedElement: function () {

  },
  _bindEvent: function () {

  }
};