/**
 * FileName: customer.faq.js (CI_11_01)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.17
 */

Tw.CustomerFaq = function (rootEl) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();

  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerFaq.prototype = {
  _cacheElements: function () {
    this.$searchInput = this.$container.find('input');
  },
  _bindEvents: function () {
    this.$container.on('click', '.bt-search', $.proxy(this._onSearch, this));
  },
  _onSearch: function () {
    var query = this.$searchInput.val();
    if (!Tw.FormatHelper.isEmpty(query.trim())) {
      this._historyService.goLoad('/customer/faq?search=' + query.trim());
    }
  }
};
