/**
 * FileName: myt.join.product-service.additions.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.08.14
 */

Tw.MyTJoinProductServiceAdditions = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTJoinProductServiceAdditions.prototype = {
  _init: function () {

  },

  _cachedElement: function () {
    this.$container.on('click', '.fe-unavailable-service', $.proxy(this._showPopupUnavailableService, this));
    this.$container.on('click', '.fe-go-bill-guide', $.proxy(this._goBillGuide, this));
  },

  _bindEvent: function () {

  },

  _showPopupUnavailableService: function () {

  },

  _goBillGuide: function () {
    this._historyService.goLoad('/myt/bill/billguide');
  }
};