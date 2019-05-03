/**
 * @file quick-menu.edit.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.25
 */

/**
 * @class
 * @desc 공통 > 바로가기 편집
 * @constructor
 */
Tw.QuickMenuEditComponent = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._menu = null;
  this._quickList = [];
  this._callback = null;
  this._changeQuickMenu = false;
  this._changedList = false;
  this._popupClose = false;
};

Tw.QuickMenuEditComponent.prototype = {
  /**
   * @function
   * @desc 바로가기 편집 레이어 요청
   * @param list
   * @param callback
   * @param $target
   */
  open: function (list, callback, $target) {
    this._quickList = list;
    this._callback = callback;
    this._init($target);
  },

  /**
   * @function
   * @desc 바로가기 편집 팝업 오픈
   * @param menuList
   * @param $target
   * @private
   */
  _openLayer: function (menuList, $target) {
    this._popupService.open({
      hbs: 'HO_01_01_01',
      layer: true,
      data: this._mergeList(menuList, this._quickList)
    }, $.proxy(this._onOpenQuickEdit, this), $.proxy(this._onCloseQuickEdit, this), 'quick-edit', $target);
  },
  /**
   * @function
   * @desc 바로가기 편집 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenQuickEdit: function ($popupContainer) {
    this.$list = $popupContainer.find('.fe-input-menu');
    $popupContainer.on('click', '#fe-bt-reset', $.proxy(this._onClickReset, this));
    $popupContainer.on('click', '#fe-bt-complete', $.proxy(this._onClickComplete, this));
    $popupContainer.on('click', '#fe-bt-close', $.proxy(this._onClickClose, this));

    this.$list.on('click', $.proxy(this._onClickList, this));
  },

  /**
   * @function
   * @desc 바로가기 편집 팝업 클로즈 콜백
   * @private
   */
  _onCloseQuickEdit: function () {
    if ( this._changeQuickMenu && !Tw.FormatHelper.isEmpty(this._callback) ) {
      this._callback();
    }
  },

  /**
   * @function
   * @desc 초기화 버튼 click event 처리
   * @private
   */
  _onClickReset: function () {
    this._popupService.openConfirm(Tw.ALERT_MSG_HOME.A02, null, $.proxy(this._resetQuickMenu, this));
  },

  /**
   * @function
   * @desc 바로가기 디폴트 메뉴 요청
   */
  _resetQuickMenu: function () {
    this._popupService.close();
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU_DEFAULT, {})
      .done($.proxy(this._successQuickMenuDefault, this))
      .done($.proxy(this._failQuickMenuDefault, this));
  },

  /**
   * @function
   * @desc 바로가기 디폴트 메뉴 응답 처리
   * @param resp
   * @private
   */
  _successQuickMenuDefault: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var menuIdStr = resp.result.menuIdStr;
      var defaultList = Tw.FormatHelper.isEmpty(menuIdStr) || menuIdStr === 'null' || menuIdStr === ' ' ? [] :
        menuIdStr.indexOf('|') !== -1 ? menuIdStr.split('|') : [menuIdStr.trim()];
      this.$list.prop('checked', false);
      this.$list.parents('.fe-label-menu').attr('aria-checked', false);
      _.map(this.$list, $.proxy(function (checkbox) {
        var $checkbox = $(checkbox);
        var menuId = $checkbox.data('menuid');
        if ( defaultList.indexOf(menuId) !== -1 ) {
          $checkbox.prop('checked', true);
          $checkbox.parents('.fe-label-menu').attr('aria-checked', true);
        }
      }, this));
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 바로가기 디폴트 메뉴 요청 실패 처리
   * @param error
   * @private
   */
  _failQuickMenuDefault: function(error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 바로가기 메뉴 저장가기 버튼 click event 처리
   * @private
   */
  _onClickComplete: function () {
    var $selected = this.$list.filter(':checked');
    var menuIdList = [];
    _.map($selected, $.proxy(function (checkbox) {
      menuIdList.push($(checkbox).data('menuid'));
    }, this));
    this._requestSaveQuickMenu(menuIdList.join(','));
  },

  /**
   * @function
   * @desc 닫기 버튼 click event 처리
   */
  _onClickClose: function () {
    if ( this._changedList ) {
      this._popupService.openConfirm(Tw.ALERT_MSG_HOME.A01, null, $.proxy(this._confirmClose, this), $.proxy(this._onCloseConfirm, this));
    } else {
      this._closeQuickEdit();
    }
  },

  /**
   * @function
   * @desc 바로가기 닫기 확인 팝업 확인 버튼 click event 처리
   * @private
   */
  _confirmClose: function () {
    this._popupClose = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 바로가기 닫기 확인 팝업 클로즈 콜백
   * @private
   */
  _onCloseConfirm: function () {
    if ( this._popupClose ) {
      this._closeQuickEdit();
    }
  },

  /**
   * @function
   * @desc 바로가기 편집 팝업 닫기 요청
   * @private
   */
  _closeQuickEdit: function () {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 바로가기 메뉴 체크박스 click event 처리
   * @param $event
   * @private
   */
  _onClickList: function ($event) {
    this._changedList = true;
    var selectedLength = this.$list.filter(':checked').length;
    if ( selectedLength > 20 ) {
      var $currentTarget = $($event.currentTarget);
      $currentTarget.prop('checked', false);
      $currentTarget.parents('.fe-label-menu').attr('aria-checked', false);
      this._popupService.openAlert(Tw.ALERT_MSG_HOME.A03);
    } else if ( selectedLength === 0 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_HOME.A04);
    }
  },

  /**
   * @function
   * @desc 바로가기 리스트 변경 요청
   * @param menuId
   * @private
   */
  _requestSaveQuickMenu: function (menuId) {
    this._apiService.request(Tw.API_CMD.BFF_04_0003, { menuIdStr: menuId })
      .done($.proxy(this._successAddQuickMenu, this))
      .fail($.proxy(this._failAddQuickMenu, this));
  },

  /**
   * @function
   * @desc 바로가기 리스트 변경 응답 처리
   * @param resp
   * @private
   */
  _successAddQuickMenu: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._changeQuickMenu = true;
      this._popupService.close();

      if (Tw.BrowserHelper.isApp()) {
        Tw.CommonHelper.resetHeight($('.home-slider .home-slider-belt')[0]);
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 바로가기 리스트 변경 요청 실패 처리
   * @param error
   * @private
   */
  _failAddQuickMenu: function(error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 초기화
   * @param $target
   * @private
   */
  _init: function ($target) {
    if ( Tw.FormatHelper.isEmpty(this._menu) ) {
      this._getMenu($target);
    } else {
      this._openLayer(this._menu, $target);
    }
  },

  /**
   * @function
   * @desc 전체 메뉴 요청
   * @private
   */
  _getMenu: function ($target) {
    this._apiService.request(Tw.NODE_CMD.GET_MENU, {})
      .done($.proxy(this._successMenu, this, $target));
  },

  /**
   * @function
   * @desc 전체 메뉴 응답 처리
   * @param resp
   * @private
   */
  _successMenu: function ($target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._menu = this._parseMenu(resp.result);
      this._openLayer(this._menu, $target);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 전체 메뉴 파싱
   * @param result
   * @returns {*}
   * @private
   */
  _parseMenu: function (result) {
    var menuComponent = new Tw.MenuComponent(true);
    var parsedMenu = menuComponent.tideUpMenuInfo(result.frontMenus, result.userInfo);
    var menu = [];

    _.map(parsedMenu, $.proxy(function (target) {
      menu = menu.concat(target);
    }, this));
    return this._getShowMenu(menu, []);
  },

  /**
   * @function
   * @desc 바로가기 노출 메뉴 확
   * @param menu
   * @param initial
   */
  _getShowMenu: function (menu, initial) {
    return _.reduce(menu, function (result, target) {
      if ( target.supMenuNmExpsYn === 'N' ) {
        if ( !Tw.FormatHelper.isEmpty(target.children) ) {
          return this._getShowMenu(target.children, result);
        } else {
          return result;
        }
      } else {
        if ( target.menuScutExpsYn === 'Y' ) {
          target.quickAdded = false;
          result.push(target);
        }
        return result;
      }
    }, initial, this);
  },

  /**
   * @function
   * @desc 바로가기 메뉴 리스트 요청
   * @param menuList
   * @param quickList
   * @returns {*}
   * @private
   */
  _mergeList: function (menuList, quickList) {
    this._findAddedMenu(menuList, quickList);
    return menuList;
  },

  /**
   * @function
   * @desc 바로가기 추가된 메뉴 확인
   * @param menuList
   * @param quickList
   * @private
   */
  _findAddedMenu: function (menuList, quickList) {
    _.map(menuList, $.proxy(function (menu) {
      var findQuickMenu = _.find(quickList, $.proxy(function (quick) {
        return quick.menuId === menu.menuId;
      }, this));

      if ( !Tw.FormatHelper.isEmpty(findQuickMenu) ) {
        menu.quickAdded = true;
        findQuickMenu.notUsed = true;
      }
      if ( !Tw.FormatHelper.isEmpty(menu.children) ) {
        this._findAddedMenu(menu.children, quickList);
      }
    }, this));
  }
};
