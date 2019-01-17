/**
 * FileName: quick-menu.edit.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.25
 */
Tw.QuickMenuEditComponent = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._menu = null;
  this._quickList = [];
  this._callback = null;
  this._changeQuickMenu = false;
};

Tw.QuickMenuEditComponent.prototype = {
  open: function (list, callback) {
    this._quickList = list;
    this._callback = callback;
    this._init();
  },
  _openLayer: function (menuList) {
    this._popupService.open({
      hbs: 'HO_01_01_01',
      layer: true,
      data: this._mergeList(menuList, this._quickList)
    }, $.proxy(this._onOpenQuickEdit, this), $.proxy(this._onCloseQuickEdit, this));
  },
  _onOpenQuickEdit: function ($popupContainer) {
    this.$list = $popupContainer.find('.fe-input-menu');
    $popupContainer.on('click', '#fe-bt-reset', $.proxy(this._onClickReset, this));
    $popupContainer.on('click', '#fe-bt-complete', $.proxy(this._onClickComplete, this));
  },
  _onCloseQuickEdit: function () {
    if ( this._changeQuickMenu && !Tw.FormatHelper.isEmpty(this._callback) ) {
      this._callback();
    }
  },
  _onClickReset: function () {
    _.map(this.$list, $.proxy(function (checkbox) {
      var $checkbox = $(checkbox);
      var menuId = $checkbox.data('menuid');
      var quickMenu = _.find(this._quickList, $.proxy(function (quick) {
        return quick.menuId === menuId;
      }, this));
      if ( !Tw.FormatHelper.isEmpty(quickMenu) ) {
        $checkbox.prop('checked', true);
        $checkbox.parents('.fe-label-menu').attr('aria-checked', true);
      } else {
        $checkbox.prop('checked', false);
        $checkbox.parents('.fe-label-menu').attr('aria-checked', false);
      }
    }, this));
  },
  _onClickComplete: function () {
    var $selected = this.$list.filter(':checked');
    var menuIdList = [];
    _.map($selected, $.proxy(function (checkbox) {
      menuIdList.push($(checkbox).data('menuid'));
    }, this));
    this._requestSaveQuickMenu(menuIdList.join(','));
  },
  _requestSaveQuickMenu: function (menuId) {
    this._apiService.request(Tw.API_CMD.BFF_04_0003, { menuIdStr: menuId })
      .done($.proxy(this._successAddQuickMenu, this));
  },
  _successAddQuickMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._changeQuickMenu = true;
      this._popupService.close();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _init: function () {
    if ( Tw.FormatHelper.isEmpty(this._menu) ) {
      this._getMenu();
    } else {
      this._openLayer(this._menu);
    }
  },
  _getMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_MENU, {})
      .done($.proxy(this._successMenu, this));
  },
  _successMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._menu = this._parseMenu(resp.result);
      this._openLayer(this._menu);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _parseMenu: function (result) {
    var menuComponent = new Tw.MenuComponent(true);
    var parsedMenu = menuComponent.tideUpMenuInfo(result.frontMenus, result.userInfo);
    var menu = [];

    _.map(parsedMenu, $.proxy(function (target) {
      menu = menu.concat(target);
    }, this));
    return this._getShowMenu(menu, []);
  },
  _getShowMenu: function (menu, initial) {
    return _.reduce(menu, function (result, target) {
      if ( target.supMenuNmExpsYn === 'N' ) {
        if ( !Tw.FormatHelper.isEmpty(target.children) ) {
          return this._getShowMenu(target.children, result);
        } else {
          return result;
        }
      } else {
        if ( this._checkNotShow(target.menuId) ) {
          target.quickAdded = false;
          result.push(target);
        }
        return result;
      }
    }, initial, this);
  },
  _mergeList: function (menuList, quickList) {
    _.map(quickList, $.proxy(function (quick) {
      var findMenu = _.find(menuList, $.proxy(function (menu) {
        return quick.menuId === menu.menuId;
      }, this));
      if ( !Tw.FormatHelper.isEmpty(findMenu) ) {
        findMenu.quickAdded = true;
      } else {
        quick.quickAdded = true;
        menuList.push(quick);
      }
    }, this));
    return menuList;
  },
  _checkNotShow: function (menuId) {
    return !(menuId === 'M001778' || menuId === 'M000812' || menuId === 'M000537' || menuId === 'M000118' || menuId === 'M000119');
  }
};
