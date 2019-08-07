/**
 * @file 자주 찾는 질문 검색결과 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-11-05
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 * @param  {String} keyword - 검색어
 */
Tw.CustomerFaqSearch = function (rootEl, keyword, searchInfo) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._category = {
    categoryAllCode: 1000000,
    categoryAllName: '전체'
  }

  // Tw.Logger.info('[js 시작의 searchInfo는? boolearn : ]', !!searchInfo);
  // alert('searchInfo 는 : ', searchInfo);
  // alert('searchInfo.selectedSearchCategoryName 는 : ', searchInfo.selectedSearchCategoryName);
  // Tw.Logger.info('searchInfo.selectedSearchCategoryName 는 : ', searchInfo.selectedSearchCategoryName);
  // alert('searchInfo.selectedSearchCategory 는 : ', searchInfo.selectedSearchCategory);
  // Tw.Logger.info('searchInfo.selectedSearchCategory 는 : ', searchInfo.selectedSearchCategory);
  // Tw.Logger.info('searchInfo 는 : ', searchInfo);
  // Tw.Logger.info('searchInfo.searchFilters.searchFltNames 는 : ', searchInfo.searchFilters.searchFltNames);
  // Tw.Logger.info('searchInfo.searchFilters.searchFltIds 는 : ', searchInfo.searchFilters.searchFltIds);
  // Tw.Logger.info('searchInfo.searchFilters.count 는 : ', searchInfo.searchFilters.count);

  this._keyword = keyword;
  this._searchInfo = searchInfo;  // 서버에서 내려받은 검색관련 정보 객체
  // 검색전 카테고리 코드, 서버에서 받은 카테고리 코드가 있으면 그걸 대입하고 없으면 전체로(100000) 설정
  this.selectedSearchCategory = !!this._searchInfo.selectedSearchCategory ? this._searchInfo.selectedSearchCategory : this._category.categoryAllCode;

  this.searchFltIds = !!this._searchInfo.searchFilters.searchFltIds ? this._searchInfo.searchFilters.searchFltIds : null;  // 서버에서 받은 필터 id가 있으면 대입하고 없으면 null
  // Tw.Logger.info('[ 로딩 후 this.searchFltIds 는? : ]', this.searchFltIds);

  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this.isFiltered = false;  // 필터 검색 여부 플래그

  this._itemTemplate = Handlebars.compile($('#tpl_item').html());

  this._cacheElements();
  this._bindEvents();

  // 서버에서 받은 카테고리 이름이 있으면 그걸 적용하고 아니면 전체로, 
  this.$btnSearchCategory.text(!Tw.FormatHelper.isEmpty(this._searchInfo.selectedSearchCategoryName) ? this._searchInfo.selectedSearchCategoryName : this._category.categoryAllName);

};

