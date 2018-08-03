/**
 * FileName: customer.shop.repair-manufacturer.js (CI_03_02)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.01
 */

Tw.CustomerShopRepairManufacturer = function (rootEl) {
  this.$container = rootEl;

  this._nativeService = Tw.Native;

  this._bindEvent();
};

Tw.CustomerShopRepairManufacturer.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.store-home-link', $.proxy(this._onLinkClicked, this));
  },
  _onLinkClicked: function (evt) {
    if (!Tw.BrowserHelper.isApp()) {
      return true;
    }

    var url = evt.target.href;
    this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
      type: Tw.NTV_BROWSER.EXTERNAL,
      href: url
    });
    return false;
  }
};
