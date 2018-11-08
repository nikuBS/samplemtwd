/**
 * FileName: customer.branch.repair-manufacturer.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.01
 */

Tw.CustomerBranchRepairManufacturer = function (rootEl) {
  if (!Tw.BrowserHelper.isApp()) {
    return;
  }
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._bindEvents();
};

Tw.CustomerBranchRepairManufacturer.prototype = {
  _bindEvents: function () {
    this.$container.on('click', 'a[target="_blank"]', $.proxy(this._onExternalLink, this));
  },
  _onExternalLink: function (e) {
    this._popupService.openConfirm(
      Tw.POPUP_CONTENTS.NO_WIFI,
      Tw.POPUP_TITLE.EXTERNAL_LINK,
      $.proxy(function () {
        this._popupService.close();
        var url = $(e.currentTarget).attr('href');
        this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
          type: Tw.NTV_BROWSER.EXTERNAL,
          url: url
        });
      }, this)
    );

    return false;
  }
};


