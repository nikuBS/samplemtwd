/**
 * FileName: main.menu.settings.terms.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.10
 */

Tw.MainMenuSettingsTerms = function (rootEl) {
  this.$container = rootEl;

  this._init();
  this._bindEvents();
};

Tw.MainMenuSettingsTerms.prototype = {
  _init: function () {
    if (window.location.hash === '#tworld') {
      var tab = this.$container.find('#fe-tworld-sk').eq(0);
      setTimeout(function () {
        tab.click();
      }, 0);
    }
  },
  _bindEvents: function () {
    this.$container.on('click', 'a', $.proxy(this._onLink, this));
  },
  _onLink: function (e) {

  }
};
