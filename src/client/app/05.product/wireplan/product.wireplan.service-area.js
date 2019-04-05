/**
 * FileName: product.wire.service-area.js
 * @author Jiyoung Jo
 * Date: 2018.11.07
 */

Tw.ProductWireServiceArea = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
};

Tw.ProductWireServiceArea.prototype = {
  _bindEvent: function() {
    this.$submitBtn.on('click', $.proxy(this._handleSearchArea, this));
    this.$container.on('click', '#fe-post', $.proxy(this._openPostcode, this));
  },

  _cachedElement: function() {
    this.$submitBtn = this.$container.find('#fe-submit');
    this.$zipBtn = this.$container.find('#fe-post');
  },

  _openPostcode: function() {
    new Tw.CommonPostcodeMain(this.$container, this.$zipBtn, $.proxy(this._handleChangeAddress, this));
  },

  _handleChangeAddress: function(result) {
    this._addr = {
      bas_addr: result.main,
      dtl_addr: result.detail,
      addr_id: result.addrId
    };

    var $addr = this.$container.find('#fe-addr');
    $addr.removeClass('none').attr('aria-hidden', false);
    $addr.find('#fe-post').text('[' + result.zip + ']');
    $addr.find('#fe-base-addr').text(result.main);
    $addr.find('#fe-detail-addr').text(result.detail);

    this.$submitBtn.removeAttr('disabled');
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
        var matches = service.match(/(.+)[\(|\s]([^\)]+)\)?$/),
          items = (matches && matches.slice(1)) || [service],
          icon = Tw.SERVICE_AREA_TYPE[items[0]];

        return {
          name: items,
          icon: icon
        };
      })
      .value();

    this._popupService.open(
      {
        hbs: 'WP_02_04_02_01',
        layer: true,
        address: resp.result.full_ADDRESS,
        services: services
      },
      $.proxy(this._handleOpenResult, this),
      $.proxy(this._handleCloseResult, this),
      'result'
    );
  },

  _handleOpenResult: function($layer) {
    $layer.on('click', '#fe-search-zip', $.proxy(this._handleResearch, this));
  },

  _handleResearch: function() {
    this._ressearch = true;
    this._popupService.close();
  },

  _handleCloseResult: function() {
    if (this._ressearch) {
      delete this._ressearch;
      this._openPostcode();
    }
  }
};
