/**
 * @file customer.faq.search.js
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.11.05
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
  _onSearchInputFocused: function (e) {
    if (Tw.FormatHelper.isEmpty(e.currentTarget.value.trim())) {
      this.$btnSearch.attr('disabled', 'disabled'); // 검색버튼 비활성화
    }
  },
  _onQueryDeleted: function () {
    this.$btnSearch.attr('disabled', 'disabled');
    return true;
  },
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
  _onSearchRequested: function () {
    var keyword = this.$inputSearch.val().trim();
    $(':focus').blur();
    setTimeout($.proxy(function () {
      this._historyService.replaceURL('/customer/faq/search?keyword=' + keyword);
    }, this), 200);
  },
  _onExternalLink: function (e) {
    var url = $(e.currentTarget).attr('href');
    Tw.CommonHelper.openUrlExternal(url);

    return false;
  }
};