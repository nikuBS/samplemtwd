/**
 * @file 자주 찾는 질문 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-11-05
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 */
Tw.CustomerFaq = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._historyService = new Tw.HistoryService();
  this.selectedSearchCategory = 1000000;

  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerFaq.prototype = {
  _cacheElements: function () {
    this.$btnSearch = this.$container.find('#fe-search');
    this.$inputSearch = this.$container.find('#fe-input');
    this.$btnSearchCategory = this.$container.find('.fe-search-category'); /* 검색 카테고리 선택 */
  },
  _bindEvents: function () {
    this.$container.on('click', '.fe-external', $.proxy(this._onExternalLinks, this));
    this.$container.on('click', '.cancel', $.proxy(this._onQueryDeleted, this));
    this.$inputSearch.on('keyup', $.proxy(this._onSearchInput, this));
    this.$inputSearch.on('focusin', $.proxy(this._onSearchInputFocused, this));
    this.$btnSearch.on('click', $.proxy(this._onSearchRequested, this));
    this.$container.on('click', '.fe-search-category', $.proxy(this._onSearchCategory, this));  /* 검색 카테고리 액션시트 팝업 */
  },

  /**
   * @function
   * @desc 링크를 외브 브라우저로 열어줌
   * @param  {Object} e - click event
   */
  _onExternalLinks: function (e) {
    var url = e.currentTarget.value;
    Tw.CommonHelper.openUrlExternal(url);
  },

  /**
   * @function
   * @desc 검색 필드의 입력 이벤트를 처리, '검색' 버튼 활성/비활성 여부 처리 및 enter 키코드에 대한 처리
   * @param  {Object} e - keyup event
   */
  _onSearchInput: function (e) {
    if (Tw.FormatHelper.isEmpty(e.currentTarget.value.trim())) {
      this.$btnSearch.attr('disabled', 'disabled');
    } else {
      this.$btnSearch.removeAttr('disabled');

      if (e.key === 'Enter') {
        this._onSearchRequested();
      }
    }
  },

  /**
   * @function
   * @desc 검색필드에 focus 들어올때 검색어 입력 상황에 따른 '검색' 버튼 활성화 여부 처리
   * @param  {Object} e - event
   */
  _onSearchInputFocused: function (e) {
    if (Tw.FormatHelper.isEmpty(e.currentTarget.value.trim())) {
      this.$btnSearch.attr('disabled', 'disabled'); // 검색버튼 비활성화
    }
  },

  /**
   * @function
   * @desc X 버튼으로 검색어 삭제 시 검색버튼 비활성화
   */
  _onQueryDeleted: function () {
    this.$btnSearch.attr('disabled', 'disabled');
    return true;
  },

  /**
   * @function
   * @desc 검색결과 화면으로 이동시켜줌
   */
  _onSearchRequested: function () {
    var keyword = this.$inputSearch.val().trim();
    $(':focus').blur();
    setTimeout($.proxy(function () {
      // this._historyService.goLoad('/customer/faq/search?keyword=' + keyword);
      this._historyService.replaceURL('/customer/faq/search?keyword=' + keyword + '&selectedSearchCategory=' + this.$btnSearchCategory.text().trim() + ':' + this.selectedSearchCategory);
    }, this), 200);
  },

   /**
   * @function
   * @desc 검색 카테고리 액션시트 팝업 오픈
   */
  _onSearchCategory: function (e) {
    var list = Tw.POPUP_TPL.CUSTOMER_FAQ_SEARCH_CATEGORY;

    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      data: list,
      btnfloating: { attr: 'type="button"', txt: Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(function ($root) {
      Tw.CommonHelper.focusOnActionSheet($root);
      /* 팝업 오픈 시 이전에 선택된 지역 체크 */
      $root.find('input#' + this.selectedSearchCategory).attr('checked', true);
      
      $root.on('click', '.btn-floating', $.proxy(function () {
        this._popupService.close();
      }, this));
      $root.on('click', 'input[type=radio]', $.proxy(function (e) {
        this.$btnSearchCategory.text($(e.currentTarget).data('search-category')); /* templete.type.js에서 사용자 정의 속성 */
        this.selectedSearchCategory = $(e.currentTarget).attr('id');
        // Tw.Logger.info('[this.selectedSearchCategory는 : ]', this.selectedSearchCategory);
        // this._historyService.goLoad(this._getSearchUrl(this._searchType.LOCATION));
        this._popupService.close();
      }, this));
    }, this), 
    null, 
    null,
    $(e.currentTarget));
  }



  
};