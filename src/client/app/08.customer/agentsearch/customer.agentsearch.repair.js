/**
 * FileName: customer.agentsearch.repair.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.12.19
 */

Tw.CustomerAgentsearchRepair = function (rootEl) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;

  this._bindEvents();
};

Tw.CustomerAgentsearchRepair.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '#fe-view', $.proxy(this._onView, this));
  },
  _onView: function (e) {
    this._popupService.open({
      hbs: 'CS_03_01_L01'
    }, null, null, null, e);
  }
};
