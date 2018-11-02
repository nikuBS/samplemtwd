/**
 * FileName: customer.branch.repair.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.02
 */

Tw.CustomerBranchRepair = function (rootEl) {
  if (!Tw.BrowserHelper.isApp()) {
    return;
  }

  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._bindEvents();
};

Tw.CustomerBranchRepair.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-data-charge', $.proxy(this._showDataCharge, this));
  },
  _showDataCharge: function (e) {
    if (!Tw.BrowserHelper.isApp()) {
      return true;
    }

    this._popupService.openConfirm(
      Tw.POPUP_CONTENTS.NO_WIFI,
      Tw.POPUP_TITLE.EXTERNAL_LINK,
      $.proxy(function () {
        this._popupService.close();
        var url = $(e.currentTarget).attr('href');
        this._historyService.goLoad(url);
      }, this)
    );

    return false;
  }
};
