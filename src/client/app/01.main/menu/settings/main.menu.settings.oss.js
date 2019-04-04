/**
 * @file main.menu.settings.oss.js
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2019.1.25
 */

Tw.MainMenuSettingsOss = function (rootEl) {
  if (!Tw.BrowserHelper.isApp()) {
    return;
  }

  this.$container = rootEl;

  this._bindEvents();
};

Tw.MainMenuSettingsOss.prototype = {
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
