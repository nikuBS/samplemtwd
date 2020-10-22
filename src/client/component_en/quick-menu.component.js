/**
 * @file quick-menu.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.25
 */

/**
 * @class
 * @desc 공통 > 바로가기
 * @constructor
 */
Tw.QuickMenuComponent = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._menuId = '';
  this._bindEvent();
};
Tw.QuickMenuComponent.prototype = {
  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$btQuickAdd = $('.fe-bt-quick-add');
    this.$btQuickRemove = $('.fe-bt-quick-remove');
    this.$btQuickDisable = $('.fe-bt-quick-disable');
    if ( this.$btQuickAdd.length > 0 ) {
      this._menuId = this.$btQuickAdd.data('menuid');
      this.$btQuickAdd.on('click', _.debounce($.proxy(this._onClickRemoveQuickMenu, this), 500));
      this.$btQuickRemove.on('click', _.debounce($.proxy(this._onClickAddQuickMenu, this), 500));
      this._init();
    }
  },

  /**
   * @function
   * @desc 초기화
   * @private
   */
  _init: function () {
    this._getAllMenu();
  },

  /**
   * @function
   * @desc 전체 메뉴 요청
   * @private
   */
  _getAllMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_MENU, {})
      .done($.proxy(this._successMenu, this))
      .fail($.proxy(this._failMenu, this));
  },

  /**
   * @function
   * @desc 전체 메뉴 응답 처리
   * @param resp
   * @private
   */
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

  /**
   * @function
   * @desc 전체 메뉴 요청 실패 처리
   * @param error
   * @private
   */
  _failMenu: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 등록된 바로가기 메뉴 요청
   * @private
   */
  _getQuickMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU, {})
      .done($.proxy(this._successQuickMenu, this))
      .fail($.proxy(this._failQuickMenu, this));
  },

  /**
   * @function
   * @desc 바로가기 메뉴 응답 처리
   * @param resp
   * @private
   */
  _successQuickMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var menuIdStr = resp.result.menuIdStr.trim();
      if ( menuIdStr.indexOf(this._menuId) !== -1 ) {
        this.$btQuickDisable.addClass('none');
        this.$btQuickDisable.attr('aria-hidden', true);
        this._showAddBadge();
      } else {
        this.$btQuickDisable.addClass('none');
        this.$btQuickDisable.attr('aria-hidden', true);
        this._showRemoveBadge();
      }
    }
  },

  /**
   * @function
   * @desc 바로가기 메뉴 요청 실패 처리
   * @param error
   * @private
   */
  _failQuickMenu: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 바로가기 추가 버튼 click event 처리
   * @private
   */
  _onClickAddQuickMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU, {})
      .done($.proxy(this._addQuickMenu, this))
      .fail($.proxy(this._failQuickMenu));
  },

  /**
   * @function
   * @desc 바로가기 제거 버튼 click event 처리
   * @private
   */
  _onClickRemoveQuickMenu: function () {
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU, {})
      .done($.proxy(this._removeQuickMenu, this))
      .fail($.proxy(this._failQuickMenu));
  },

  /**
   * @function
   * @desc 바로가기 추가 요청
   * @param resp
   * @private
   */
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

  /**
   * @function
   * @desc 바로가기 제거 요청
   * @param resp
   * @private
   */
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

  /**
   * @function
   * @desc 바로가기 추가 응답 처리
   * @param resp
   * @private
   */
  _successAddQuickMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.toast(Tw.TOAST_TEXT.QUICK_ADD);
      this._hideRemoveBadge();
      this._showAddBadge();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 바로가기 추가 요청 실패 처리
   * @param error
   * @private
   */
  _failAddQuickMenu: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 바로가기 제거 응답 처리
   * @param menuId
   * @param resp
   * @private
   */
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

  /**
   * @function
   * @desc 바로가기 제거 요청 실패 처리
   * @param error
   * @private
   */
  _failRemoveQuickMenu: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 바로라기 추가 아이콘 나타냄
   * @private
   */
  _showAddBadge: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this.$btQuickAdd.removeClass('none');
      this.$btQuickAdd.attr('aria-hidden', false);
    } else {
      this.$btQuickAdd.parent().removeClass('none');
      this.$btQuickAdd.parent().attr('aria-hidden', false);
    }
  },

  /**
   * @function
   * @desc 바로가기 제거 아이콘 나타냄
   * @private
   */
  _showRemoveBadge: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this.$btQuickRemove.removeClass('none');
      this.$btQuickRemove.attr('aria-hidden', false);
    } else {
      this.$btQuickRemove.parent().removeClass('none');
      this.$btQuickRemove.parent().attr('aria-hidden', false);
    }
  },

  /**
   * @function
   * @desc 바로가기 추가 아이콘 숨김
   * @private
   */
  _hideAddBadge: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this.$btQuickAdd.addClass('none');
      this.$btQuickAdd.attr('aria-hidden', true);
    } else {
      this.$btQuickAdd.parent().addClass('none');
      this.$btQuickAdd.parent().attr('aria-hidden', true);
    }
  },

  /**
   * @function
   * @desc 바로가기 제거 아이콘 숨김
   * @private
   */
  _hideRemoveBadge: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this.$btQuickRemove.addClass('none');
      this.$btQuickRemove.attr('aria-hidden', true);
    } else {
      this.$btQuickRemove.parent().addClass('none');
      this.$btQuickRemove.parent().attr('aria-hidden', true);
    }
  }

};
