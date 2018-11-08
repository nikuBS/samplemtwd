/**
 * FileName: product.wire.service-area.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.07
 */

Tw.ProductWireServiceArea = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.ProductWireServiceArea.prototype = {
  _bindEvent: function() {
    this.$container.on('click', '.bt-red1', $.proxy(this._handleSearchArea, this));
  },

  _handleSearchArea: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0048, { addr_id: '100000004070867' }).done($.proxy(this._handleSuccessSearchArea, this)); // TODO: API 확인 필요, 우편번호 추가 후 addr_id 수정 필요
  },

  _handleSuccessSearchArea: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var services = resp.result.useaddress_INFO;

    services = _.chain(services)
      .filter(function(service) {
        return !!service;
      })
      .map(function(service) {
        var matches = service.match(/(.+)[\(|\s]([^\)]+)\)?$/);
        return (matches && matches.slice(1)) || [service];
      })
      .value();

    this._popupService.open(
      {
        hbs: 'WP_02_04_02_01',
        layer: true,
        address: resp.result.full_ADDRESS,
        services: services
      },
      $.proxy(this._handleOpenSearchArea, this),
      undefined,
      'result'
    );
  },

  _handleOpenSearchArea: function($layer) {
    $layer.on('click', '.fe-search', $.proxy(this._closePopup, this));
  },

  _closePopup: function() {
    this._popupService.close();
  }
};
