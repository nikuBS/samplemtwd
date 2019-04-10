/**
 * @file quick-menu.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.25
 */
Tw.QuickMenuComponent = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._menuId = '';
  this._bindEvent();
};
Tw.QuickMenuComponent.prototype = {
  _bindEvent: function () {
    this.$btQuickAdd = $('.fe-bt-quick-add');
    this.$btQuickRemove = $('.fe-bt-quick-remove');
    this.$btQuickDisable = $('.fe-bt-quick-disable');
    if ( this.$btQuickAdd.length > 0 ) {
      this._menuId = this.$btQuickAdd.data('menuid');
      this.$btQuickAdd.click(_.debounce($.proxy(this._onClickRemoveQuickMenu, this), 500));
      this.$btQuickRemove.click(_.debounce($.proxy(this._onClickAddQuickMenu, this), 500));
      this._init();
    }
  },
  _init: function () {
    // this._getQuickMenu();
    this._getAllMenu();
  },
  _getAllMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_MENU, {})
      .done($.proxy(this._successMenu, this))
      .fail($.proxy(this._failMenu, this));
  },
  _successMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var menuList = resp.result.frontMenus;
      var findMenu = _.find(menuList, $.proxy(function (menu) {
        return menu.menuId === this._menuId;
      }, this));
      if ( !Tw.FormatHelper.isEmpty(findMenu) ) {
        if ( findMenu.menuScutExpsYn === 'Y' ) {
          this._getQuickMenu();
        }
      }
    }
  },
  _failMenu: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
  _getQuickMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU, {})
      .done($.proxy(this._successQuickMenu, this))
      .fail($.proxy(this._failQuickMenu, this));
  },
  _successQuickMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var menuIdStr = resp.result.menuIdStr.trim();
      if ( menuIdStr.indexOf(this._menuId) !== -1 ) {
        this.$btQuickDisable.addClass('none');
        this._showAddBadge();
      } else {
        this.$btQuickDisable.addClass('none');
        this._showRemoveBadge();
      }
    }
  },
  _failQuickMenu: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
  _onClickAddQuickMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU, {})
      .done($.proxy(this._addQuickMenu, this))
      .fail($.proxy(this._failQuickMenu));
  },
  _onClickRemoveQuickMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU, {})
      .done($.proxy(this._removeQuickMenu, this))
      .fail($.proxy(this._failQuickMenu));
  },
  _addQuickMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var menuIdStr = resp.result.menuIdStr.trim();

      if ( menuIdStr.indexOf(this._menuId) !== -1 ) {
        return;
      }

      var menuId = menuIdStr.indexOf('|') !== -1 ? menuIdStr.replace(/\|/g, ',') + ',' + this._menuId :
        Tw.FormatHelper.isEmpty(menuIdStr) ? this._menuId : menuIdStr + ',' + this._menuId;

      if ( menuId.indexOf(',') !== -1 && menuId.split(',').length > 20 ) {
        this._popupService.openAlert(Tw.ALERT_MSG_HOME.A03);
      } else {
        this._apiService.request(Tw.API_CMD.BFF_04_0003, { menuIdStr: menuId })
          .done($.proxy(this._successAddQuickMenu, this))
          .fail($.proxy(this._failAddQuickMenu, this));
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
        .done($.proxy(this._successRemoveQuickMenu, this, menuId))
        .fail($.proxy(this._failRemoveQuickMenu, this));
    }

  },
  _successAddQuickMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.toast(Tw.TOAST_TEXT.QUICK_ADD);
      this._hideRemoveBadge();
      this._showAddBadge();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _failAddQuickMenu: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
  _successRemoveQuickMenu: function (menuId, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( Tw.FormatHelper.isEmpty(menuId) ) {
        this._popupService.openAlert(Tw.ALERT_MSG_HOME.A04);
      } else {
        Tw.CommonHelper.toast(Tw.TOAST_TEXT.QUICK_REMOVE);
      }
      this._hideAddBadge();
      this._showRemoveBadge();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _failRemoveQuickMenu: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
  _showAddBadge: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this.$btQuickAdd.removeClass('none');
    } else {
      this.$btQuickAdd.parent().removeClass('none');
    }
  },
  _showRemoveBadge: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this.$btQuickRemove.removeClass('none');
    } else {
      this.$btQuickRemove.parent().removeClass('none');
    }
  },
  _hideAddBadge: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this.$btQuickAdd.addClass('none');
    } else {
      this.$btQuickAdd.parent().addClass('none');
    }
  },
  _hideRemoveBadge: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this.$btQuickRemove.addClass('none');
    } else {
      this.$btQuickRemove.parent().addClass('none');
    }
  }

};
