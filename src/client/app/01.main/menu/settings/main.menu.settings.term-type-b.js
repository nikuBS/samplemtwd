/**
 * FileName: main.menu.settings.term-type-b-btn.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.11
 */

Tw.MainMenuSettingsTermTypeB = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._bindEvents();
};

Tw.MainMenuSettingsTermTypeB.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '#fe-btn-view', $.proxy(this._onViewClicked, this));
    this.$container.on('click', '.fe-link-external', $.proxy(this._onExternalLink, this));
  },
  _onViewClicked: function (e) {
    var viewId = e.currentTarget.value;
    this._apiService.request(Tw.API_CMD.BFF_08_0059, {
      svcType: 'MM',
      serNum: viewId
    }).done($.proxy(function (res) {
      if (res.code === Tw.API_CODE.CODE_00) {
        this._popupService.open({
          hbs: 'HO_04_05_01_02_01',
          title: res.result.title,
          content: res.result.content,
          nogaps: viewId === '71' ? true : false  // '트래픽 관리 정보 공개양식' 인 경우 nogaps class 적용
        });
      } else {
        Tw.Error(res.code, res.msg).pop();
      }
    }, this)).fail(function (err) {
      Tw.Error(err.code, err.msg).pop();
    });
  },
  _onExternalLink: function (e) {
    var url = $(e.currentTarget).attr('href');
    Tw.CommonHelper.openUrlExternal(url);

    return false;
  }
};
