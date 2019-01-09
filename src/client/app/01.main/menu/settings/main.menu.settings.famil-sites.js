/**
 * FileName: main.menu.settings.family-sites.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.26
 */

Tw.MainMenuSettingsFamilySites = function (rootEl) {
  this.$container = rootEl;

  this._nativeService = Tw.Native;

  this._bindEvents();
};

Tw.MainMenuSettingsFamilySites.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onLink, this));
    this.$container.on('click', '.fe-link-app', $.proxy(this._onAppLink, this));
  },
  _onLink: function (e) {
    var url = $(e.currentTarget).attr('href');

    Tw.CommonHelper.showDataCharge(function () {
      Tw.CommonHelper.openUrlExternal(url);
    })
  },
  _onAppLink: function (e) {
    /*
    var appKey = 'gtwd';
    var package = 'com.sktelecom.gtwd';
    this._nativeService.send(
      Tw.NTV_CMD.IS_INSTALLED,
      {
        list: [{
          appKey: appKey,
          scheme: '',
          package: 'com.sktelecom.gtwd'
        }]
      },
      $.proxy(function (res) {
        if (res.params.list.length !== 0 && res.params.list[0][appKey]) {
          this._nativeService.send(Tw.NTV_CMD.OPEN_APP, { scheme: '', package: package });
        }
      }, this)
    );
    */
  }
};
