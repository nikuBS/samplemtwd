/**
 * FileName: main.menu.settings.family-sites.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.26
 */

Tw.MainMenuSettingsFamilySites = function (rootEl) {
  this.$container = rootEl;

  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;

  this._bindEvents();
};

Tw.MainMenuSettingsFamilySites.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onLink, this));
    this.$container.on('click', '.fe-link-app', $.proxy(this._onAppLink, this));
  },
  _onLink: function (e) {
    var url = $(e.currentTarget).attr('href');

    if (Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.showDataCharge(function () {
        Tw.CommonHelper.openUrlExternal(url);
      })
    } else {
      Tw.CommonHelper.openUrlExternal(url);
    }
  },
  _onAppLink: function (e) {
    var appKey = 'gtwd';
    var scheme = 'gtwdschem://';
    var schemeAndroid = scheme + 'wake';
    var package = 'com.sktelecom.gtwd';
    var iOSStore = 'https://itunes.apple.com/kr/app/t-world-global/id1281412537?l=en&mt=8';

    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(
        Tw.NTV_CMD.IS_INSTALLED,
        {
          list: [{
            appKey: appKey,
            scheme: scheme,
            package: package
          }]
        },
        $.proxy(function (res) {
          if (res.params.list.length !== 0 && res.params.list[0][appKey]) {
            this._nativeService.send(Tw.NTV_CMD.OPEN_APP, { scheme: scheme, package: package });
          } else {
            if (Tw.BrowserHelper.isAndroid()) {
              url = 'intent://scan/#Intent;package=com.sktelecom.gtwd;end';
              this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
                type: Tw.NTV_BROWSER.EXTERNAL,
                href: url
              });
            } else if (Tw.BrowserHelper.isIos()) {
              url= iOSStore;
              Tw.CommonHelper.openUrlExternal(url);
            }
          }
        }, this)
      );
    } else {
      var openMarket = function () {
        window.location.replace('intent://scan/#Intent;package=com.sktelecom.gtwd;end');
      }
      var openConfirm = $.proxy(function() {
        if (Tw.BrowserHelper.isIos()) {
          window.location.replace(iOSStore);
        } else {
          this._popupService.openConfirmButton(
            'T World Global' + Tw.POPUP_CONTENTS.APP_NOT_INSTALLED,
            ' ',
            openMarket,
            null,
            Tw.BUTTON_LABEL.NO,
            Tw.BUTTON_LABEL.YES
          );
        }
      }, this);

      setTimeout(openConfirm, 1000);
      if (Tw.BrowserHelper.isAndroid()) {
        window.location.href = schemeAndroid;
      } else {
        window.location.href = scheme;
      }
    }
  }
};
