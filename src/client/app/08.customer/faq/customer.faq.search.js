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
Tw.CustomerFaqSearch = function (rootEl, keyword) {
  this.$container = rootEl;

  this._keyword = keyword;

  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._itemTemplate = Handlebars.compile($('#tpl_item').html());

  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerFaqSearch.prototype = {
  _cacheElements: function () {
    this.$searchResult = this.$container.find('#fe-search-result');
    this.$btnSearch = this.$container.find('#fe-search');
    this.$inputSearch = this.$container.find('#fe-input');
  },
  _bindEvents: function () {
    this.$btnSearch.on('click', $.proxy(this._onSearchRequested, this));
    this.$inputSearch.on('keyup', $.proxy(this._onSearchInput, this));
    this.$inputSearch.on('focusin', $.proxy(this._onSearchInputFocused, this));
    this.$container.on('click', '#fe-more', $.proxy(this._onMoreClicked, this));
    this.$container.on('click', '.cancel', $.proxy(this._onQueryDeleted, this));
    this.$container.on('click', '.fe-link-external', $.proxy(this._onExternalLink, this));
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

    this._apiService.request(Tw.API_CMD.BFF_08_0050, {
      srchKey: encodeURIComponent(this._keyword),
      page: this._page + 1,
      size: 20
    }).done($.proxy(function (res) {
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
   * @desc 검색 요청 시 입력된 검색어로 검샐결과 업데이트
   */
  _onSearchRequested: function () {
    var keyword = this.$inputSearch.val().trim();
    $(':focus').blur();
    setTimeout($.proxy(function () {
      this._historyService.replaceURL('/customer/faq/search?keyword=' + keyword);
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
  }
};