/**
 * @file Family site 화면 처리
 * @author Hakjoon Sim
 * @since 2018-11-26
 */

/**
 * @class
 * @param (Object) rootEl - 최상위 element
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

  /**
   * @function
   * @desc link 선택 시 이동, app 인 경우 과금 팝업 노출
   * @param  {Object} e click event
   */
  _onLink: function (e) {
    var url = $(e.currentTarget).attr('href');

    if (Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.showDataCharge(function () {
        Tw.CommonHelper.openUrlExternal(url);
      });
    } else {
      Tw.CommonHelper.openUrlExternal(url);
    }
  },

  /**
   * @function
   * @desc Android/iOS 각각 마켓으로 이동
   */
  _onAppLink: function () {
    var appKey = 'gtwd';
    var scheme = 'gtwdschem://';
    var schemeAndroid = scheme + 'wake';
    var packageName = 'com.sktelecom.gtwd';
    var iOSStore = 'https://itunes.apple.com/kr/app/t-world-global/id1281412537?l=en&mt=8';
    var url = '';

    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(
        Tw.NTV_CMD.IS_INSTALLED,
        {
          list: [{
            appKey: appKey,
            scheme: scheme,
            'package': packageName
          }]
        },
        $.proxy(function (res) {
          if (res.params.list.length !== 0 && res.params.list[0][appKey]) {
            this._nativeService.send(Tw.NTV_CMD.OPEN_APP, { scheme: scheme, 'package': packageName });
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
      };
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
