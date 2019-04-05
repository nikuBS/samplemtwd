/**
 * @file customer.agentsearch.repair-detail.js
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.11.01
 */

Tw.CustomerAgentsearchRepairDetail = function (rootEl, location) {
  this.$container = rootEl;
  this._location = location;

  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._dataChargeConfirmed = false;

  $(window).on(Tw.INIT_COMPLETE, $.proxy(function () {
    this._showDataChargePopupIfNeeded();
  }, this));
};

Tw.CustomerAgentsearchRepairDetail.prototype = {
  _showDataChargePopupIfNeeded: function () {
    if (Tw.BrowserHelper.isApp()) {
      var confirmed = false;
      Tw.CommonHelper.showDataCharge(
        $.proxy(function () {
          confirmed = true;
        }, this),
        $.proxy(function () {
          if (!confirmed) {
            this._historyService.goBack();
            return;
          }

          this._cacheElements();
          this._showMap();
        }, this)
      );
    } else {
      this._cacheElements();
      this._showMap();
    }
  },
  _cacheElements: function () {
    this.$tmapBox = this.$container.find('#fe-map-box');
  },
  _showMap: function () {
    var map = new Tmap.Map({
      div: this.$tmapBox.attr('id'),
      width: '100%',
      height: this.$tmapBox.width() + 'px',
      httpsMode: true
    });
    map.setCenter(new Tmap.LonLat(this._location.longitude, this._location.latitude)
      .transform('EPSG:4326', 'EPSG:3857'), 15);

    var markerLayer = new Tmap.Layer.Markers();
    map.addLayer(markerLayer);
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var lonlat = new Tmap.LonLat(this._location.longitude, this._location.latitude)
      .transform('EPSG:4326', 'EPSG:3857');
    var icon = new Tmap.Icon(Tw.Environment.cdn + Tw.TMAP.PIN, size, offset);
    var marker = new Tmap.Marker(lonlat, icon);
    markerLayer.addMarker(marker);
  }
};
