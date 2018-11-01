/**
 * FileName: customer.branch.repair-detail.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.01
 */

Tw.CustomerBranchRepairDetail = function (rootEl, location) {
  this.$container = rootEl;

  this._location = location;

  this._cacheElements();
  this._showMap();
};

Tw.CustomerBranchRepairDetail.prototype = {
  _cacheElements: function () {
    this.$tmapBox = this.$container.find('#fe-map-box');
  },
  _showMap: function () {
    var map = new Tmap.Map({
      div: this.$tmapBox.attr('id'),
      width: '100%',
      height: this.$tmapBox.width() + 'px'
    });
    map.setCenter(new Tmap.LonLat(this._location.longitude, this._location.latitude)
      .transform('EPSG:4326', 'EPSG:3857'), 15);

    var markerLayer = new Tmap.Layer.Markers();
    map.addLayer(markerLayer);
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var lonlat = new Tmap.LonLat(this._location.longitude, this._location.latitude)
      .transform('EPSG:4326', 'EPSG:3857');
    var icon = new Tmap.Icon(Tw.TMAP.PIN, size, offset);
    var marker = new Tmap.Marker(lonlat, icon);
    markerLayer.addMarker(marker);
  }
};
