/**
 * FileName: common.settings.term-type-b-btn.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.11
 */

Tw.CommonSettingsTermTypeBtnB = function (rootEl, title) {
  this.$container = rootEl;

  this._title = title;

  this._popupService = Tw.Popup;

  this._bindEvents();
};

Tw.CommonSettingsTermTypeBtnB.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '#fe-btn-view', $.proxy(this._onViewClicked, this));
  },
  _onViewClicked: function () {
    this._popupService.open({
      hbs: 'GU_02_02_L01',
      title: this._title
    });
  }
};
