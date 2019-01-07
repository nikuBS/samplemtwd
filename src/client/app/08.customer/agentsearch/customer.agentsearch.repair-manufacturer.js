/**
 * FileName: customer.agentsearch.repair-manufacturer.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.01
 */

Tw.CustomerAgentsearchRepairManufacturer = function (rootEl) {
  if (!Tw.BrowserHelper.isApp()) {
    return;
  }
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._bindEvents();
};

Tw.CustomerAgentsearchRepairManufacturer.prototype = {
  _bindEvents: function () {
    this.$container.on('click', 'a[target="_blank"]', $.proxy(this._onExternalLink, this));
  },
  _onExternalLink: function (e) {
    var confirmed = false;
    Tw.CommonHelper.showDataCharge(
      function () {
        confirmed = true;
      },
      $.proxy(function () {
        if (confirmed) {
          var url = $(e.currentTarget).attr('href');
          Tw.CommonHelper.openUrlExternal(url);
        }
      }, this)
    );

    return false;
  }
};


