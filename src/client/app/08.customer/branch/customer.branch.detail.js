/**
 * FileName: customer.branch.detail.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerBranchDetail = function (mapEl, coord) {
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._dataChargeConfirmed = false;

  this._showDataChargePopupIfNeeded(mapEl, coord);
};

Tw.CustomerBranchDetail.prototype = {
  _showDataChargePopupIfNeeded: function (mapEl, coord) {
    if (Tw.BrowserHelper.isApp()) {
      this._popupService.openConfirm(
        Tw.POPUP_CONTENTS.NO_WIFI,
        Tw.POPUP_TITLE.EXTERNAL_LINK,
        $.proxy(function () {
          this._dataChargeConfirmed = true;
          this._popupService.close();
          this._initMap(mapEl, coord);
        }, this),
        $.proxy(function () {
          if (!this._dataChargeConfirmed) {
            this._historyService.goBack();
          }
        }, this)
      );
    } else {
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

    map.setCenter(new Tmap.LonLat(shopLon, shopLat).transform('EPSG:4326', 'EPSG:3857'), 15);

    var markerLayer = new Tmap.Layer.Markers();
    map.addLayer(markerLayer);

    var lonlat = new Tmap.LonLat(shopLon, shopLat).transform('EPSG:4326', 'EPSG:3857');
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var icon = new Tmap.Icon('/img/ico/ico-tmap-pin.png',
      size, offset);

    var marker = new Tmap.Marker(lonlat, icon);
    markerLayer.addMarker(marker);
  }
};