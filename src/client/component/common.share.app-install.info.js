/**
 * FileName: common.share.app-install.info.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.30
 */

Tw.CommonShareAppInstallInfo = function (rootEl, target, loginType) {
  this.$container = rootEl;
  this._target = target || '/main/home';
  this._loginType = loginType || 'N';

  this._popupService = Tw.Popup;

  this._isAndroid = Tw.BrowserHelper.isAndroid();
  this._isIos = Tw.BrowserHelper.isIos();
  this._isLink = false;

  this._bindEvent();
};

Tw.CommonShareAppInstallInfo.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.fe-link', $.proxy(this._goLoad, this));
    this.$container.on('click', '.fe-tworld', $.proxy(this._onClickTworld, this));
  },
  _goLoad: function (event) {
    var $target = $(event.currentTarget);
    Tw.CommonHelper.openUrlExternal($target.attr('data-link'));
  },
  _onClickTworld: function () {
    var appCustomScheme = 'mtworldapp2://tworld?' + encodeURIComponent('target=' + this._target + '&loginType=' + this._loginType);

    if (this._isAndroid) {
      setTimeout($.proxy(this._checkStoreForAndroid, this), 1000);
    }

    if (this._isIos) {
      setTimeout($.proxy(this._checkStoreForIos, this), 1000);
    }

    setTimeout($.proxy(this._goApp, this, appCustomScheme), 0);
  },
  _checkStoreForAndroid: function () {
    if (!document.webkitHidden) {
      this._openHbs();
    }
  },
  _checkStoreForIos: function () {
    if (!document.webkitHidden) {
      this._href = Tw.OUTLINK.APP_STORE;
      this._goStore(true);
    }
  },
  _goApp: function (appCustomScheme) {
    window.location.href = appCustomScheme;
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
    $layer.find('img').each($.proxy(this._setCdn, this));
    $layer.on('click', 'li', $.proxy(this._setStoreUrl, this));
    $layer.on('click', '.fe-close', $.proxy(this._onlyClose, this));
  },
  _setCdn: function (idx, target) {
    var $img = $(target);
    var src = Tw.Environment.cdn + $img.attr('src');
    $img.attr('src', src);
  },
  _setStoreUrl: function (event) {
    var $target = $(event.currentTarget);
    var $id = $target.find('button').attr('id').toString().toUpperCase();

    this._href = Tw.OUTLINK[$id + '_STORE'];
    this._isLink = true;

    this._popupService.close();
  },
  _onlyClose: function () {
    this._isLink = false;
  },
  _goStore: function (isLink) {
    if (isLink || this._isLink) {
      Tw.CommonHelper.openUrlExternal(this._href);
    }
  }
};