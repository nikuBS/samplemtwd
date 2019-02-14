/**
 * FileName: menu.search.component
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2019.2.12
 */
Tw.MenuSearchComponent = function (container) {
  this.$container = container;

  this._apiService = Tw.Api;
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
    this.$container.on('click', '#fe-cancel-search', $.proxy(this._cancelSearch, this));
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
    return '<li><a class="category-type" href="' + href + '"><span class="text">' +
      title + '</span></a></li>';
  },
  _cancelSearch: function () {
    this.$searchInput.val('');
    this.$container.find('.fe-menu-section').removeClass('none');
    this.$container.find('.fe-search-section').addClass('none');
  },
  _onSearch: function (e) {
    if (e.keyCode !== 13) { // Enter 인 경우 검색
      return;
    }

    var keyword = $(e.currentTarget).val();
    if (keyword.trim() === '') {  // 검색어가 비어 있을 경우 취소
      return;
    }

    this._historyService.goLoad('/common/search?keyword=' + keyword + '&from=menu');
  },

  focus: function () {
    this.$searchInput.focus();
  }
};
