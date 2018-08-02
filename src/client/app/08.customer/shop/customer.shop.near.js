/**
 * FileName: customer.shop.near.js (CI_02_05)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerShopNear = function (rootEl) {
  this.$container = rootEl;

  this._nativeService = Tw.Native;

  this._init();
};

Tw.CustomerShopNear.prototype = {
  _init: function () {
    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(this._onLocation, this));
    } else {
      if ('geolocation' in navigator) {
        // Only works in secure mode(Https) - for test, use localhost for url
        navigator.geolocation.getCurrentPosition(
          $.proxy(function (location) {
            // Check api receives if WGS84 or KATECH or etc.
            this._onLocation(location);
          }), this);
      }
    }
  },
  _onLocation: function (location) {
    // requets tmap and show the map
  }
};
