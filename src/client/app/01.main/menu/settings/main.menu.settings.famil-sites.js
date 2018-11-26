/**
 * FileName: main.menu.settings.family-sites.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.26
 */

Tw.MainMenuSettingsFamilySites = function (rootEl) {
  this.$container = rootEl;

  this._bindEvents();
};

Tw.MainMenuSettingsFamilySites.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onLink, this));
  },
  _onLink: function (e) {
    var url = $(e.currentTarget).attr('href');

    if (Tw.BrowserHelper.isApp() && $(e.currentTarget).hasClass('fe-charge')) {
      Tw.CommonHelper.showDataCharge(function () {
        Tw.CommonHelper.openUrlExternal(url);
      });
    } else {
      Tw.CommonHelper.openUrlExternal(url);
    }
  }
};
