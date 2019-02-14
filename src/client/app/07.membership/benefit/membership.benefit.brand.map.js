/**
 * FileName: membership.benefit.brand.map.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Editor: InHwan Kim (skt.P132150@partner.sk.com)
 * Date: 2018.11.06
 */

Tw.MembershipBenefitBrandMap = function (container, location, data) {

  this.$container = container;
  this.location = location;
  this.data = data;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._dataChargeConfirmed = false;

  this._render();
  this._bindEvent();
  this._init();
};

Tw.MembershipBenefitBrandMap.prototype = {

  _render: function () {
    this.$map = this.$container.find('#fe-tmap-box');
    this.$btnTmap = this.$container.find('button.t-map');
    this.$btnBenefit = this.$container.find('#btnBenefit');
    this.$btnFranchiseeList = this.$container.find('#btnFranchiseeList');
  },

  _bindEvent: function () {
    this.$btnTmap.on('click', $.proxy(this._goTmap, this));
    this.$btnBenefit.on('click', $.proxy(this._onClickBenefit, this));
    this.$btnFranchiseeList.on('click', $.proxy(this._onClickFranchiseeList, this));
  },

  _init: function () {
    this._showDataChargePopupIfNeeded(this.$map, this.location);
  },

  _showDataChargePopupIfNeeded: function (mapEl, coord) {
    if ( Tw.BrowserHelper.isApp() ) {
      setTimeout($.proxy(function() {
        this._popupService.openConfirm(Tw.POPUP_CONTENTS.NO_WIFI, Tw.POPUP_TITLE.EXTERNAL_LINK,
          $.proxy(function () {
            this._dataChargeConfirmed = true;
            this._popupService.close();
            this._initMap(mapEl, coord);
          }, this),
          $.proxy(function () {
            if ( !this._dataChargeConfirmed ) {
              this._historyService.goBack();
            }
          }, this)
        );
      }, this), 300);
    }
    else {
      this._initMap(mapEl, coord);
    }
  },
  _initMap: function (mapEl, coord) {
    var map = new Tmap.Map({
      div: mapEl[0].id,
      width: '100%',
      height: mapEl.width() + 'px'
    });

    var shopLon = coord.lon + '';
    var shopLat = coord.lat + '';

    map.setCenter(new Tmap.LonLat(shopLat, shopLon).transform('EPSG:4326', 'EPSG:3857'), 15);

    var markerLayer = new Tmap.Layer.Markers();
    map.addLayer(markerLayer);

    var lonlat = new Tmap.LonLat(shopLat, shopLon).transform('EPSG:4326', 'EPSG:3857');
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var icon = new Tmap.Icon('/img/ico/ico-tmap-pin.png', size, offset);

    var marker = new Tmap.Marker(lonlat, icon);
    markerLayer.addMarker(marker);
  },

  _onClickBenefit: function () {
    this._historyService.goLoad('/membership/benefit/brand-benefit?' + $.param(this.data));
  },

  _onClickFranchiseeList: function () {
    this._historyService.goLoad('/membership/benefit/brand/list?' + $.param(this.data));
  },

  _goTmap: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.CommonHelper.openUrlExternal('https://onesto.re/0000163382');
    }
    else {
      this._historyService.goLoad('/product/apps');
    }
  }
};
