/**
 * FileName: customer.faq.result.js (CI_11_06)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.20
 */

Tw.CustomerFaqResult = function (rootEl) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._faqItemTemplate = Handlebars.compile($('#tpl_faq_result_item').html());

  this._cacheElements();
  this._bindEvents();

  this._currentPage = 0;
  this._query = this.$searchInput.val();
};

Tw.CustomerFaqResult.prototype = {
  _cacheElements: function () {
    this.$searchInput = this.$container.find('input');
    this.$searchBtn = this.$container.find('.bt-search');
    this.$moreBtn = this.$container.find('.acco-notice-more');
    this.$result = this.$container.find('.fe-result');
  },
  _bindEvents: function () {
    this.$searchInput.on('keyup', $.proxy(this._onSearchInput, this));
    this.$searchBtn.on('click', $.proxy(this._onSearch, this));
    this.$moreBtn.on('click', $.proxy(this._onMore, this));
  },
  _onSearchInput: function (evt) {
    if (Tw.FormatHelper.isEmpty(evt.target.value.trim())) {
      this.$searchBtn.addClass('none');
    } else {
      this.$searchBtn.removeClass('none');
    }
  },
  _onMore: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0050, {
      srchKey: encodeURIComponent(this._query),
      page: this._currentPage + 1,
      size: 20
    }).done($.proxy(function (res) {
      if (res.code === Tw.API_CODE.CODE_00) {
        this._currentPage++;
        for (var i = 0; i < res.result.content.length; i++) {
          res.result.content[i].answCtt = this._purify(res.result.content[i].answCtt);
        }
        this.$result.append(this._faqItemTemplate({
          list: res.result.content
        }));
        if (res.result.last) {
          this.$moreBtn.addClass('none');
        }
      } else {
        this._popupService.openAlert(res.code + ' ' + res.msg);
      }
    },
    this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.code + ' ' + err.msg);
    }, this));
  },
  _onSearch: function () {
    var query = this.$searchInput.val();
    if (!Tw.FormatHelper.isEmpty(query.trim())) {
      this._historyService.goLoad('/customer/faq?search=' + query.trim());
    }
  },
  _purify: function (text) {
    return text.trim()
      .replace(/\r\n/g, '<br/>');
  }
};
