/**
 * FileName: customer.shop.repair-detail.js (CI_03_03)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.23
 */

Tw.CustomerShopRepairDetail = function (rootEl, lon, lat) {
  this.$container = rootEl;

  this._cacheElements();
  this._showMap(lon, lat);
};

Tw.CustomerShopRepairDetail.prototype = {
  _cacheElements: function () {
    this.$tmapBox = this.$container.find('#TmapBox');
  },
  _showMap: function (longitude, latitude) {
    var map = new Tmap.Map({
      div: this.$tmapBox.attr('id'),
      width: '100%',
      height: this.$tmapBox.width() + 'px'
    });
    map.setCenter(new Tmap.LonLat(longitude, latitude).transform('EPSG:4326', 'EPSG:3857'), 15);

    var markerLayer = new Tmap.Layer.Markers();
    map.addLayer(markerLayer);
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var lonlat = new Tmap.LonLat(longitude, latitude).transform('EPSG:4326', 'EPSG:3857');
    var icon = new Tmap.Icon(Tw.TMAP.PIN, size, offset);
    var marker = new Tmap.Marker(lonlat, icon);
    markerLayer.addMarker(marker);
  }
};
