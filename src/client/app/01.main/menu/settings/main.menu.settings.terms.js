/**
 * FileName: main.menu.settings.terms.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.10
 */

Tw.MainMenuSettingsTerms = function (rootEl) {
  this.$container = rootEl;

  this._bindEvents();
};

Tw.MainMenuSettingsTerms.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onOutLink, this));
  },
  _onOutLink: function (e) {
    Tw.CommonHelper.openUrlExternal(e.currentTarget.value);
  }
};
