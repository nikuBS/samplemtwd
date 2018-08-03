/**
 * FileName: customer.shop.near.js (CI_02_05)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerShopNear = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;

  this._map = null;
  this._markerLayer1 = null;
  this._markerLayer2 = null;
  this._nearShops = null;

  this._cacheElements();
  this._bindEvents();
  this._init();
};

Tw.CustomerShopNear.prototype = {
  _cacheElements: function () {
    this.$region1 = this.$container.find('#fe-region-1');
    this.$region2 = this.$container.find('#fe-region-2');
    this.$tmapBox = this.$container.find('#TmapBox');
  },
  _bindEvents: function () {
    this.$container.on('change', '.radio', $.proxy(this._onTypeChanged, this));
  },
  _init: function () {
    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(this._onCurrentLocation, this));
    } else {
      if ('geolocation' in navigator) {
        // Only works in secure mode(Https) - for test, use localhost for url
        navigator.geolocation.getCurrentPosition($.proxy(function (location) {
          // this._onCurrentLocation({
            // longitude: location.coords.longitue,
            // latitude: location.coords.latitue
          // });
        }, this));
      }
    }
    // for test
    // this._onCurrentLocation({ lon: '126.98664959999998', lat: '37.5635968' });
    // this._onCurrentLocation({ lon: '127.117605', lat: '37.394576' });
    // this._onCurrentLocation({ lon: '128.686677', lat: '35.219317' });
    // this._onCurrentLocation({ lon: '128.471265', lat: '35.290588' });
  },
  _onTypeChanged: function (evt) {
    var type = evt.target.value;
    if (type === '0') {
      this._markerLayer1.setVisibility(true);
      this._markerLayer2.setVisibility(true);
    } else if (type === '1') {
      this._markerLayer1.setVisibility(true);
      this._markerLayer2.setVisibility(false);
    } else {
      this._markerLayer1.setVisibility(false);
      this._markerLayer2.setVisibility(true);
    }
  },
  _onCurrentLocation: function (location) {
    // init Tmap and show
    this._map = new Tmap.Map({
      div: this.$tmapBox.attr('id'),
      width: '100%',
      height: this.$tmapBox.width() + 'px'
    });
    this._map.setCenter(
      new Tmap.LonLat(location.longitue, location.latitude).transform('EPSG:4326', 'EPSG:3857'), 15);

    // Add marker for current location
    var markerLayer = new Tmap.Layer.Markers();
    this._map.addLayer(markerLayer);
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var lonlat = new Tmap.LonLat(location.longitue, location.lattitude)
      .transform('EPSG:4326', 'EPSG:3857');
    var icon = new Tmap.Icon(Tw.TMAP.COMPASS, size, offset);
    var marker = new Tmap.Marker(lonlat, icon);
    markerLayer.addMarker(marker);

    // Retrieve current region
    this._apiService.requestAjax(Tw.AJAX_CMD.GET_TMAP_REGION, {
      version: '1',
      format: 'json',
      count : '20',
      categories : 'gu_gun',
      searchType : 'COORDINATES',
      reqCoordType: 'WGS84GEO',
      reqLon: location.longitude,
      reqLat: location.lattitude,
      appKey : Tw.TMAP.APP_KEY
    }).done($.proxy(function (res) {
      var regions = res.searchRegionsInfo[0].regionInfo.description.split(' ');
      if (regions.length === 2) {
        this.$region1.text(regions[0]);
        this.$region2.text(regions[1]);
      } else if (regions.length === 3) {
        this.$region1.text(regions[0] + ' ' + regions[1]);
        this.$region2.text(regions[2]);
      }
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.status + ' ' + err.statusText);
    }, this));

    // Retrieve near shops
    this._apiService.request(Tw.API_CMD.BFF_08_0008, {
      currLocX: location.longitude, currLocY: location.latitude
    }).done($.proxy(function (res) {
      this._nearShops = res.result.regionInfoList;
      this._onNearShops();
    }, this))
    .fail($.proxy(function (err) {
      console.log(err);
    }, this));
  },
  _onNearShops: function () {  // Add near shops' markers
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));

    this._markerLayer1 = new Tmap.Layer.Markers();
    this._markerLayer2 = new Tmap.Layer.Markers();
    this._map.addLayer(this._markerLayer1);
    this._map.addLayer(this._markerLayer2);
    var shops = this._nearShops;

    for (var i = 0; i < shops.length; i++) {
      var lonlat = new Tmap.LonLat(shops[i].geoX, shops[i].geoY)
        .transform('EPSG:4326', 'EPSG:3857');
      var icon = new Tmap.Icon(Tw.TMAP.PIN, size, offset);
      var marker = new Tmap.Marker(lonlat, icon);
      if (shops[i].storeType === '1') {
        this._markerLayer1.addMarker(marker);
      } else {
        this._markerLayer2.addMarker(marker);
      }
    }
  }
};
