/**
 * FileName: common.settings.location.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.11
 */

Tw.CommonSettingsLocation = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cacheElements();
  this._bindEvents();
};

Tw.CommonSettingsLocation.prototype = {
  _cacheElements: function () {
    this.$term = this.$container.find('input');
  },
  _bindEvents: function () {
    this.$term.on('change', $.proxy(this._onTermChanged, this));
    this.$container.on('click', 'a', $.proxy(this._onLink, this));
  },
  _onTermChanged: function (e) {
    var data = {
      twdLocUseAgreeYn: e.target.checked ? 'Y' : 'N'
    };

    this._apiService.request(Tw.API_CMD.BFF_03_0022, data)
      .done($.proxy(function (res) {
        if (res.code !== Tw.API_CODE.CODE_00) {
          this._onTermFail(res);
        }
      }, this))
      .fail($.proxy(this._onTermFail, this));
  },
  _onTermFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
    var checked = !!this.$term.attr('checked');
    this.$term.attr('checked', !checked);
    if (checked) {
      this.$term.closest('div').removeClass('checked').attr('aria-checked', !checked);
    } else {
      this.$term.closest('div').addClass('checked').attr('aria-checked', !checked);
    }
  },
  _onLink: function (e) {
    if (!Tw.BrowserHelper.isApp()) {
      return;
    }

    return false;
  }
};