Tw.CustomerFaqSearch.prototype = {
  _cacheElements: function () {
    this.$searchResult = this.$container.find('#fe-search-result');
    this.$btnSearch = this.$container.find('#fe-search');
    this.$inputSearch = this.$container.find('#fe-input');
    this.$btnSearchCategory = this.$container.find('.fe-search-category'); /* 검색 카테고리 선택 */
    this.$btnSelectFilter = this.$container.find('.fe-select-filter'); /* 검색 후 필터 선택 */
  },
  _bindEvents: function () {
    this.$btnSearch.on('click', $.proxy(this._onSearchRequested, this));
    this.$inputSearch.on('keyup', $.proxy(this._onSearchInput, this));
    this.$inputSearch.on('focusin', $.proxy(this._onSearchInputFocused, this));
    this.$container.on('click', '#fe-more', $.proxy(this._onMoreClicked, this));
    this.$container.on('click', '.cancel', $.proxy(this._onQueryDeleted, this));
    this.$container.on('click', '.fe-link-external', $.proxy(this._onExternalLink, this));
    this.$container.on('click', '.fe-search-category', _.debounce($.proxy(this._onSearchCategory, this), 300));
    this.$container.on('click', '.fe-select-filter', _.debounce($.proxy(this._onSelectFilter, this), 300));
  },

  /**
   * @function
   * @desc 검색어 입력 시 검색 버튼 활성화 여부 처리
   * @param  {Object} e - click event
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
   * @desc 검색창에 focus 들어오는 경우 해당 검색창에 입력 내용이 없을 경우 검색버튼 비활성화
   * @param  {Object} e - focusin event
   */
  _onSearchInputFocused: function (e) {
    if (Tw.FormatHelper.isEmpty(e.currentTarget.value.trim())) {
      this.$btnSearch.attr('disabled', 'disabled'); // 검색버튼 비활성화
    }
  },

  /**
   * @function
   * @desc X버튼으로 검색어 삭제 시 검색 버튼 비활성화
   */
  _onQueryDeleted: function () {
    this.$btnSearch.attr('disabled', 'disabled');
    return true;
  },

  /**
   * @function
   * @desc 더보기 선택시 BFF 호출하여 추가 검색결과 획득 후 화면 업데이트
   */
  _onMoreClicked: function () {
    if (!!!this._page) {
      this._page = 0;
    }

    var apiParam = {
      supIfaqGrpCd : this.selectedSearchCategory,
      srchKey: encodeURIComponent(this._keyword),
      page: this._page + 1,
      size: 20
    }
    // Tw.Logger.info('[ 더보기 this.searchFltIds 는? : ]', this.searchFltIds);
    // 필터 아이디가 존재할때만 api 파라미터 object에 인풋값 추가
    if (!Tw.FormatHelper.isEmpty(this.searchFltIds)){
      apiParam['ifaqGrpCd'] = this.searchFltIds;
    }

    // Tw.Logger.info('[ 더보기 apiParam 는? : ]', apiParam);

    this._apiService.request(Tw.API_CMD.BFF_08_0050, apiParam).done($.proxy(function (res) {
      if (res.code === Tw.API_CODE.CODE_00) {

        this._page++;
        this.$searchResult.append(this._itemTemplate({
          list: res.result.content
        }));

        if (res.result.last) {
          this.$container.find('.bt-more').addClass('none');
        }
      } else {
        Tw.Error(res.code, res.msg).pop();
      }
    }, this)).fail(function (err) {
      Tw.Error(err.code, err.msg).pop();
    });
  },

  /**
   * @function
   * @desc 검색 요청 시 입력된 검색어로 검샐결과 업데이트, 필터가 있을경우 필터까지 전달
   */
  _onSearchRequested: function () {
    var keyword = this.$inputSearch.val().trim();
    $(':focus').blur();
    // Tw.Logger.info('현재 필터 상태는 : ', this.isFiltered);
    setTimeout($.proxy(function () {
      if(this.isFiltered){
        this._historyService.replaceURL('/customer/faq/search?keyword=' + keyword + '&selectedSearchCategory=' + this.$btnSearchCategory.text().trim() + ':' + this.selectedSearchCategory + '&searchFltIds=' + this.searchFltIds)
      } else {
        this._historyService.replaceURL('/customer/faq/search?keyword=' + keyword + '&selectedSearchCategory=' + this.$btnSearchCategory.text().trim() + ':' + this.selectedSearchCategory);
      } 
      
    }, this), 200);
  },
  
  /**
   * @function
   * @desc FAQ 컨텐츠 내용에서 링크 있는 경우 외부 브라우저로 연결
   * @param  {Object} e - click event
   */
  _onExternalLink: function (e) {
    var url = $(e.currentTarget).attr('href');
    Tw.CommonHelper.openUrlExternal(url);

    return false;
  },


   /**
   * @function
   * @desc 검색 카테고리 액션시트 팝업 오픈
   */
  _onSearchCategory: function () {
    
    // Tw.Logger.info('[선택 전 this.selectedSearchCategory는 : ]', this.selectedSearchCategory);
    var list = Tw.POPUP_TPL.CUSTOMER_FAQ_SEARCH_CATEGORY;

    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      data: list,
      btnfloating: { attr: 'type="button"', txt: Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(function ($root) {
      /* 팝업 오픈 시 이전에 선택된 지역 체크 */
      $root.find('input#' + this.selectedSearchCategory).attr('checked', true);
      
      $root.on('click', '.btn-floating', $.proxy(function () {
        this._popupService.close();
      }, this));
      $root.on('click', 'input[type=radio]', $.proxy(function (e) {
        this.$btnSearchCategory.text($(e.currentTarget).data('search-category')); /* templete.type.js에서 사용자 정의 속성 */
        this.selectedSearchCategory = $(e.currentTarget).attr('id');
        // Tw.Logger.info('[선택 후 this.selectedSearchCategory는 : ]', this.selectedSearchCategory);
        this.searchFltIds = ''; // 대분류 카테고리 변경하면 필터 아이디 초기화
        this.$btnSelectFilter.removeClass('date-in').text(this._category.categoryAllName);
        // this._historyService.goLoad(this._getSearchUrl(this._searchType.LOCATION));
      }, this));
    }, this));
  },

   /**
   * @function
   * @desc 검색 후 필터 선택 팝업 오픈
   */
  _onSelectFilter: function (e) {
    var $target = $(e.currentTarget);

    
    // 액션시트의 id 값이 1000000 이라면 전체 카테고리 가져오고 그렇지 않으면 해당 카테고리만 가져옴
    // if(this.selectedSearchCategory === "1000000"){
    if(this.$btnSearchCategory.text().trim().indexOf(Tw.POPUP_TPL.CUSTOMER_FAQ_SEARCH_CATEGORY[0].list[0].txt) !== -1) {  // 카테고리 액션시트가 "전체"와 같지 않으면 - 텍스트 비교
      var list = Tw.POPUP_TPL.CUSTOMER_FAQ_SEARCH_FILTER;
    } else {
      // 해당 카테고리 id가 있는 객체를 찾아서 배열로 만듦, var list = Tw.POPUP_TPL.CUSTOMER_FAQ_SEARCH_FILTER.slice(5,5+1); 대신 var list = [Tw.POPUP_TPL.CUSTOMER_FAQ_SEARCH_FILTER[5]] 사용
      var list = [Tw.POPUP_TPL.CUSTOMER_FAQ_SEARCH_FILTER[_.findIndex(Tw.POPUP_TPL.CUSTOMER_FAQ_SEARCH_FILTER, {faqCategoryId: String(this.selectedSearchCategory)})]];
    }
    
    var currentFilters = this.searchFltIds; // 서버에서 받아오는 필터 아이디

      list = _.chain(list)
      .map(function(filter) {
        return {
          faqCategoryId: filter.faqCategoryId,
          faqCategoryNm: filter.faqCategoryNm,
          subFilters:
            currentFilters && currentFilters.length > 0 ? 
              _.map(filter.subFilters, function(subFilter) {
                if (currentFilters.indexOf(subFilter.faqFilterId) >= 0) {
                  return $.extend({ checked: true }, subFilter);
                }
                return subFilter;
              }) : 
              filter.subFilters
        };
      })
      .value();


    this._popupService.open(
      {
        hbs: 'CS_05_01_case1',
        filters: list,
        layer: true
      },
      $.proxy(this._handleOpenSelectFilterPopup, this),
      null,
      null,
      $target
    );

  },

    /**
   * @desc 필터 변경 팝업 오픈 시 팝업에 이벤트 바인딩
   * @param {$object} $layer 팝업 레이어 jquery 객체
   * @private
   */
  _handleOpenSelectFilterPopup: function($layer) {
    $layer.on('click', '.bt-red1', $.proxy(this._handleSelectFilters, this, $layer));
    $layer.on('click', '.resetbtn', $.proxy(this._handleResetFilters, this, $layer));
  },


   /**
   * @desc 필터 변경하기 버튼 클릭 시 필터 적용
   * @param {$object} $layer 필터 변경 팝업 레이어 jquery 객체
   * @private
   */
  _handleSelectFilters: function($layer) {
    // 체크한 필터만 모으기
    var searchFltIds = _.map($layer.find('input[checked="checked"]'), function(input) {
        return input.getAttribute('data-filter-id');
      }).join(',')


    // 기존 체크한 값과 현재 체크한 값이 같다면 종료 팝업 그냥 종료
    if (!Tw.FormatHelper.isEmpty(this.searchFltIds) && (searchFltIds == this.searchFltIds)) {
      this._popupService.close();
      return;
    }


    this.searchFltIds = searchFltIds;
    this.isFiltered = true; // 필터 검색 여부 플래그
    this._popupService.close();
    this._onSearchRequested();
  },

  /**
   * @desc 필터 선택 초기화 버튼 클릭 시 선택된 필터 or 태그 지움
   * @param {$object} $layer 필터 변경 팝업 레이어 jquery 객체
   * @private
   */
  _handleResetFilters: function($layer) {
    var selectedFilters = $layer.find('li[aria-checked="true"]')
    selectedFilters.attr('aria-checked', false).removeClass('checked');
    selectedFilters.find('input').removeAttr('checked');
  },

};