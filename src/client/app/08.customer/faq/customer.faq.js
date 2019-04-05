/**
 * @file customer.faq.js
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.11.05
 */

Tw.CustomerFaq = function (rootEl) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();

  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerFaq.prototype = {
  _cacheElements: function () {
    this.$btnSearch = this.$container.find('#fe-search');
    this.$inputSearch = this.$container.find('#fe-input');
  },
  _bindEvents: function () {
    this.$container.on('click', '.fe-external', $.proxy(this._onExternalLinks, this));
    this.$container.on('click', '.cancel', $.proxy(this._onQueryDeleted, this));
    this.$inputSearch.on('keyup', $.proxy(this._onSearchInput, this));
    this.$inputSearch.on('focusin', $.proxy(this._onSearchInputFocused, this));
    this.$btnSearch.on('click', $.proxy(this._onSearchRequested, this));
  },
  _onExternalLinks: function (e) {
    var url = e.currentTarget.value;
    Tw.CommonHelper.openUrlExternal(url);
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
  _onSearchRequested: function () {
    var keyword = this.$inputSearch.val().trim();
    $(':focus').blur();
    setTimeout($.proxy(function () {
      this._historyService.goLoad('/customer/faq/search?keyword=' + keyword);
    }, this), 200);
  }
};