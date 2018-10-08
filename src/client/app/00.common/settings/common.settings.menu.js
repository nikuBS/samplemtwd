/**
 * FileName: common.settings.menu.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.02
 */

Tw.CommonSettingsMenu = function (rootEl) {
  if (!Tw.BrowserHelper.isApp()) {
    return;
  }

  this.$container = rootEl;

  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._currentVersion = '';

  this._cacheElements();
  this._init();
  this._bindEvents();
};

Tw.CommonSettingsMenu.prototype = {
  _cacheElements: function () {
    this.$versionText = this.$container.find('#fe-version');
    this.$updateBox = this.$container.find('#fe-update-box');
  },
  _init: function () {
    Tw.DeviceInfo.getDeviceInfo().done($.proxy(this._onDeviceVersion, this));
  },
  _bindEvents: function () {
    this.$container.on('click', '#fe-go-certificates', $.proxy(this._onCertificates, this));
  },
  _onDeviceVersion: function (res) {
    this._currentVersion = res.appVersion;
    this.$versionText.text(this._currentVersion);

    this._apiService.request(Tw.NODE_CMD.GET_VERSION, {})
      .done($.proxy(this._onLatestVersion, this));
  },
  _onLatestVersion: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var latestVersion = res.result.latestVersion;
      if (latestVersion > this._currentVersion) {
        this.$updateBox.removeClass('none');
      } else {
        this.$versionText.text(Tw.SETTINGS_MENU.LATEST + ' ' + this.$versionText.text());
      }
    }
  },
  _onCertificates: function () {
    this._nativeService.send(Tw.NTV_CMD.GO_CERT, {});
    return false;
  }
};
