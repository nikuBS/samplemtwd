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
    this._apiService.request(Tw.API_CMD.BFF_05_0123, {})
      .done($.proxy(this._onLoadUnavailableUsimService, this));
  },

  _cachedElement: function () {
    this.$wrap = $('.wrap');
  },

  _bindEvent: function () {
    this.$wrap.on('click', '.fe-confirm-unavailable', $.proxy(this._closePopup, this));
    this.$container.on('click', '.fe-unavailable-service', $.proxy(this._showPopupUnavailableService, this));
    this.$container.on('click', '.fe-go-bill-guide', $.proxy(this._goBillGuide, this));
  },

  _showPopupUnavailableService: function () {
    if ( !this.unAvailableServiceList || this.unAvailableServiceList.length === 0 ) {
      this._popupService.open({
        hbs: 'MY_01_01_51_L02_case',
        layer: true
      });
    } else {
      this._popupService.open({
        hbs: 'MY_01_01_51_L02',
        layer: true,
        data: { list: this.unAvailableServiceList }
      });
    }
  },

  _onLoadUnavailableUsimService: function (res) {
    if ( res.result ) {
      this.unAvailableServiceList = res.result.unavailableServiceList;
    }
  },

  _closePopup: function () {
    this._popupService.close();
  },

  _goBillGuide: function () {
    this._historyService.goLoad('/myt/bill/billguide');
  }
};