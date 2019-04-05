/**
 * @file menu.search.component
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2019.2.12
 */
Tw.MenuSearchComponent = function (container, menu) {
  this.$container = container;
  this.$menu = menu;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cacheElements();
  this._bindEvents();
  this._init();
};

Tw.MenuSearchComponent.prototype = {
  _cacheElements: function () {
    this.$searchInput = this.$container.find('#fe-search-input2');
  },
  _bindEvents: function () {
    this.$searchInput.on('keyup', $.proxy(this._onSearch, this));
    this.$container.on('click', '#fe-cancel-search', $.proxy(this.cancelSearch, this));
    this.$container.on('click', '.fe-replace', $.proxy(this._onLink, this));
  },
  _init: function () {
    this._apiService.request(Tw.NODE_CMD.GET_MENU_RCMD, {})
      .then($.proxy(this._onMenuRcmd, this));
  },

  _onMenuRcmd: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var $area = this.$container.find('.popularsearchword-list');
      var result = res.result.rcmndMenus;
      for (var i = 0; i < result.length; i += 1) {
        $area.append(this._compileTplForRecommendationItem(result[i].menuUrl, result[i].menuNm));
      }
    }
  },
  _compileTplForRecommendationItem: function (href, title) {
    return '<li><a class="category-type fe-replace" href="' + href + '"><span class="text">' +
      title + '</span></a></li>';
  },
  cancelSearch: function () {
    this.$searchInput.val('');
    this.$container.find('.fe-menu-section').removeClass('none');
    this.$container.find('.fe-search-section').addClass('none');
    if (this.$menu) {
      this.$menu.addClass('user-type');
    }
  },
  _onSearch: function (e) {
    if (e.keyCode !== 13) { // Enter 인 경우 검색
      return;
    }

    if (window.location.hash.indexOf('alert') !== -1) {
      return;
    }

    var keyword = $(e.currentTarget).val();
    if (keyword.trim() === '') {  // 검색어가 비어 있을 경우 취소
      this._popupService.openAlert(Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,
        undefined, undefined, undefined, 'menu_search_alert');
      this.$searchInput.blur();
      return;
    }

    var keyword = encodeURIComponent(keyword);
    this._historyService.replaceURL('/common/search?keyword=' + keyword + '&from=menu');
  },
  _onLink: function (e) {
    var url = e.currentTarget.href;
    this._historyService.replaceURL(url);
    return false;
  },

  focus: function () {
    this.$searchInput.focus();
  }
};
