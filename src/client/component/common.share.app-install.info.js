/**
 * FileName: common.share.app-install.info.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.30
 */

Tw.CommonShareAppInstallInfo = function (rootEl, target, loginType) {
  this.$container = rootEl;
  this._target = target || '/main/home';
  this._loginType = loginType || 'T';

  this._popupService = Tw.Popup;

  this._isAndroid = Tw.BrowserHelper.isAndroid();
  this._isIos = Tw.BrowserHelper.isIos();
  this._isLink = false;

  this._bindEvent();
};

Tw.CommonShareAppInstallInfo.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.fe-tworld', $.proxy(this._onClickTworld, this));
  },
  _onClickTworld: function () {
    var appCustomScheme = 'mtworldapp2://tworld?target=' + encodeURIComponent(this._target) + '&loginType=' + this._loginType;
    setTimeout($.proxy(this._openStore, this), 500);

    window.location.href = appCustomScheme;
  },
  _openStore: function () {
    if (this._isAndroid) {
      this._openHbs();
    }

    if (this._isIos) {
      this._href = Tw.OUTLINK.APP_STORE;
      this._goStore(true);
    }
  },
  _openHbs: function () {
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet03',
      layer: true,
      data: Tw.ANDROID_STORE
    },
      $.proxy(this._onSelectStore, this),
      $.proxy(this._goStore, this)
    );
  },
  _onSelectStore: function ($layer) {
    $layer.on('click', 'li', $.proxy(this._setStoreUrl, this));
  },
  _setStoreUrl: function (event) {
    var $target = $(event.currentTarget);
    var $id = $target.find('button').attr('id').toString().toUpperCase();

    this._href = Tw.OUTLINK[$id + '_STORE'];
    this._isLink = true;

    this._popupService.close();
  },
  _goStore: function (isLink) {
    if (isLink || this._isLink) {
      window.location = this._href;
    }
  }
};