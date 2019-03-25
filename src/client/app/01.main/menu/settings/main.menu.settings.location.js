/**
 * FileName: main.menu.settings.location.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.11
 */

Tw.MainMenuSettingsLocation = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cacheElements();
  this._bindEvents();
};

Tw.MainMenuSettingsLocation.prototype = {
  _cacheElements: function () {
    this.$term = this.$container.find('input');
  },
  _bindEvents: function () {
    this.$term.on('change', $.proxy(this._onTermChanged, this));
    this.$container.on('click', '#fe-view', $.proxy(this._onLink, this));
  },
  _onTermChanged: function (e) {
    var data = {
      twdLocUseAgreeYn: e.target.checked ? 'Y' : 'N'
    };

    this._apiService.request(Tw.API_CMD.BFF_03_0022, data)
      .done($.proxy(function (res) {
        if (res.code !== Tw.API_CODE.CODE_00) {
          this._onTermFail(res);
        } else {
          var msg = data.twdLocUseAgreeYn === 'Y' ?
            Tw.SETTING_LOCATION.AGREE : Tw.SETTING_LOCATION.DISAGREE;
          Tw.CommonHelper.toast(msg);
        }
      }, this))
      .fail($.proxy(this._onTermFail, this));
  },
  _onTermFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
    var checked = !!this.$term.attr('checked');
    this.$term.attr('checked', !checked);
  },
  _onLink: function () {
    // Tw.CommonHelper.openUrlInApp(
      // 'http://m2.tworld.co.kr/normal.do?serviceId=S_PUSH0011&viewId=V_MEMB2005&stplTypCd=15',
      // null,
      // Tw.COMMON_STRING.TERM
  //  );
    Tw.CommonHelper.openTermLayer2(15);
  }
};
