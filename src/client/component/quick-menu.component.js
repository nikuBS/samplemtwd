/**
 * FileName: quick-menu.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.25
 */
Tw.QuickMenuComponent = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._menuId = '';
  this._bindEvent();
};
Tw.QuickMenuComponent.prototype = {
  _init: function () {
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU, {})
      .done($.proxy(this._successQuickMenu, this));
  },
  _successQuickMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var menuIdStr = resp.result.menuIdStr.trim();
      if ( menuIdStr.indexOf(this._menuId) !== -1 ) {
        this.$btQuickAdd.removeClass('none');
        this.$btQuickRemove.addClass('none');
      }
    }
  },
  _bindEvent: function () {
    this.$btQuickAdd = $('#fe-bt-quick-add');
    this.$btQuickRemove = $('#fe-bt-quick-remove');
    if ( this.$btQuickAdd.length > 0 ) {
      this._menuId = this.$btQuickAdd.data('menuid');
      this.$btQuickAdd.on('click', $.proxy(this._onClickRemoveQuickMenu, this));
      this.$btQuickRemove.on('click', $.proxy(this._onClickAddQuickMenu, this));
      this._init();
    }
  },
  _onClickAddQuickMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU, {})
      .done($.proxy(this._addQuickMenu, this));
  },
  _onClickRemoveQuickMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU, {})
      .done($.proxy(this._removeQuickMenu, this));
  },
  _addQuickMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var menuIdStr = resp.result.menuIdStr.trim();
      var menuId = menuIdStr.indexOf('|') !== -1 ? menuIdStr.replace(/\|/g, ',') + ',' + this._menuId :
        Tw.FormatHelper.isEmpty(menuIdStr) ? this._menuId : menuIdStr + ',' + this._menuId;

      if ( menuId.indexOf(',') !== -1 && menuId.split(',').length > 20 ) {
        this._popupService.openAlert(Tw.ALERT_MSG_HOME.A03);
      } else {
        this._apiService.request(Tw.API_CMD.BFF_04_0003, { menuIdStr: menuId })
          .done($.proxy(this._successAddQuickMenu, this));
      }
    }
  },
  _removeQuickMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var menuIdStr = resp.result.menuIdStr.trim();
      var menuId = '';
      if ( menuIdStr.indexOf('|') !== -1 ) {
        menuId = _.filter(menuIdStr.split('|'), $.proxy(function (menu) {
          return menu !== this._menuId;
        }, this)).join(',');
      }
      this._apiService.request(Tw.API_CMD.BFF_04_0003, { menuIdStr: menuId })
        .done($.proxy(this._successRemoveQuickMenu, this, menuId));
    }

  },
  _successAddQuickMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.toast(Tw.TOAST_TEXT.QUICK_ADD);
      this.$btQuickAdd.removeClass('none');
      this.$btQuickRemove.addClass('none');
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _successRemoveQuickMenu: function (menuId, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( Tw.FormatHelper.isEmpty(menuId) ) {
        this._popupService.openAlert(Tw.ALERT_MSG_HOME.A04);
      } else {
        Tw.CommonHelper.toast(Tw.TOAST_TEXT.QUICK_REMOVE);
      }
      this.$btQuickRemove.removeClass('none');
      this.$btQuickAdd.addClass('none');
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  }
};
