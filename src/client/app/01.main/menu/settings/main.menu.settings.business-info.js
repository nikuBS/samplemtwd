/**
 * FileName: main.menu.settings.business-info.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.05
 */

Tw.MainMenuSettingsBusinessInfo = function (rootEl) {
  this.$container = rootEl;

  this._nativeService = Tw.Native;

  this._bindEvents();
};

Tw.MainMenuSettingsBusinessInfo.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onLink, this));
  },
  _onLink: function (e) {
    var url = $(e.currentTarget).attr('href');
    Tw.CommonHelper.showDataCharge(function () {
      Tw.CommonHelper.openUrlExternal(url);
    });
    return false;
  }
};
