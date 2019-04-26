/**
 * @file 업무검색 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2019-2-12
 */

/**
 * @constructor
 * @param  {object} container - 업무검색 화면 영역의 최상위 elem
 * @param  {Object} menu - menu 영역의 최상위 elem
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

  /**
   * @function
   * @desc 추천업무 리스트를 redis로 부터 조회
   */
  _init: function () {
    this.$searchInput.focus();
    this._apiService.request(Tw.NODE_CMD.GET_MENU_RCMD, {})
      .then($.proxy(this._onMenuRcmd, this));
  },

  /**
   * @function
   * @desc redis에서 조회된 추천업무 리스트를 화면에 update
   * @param  {Object} res - redis조회로 부터 전달받은 추천업무 결과 값
   */
  _onMenuRcmd: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var $area = this.$container.find('.popularsearchword-list');
      var result = res.result.rcmndMenus;
      for (var i = 0; i < result.length; i += 1) {
        $area.append(this._compileTplForRecommendationItem(result[i].menuUrl, result[i].menuNm));
      }
    }
  },

  /**
   * @function
   * @desc 각각의 추천업무를 화면에 보여주기 위해 markup 형태로 조립
   * @param  {String} href - 클릭 시 연결할 url
   * @param  {String} title - 표기할 추천업무 명
   */
  _compileTplForRecommendationItem: function (href, title) {
    return '<li><a class="category-type fe-replace" href="' + href + '"><span class="text">' +
      title + '</span></a></li>';
  },

  /**
   * @function
   * @desc 검색 영역의 X버튼 선택시 관련 처리
   */
  cancelSearch: function () {
    this.$searchInput.val('');
    this.$container.find('.fe-menu-section').removeClass('none');
    this.$container.find('.fe-search-section').addClass('none');
    if (this.$menu) {
      this.$menu.addClass('user-type');
    }
  },

  /**
   * @function
   * @desc 검색요청 시 검색어와 함께 검색화면으로 이동
   * @param  {Object} e - keyup event
   */
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

  /**
   * 추천업무 클릭 시 해당 url로 이동
   * @param  {Object} e - click evnet
   */
  _onLink: function (e) {
    var url = e.currentTarget.href;
    this._historyService.replaceURL(url);
    return false;
  },


  /**
   * @function
   * @desc 검색 input으로 focus 이동
   */
  focus: function () {
    this.$searchInput.focus();
  }
};
