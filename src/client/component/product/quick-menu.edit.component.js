/**
 * FileName: quick-menu.edit.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.25
 */
Tw.QuickMenuEditComponent = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._menu = null;
};

Tw.QuickMenuEditComponent.prototype = {
  open: function () {
    this._init();
    this._popupService.open({
      hbs: 'HO_01_01_01',
      layer: true
    }, $.proxy(this._onOpenQuickEdit, this), $.proxy(this._onCloseQuickEdit, this));
  },
  _onOpenQuickEdit: function ($popupContainer) {

  },
  _onCloseQuickEdit: function () {

  },
  _init: function () {
    if ( Tw.FormatHelper.isEmpty(this._menu) ) {
      this._getMenu();
    }
  },
  _getMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_MENU, {})
      .done($.proxy(this._successMenu, this));
  },
  _successMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._menu = this._parseMenu(resp.result);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _parseMenu: function (result) {
  }
};
