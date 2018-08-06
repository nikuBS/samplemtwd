/**
 * FileName: customer.shop.repair.js (CI_03_01)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.01
 */

Tw.CustomerShopRepair = function (rootEl) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.CustomerShopRepair.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.bt-white2 > button', $.proxy(this._onCriteriaClicked, this));
  },
  _onCriteriaClicked: function () {
    this._popupService.open({ hbs: 'CI_03_01_L01' });
  }
};
