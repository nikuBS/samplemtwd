/**
 * FileName: common.settings.term-type-c.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.10
 */

Tw.CommonSettingsTermTypeC = function (rootEl, title) {
  this.$container = rootEl;

  this._title = title;

  this._popupService = Tw.Popup;

  this._bindEvents();
};

Tw.CommonSettingsTermTypeC.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '.bt-dropdown', $.proxy(this._onDropDownClicked, this));
    this.$container.on('click', '#fe-btn-view', $.proxy(this._onViewclicked, this));
  },
  _onDropDownClicked: function (e) {
    var selected = e.target;
    this._popupService.open({
      hbs: 'GU_02_05_L01',
        layer: true,
        title: Tw.RESELL_TERMS.title,
        data: Tw.RESELL_TERMS.data
    }, $.proxy(this._onActionSheetOpened, this, selected));
  },
  _onActionSheetOpened: function (selected, $root) {
    $root.on('click', '.fe-action', $.proxy(this._onActionSelected, this));
  },
  _onActionSelected: function () {
    this._popupService.close();
  },
  _onViewclicked: function () {
     this._popupService.open({
      hbs: 'GU_02_02_L01',
      title: this._title
    });
  }
};
