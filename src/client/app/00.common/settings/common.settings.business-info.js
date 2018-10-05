/**
 * FileName: common.settings.business-info.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.05
 */

Tw.CommonSettingsBusinessInfo = function (rootEl) {
  if (!Tw.BrowserHelper.isApp()) {
    return;
  }

  this.$container = rootEl;

  this._nativeService = Tw.Native;

  this._bindEvents();
};

Tw.CommonSettingsBusinessInfo.prototype = {
  _bindEvents: function () {
    this.$container.on('click', 'a', $.proxy(this._onLink, this));
  },
  _onLink: function (e) {
    this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
      type: Tw.NTV_BROWSER.EXTERNAL,
      href: e.currentTarget.href
    });
    return false;
  }
};
