/**
 * FileName: main.menu.settings.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.02
 */

Tw.MainMenuSettings = function (rootEl) {
  if (!Tw.BrowserHelper.isApp()) {
    return;
  }

  this.$container = rootEl;
  this._osType = 'I'; // default iOS,  'A': aos


  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._currentVersion = '';

  this._cacheElements();
  this._init();
  this._bindEvents();
};

Tw.MainMenuSettings.prototype = {
  _cacheElements: function () {
    this.$versionText = this.$container.find('#fe-version');
    this.$updateBox = this.$container.find('#fe-update-box');
  },
  _init: function () {
    this._setVersionInfo();
    // Set FIDO type
    this._nativeService.send(Tw.NTV_CMD.FIDO_TYPE, {}, $.proxy(function (resp) {
      if (resp.resultCode === Tw.NTV_CODE.CODE_00) {
        this.$container.find('#fe-bio-link').attr('href', '/main/menu/settings/biometrics?target=finger');
      } else if (resp.resultCode === Tw.NTV_CODE.CODE_01) {
        this.$container.find('#fe-bio-link').attr('href', '/main/menu/settings/biometrics?target=face');
      } else {
        this.$container.find('#fe-bio').addClass('none');
      }
    }, this));
  },
  _bindEvents: function () {
    this.$container.on('click', '#fe-go-certificates', $.proxy(this._onCertificates, this));
    this.$container.on('click', '#fe-btn-update', $.proxy(this._onUpdate, this));
  },
  _setVersionInfo: function () {
    var userAgentString = Tw.BrowserHelper.getUserAgent();
    var version = userAgentString.match(/\|appVersion:([\.0-9]*)\|/)[1];
    this.$versionText.text(version);
    this._currentVersion = version;

    if (userAgentString.indexOf('osType:aos') !== -1) {
      this._osType = 'A';
    }

    this._apiService.request(Tw.NODE_CMD.GET_VERSION, {})
      .done($.proxy(this._onLatestVersion, this));
  },
  _onLatestVersion: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var currentOsType = this._osType;
      var versionInfo = _.filter(res.result.ver, function (item) {
        return item.osType === currentOsType;
      });
      var latestVersion = versionInfo[0].newVer;
      if (latestVersion > this._currentVersion) {
        this.$updateBox.removeClass('none');
        this.$versionText.removeClass('point');
      } else {
        this.$versionText.text(Tw.SETTINGS_MENU.LATEST + ' ' + this.$versionText.text());
      }
    }
  },
  _onUpdate: function () {
    var url = '';
    if (Tw.BrowserHelper.isAndroid()) {
      url = 'intent://scan/#Intent;package=com.sktelecom.minit;end';
    } else if (Tw.BrowserHelper.isIos()) {
      url = 'https://itunes.apple.com/kr/app/%EB%AA%A8%EB%B0%94%EC%9D%BCtworld/id428872117?mt=8';
    }

    if (!Tw.FormatHelper.isEmpty(url)) {
      this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
        type: Tw.NTV_BROWSER.EXTERNAL,
        href: url
      });
    }
  },
  _onCertificates: function () {
    this._nativeService.send(Tw.NTV_CMD.GO_CERT, {});
    return false;
  }
};
