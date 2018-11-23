/**
 * FileName: product.wire.service-area.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.07
 */

Tw.ProductWireServiceArea = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._cachedElement();
  this._bindEvent();
};

Tw.ProductWireServiceArea.prototype = {
  _bindEvent: function() {
    this.$submitBtn.on('click', $.proxy(this._handleSearchArea, this));
    this.$container.on('click', '#fe-reservation', $.proxy(this._openProductType, this));
    this.$container.on('click', '#fe-post', $.proxy(this._openPostcode, this));
  },

  _cachedElement: function() {
    this.$submitBtn = this.$container.find('#fe-submit');
  },

  _handleSearchArea: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0048, this._addr).done($.proxy(this._handleSuccessSearchArea, this));
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
      undefined,
      undefined,
      'result'
    );
  },

  _openPostcode: function() {
    new Tw.CommonPostcodeMain(this.$container, $.proxy(this._handleChangeAddress, this));
  },

  _handleChangeAddress: function(result) {
    this._addr = {
      bas_addr: result.main,
      dtl_addr: result.detail,
      addr_id: result.addrId
    };
    this.$submitBtn.removeAttr('disabled');
  },

  _openProductType: function() {
    this._popupService.open(
      {
        hbs: 'actionsheet_select_a_type',
        layer: true,
        data: [{ list: Tw.PRODUCT_JOIN_TYPE }],
        title: ''
      },
      $.proxy(this._handleOpenProductType, this),
      $.proxy(this._closeProductType, this)
    );
  },

  _handleOpenProductType: function($layer) {
    $layer.on('click', 'li > button', $.proxy(this._goToReservation, this));
  },

  _goToReservation: function(e) {
    this._typeCode = e.currentTarget.getAttribute('data-type-code');
    this._popupService.close();
  },

  _closeProductType: function() {
    if (this._typeCode) {
      this._historyService.goLoad('/product/wireplan/join/reservation?type_cd=' + this._typeCode);
    }
  }
};
