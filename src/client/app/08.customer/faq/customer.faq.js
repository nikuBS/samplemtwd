/**
 * FileName: customer.faq.js (CI_11_01)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.17
 */

Tw.CustomerFaq = function (rootEl) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;

  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerFaq.prototype = {
  _cacheElements: function () {
    this.$searchInput = this.$container.find('input');
    this.$searchBtn = this.$container.find('.bt-search');
  },
  _bindEvents: function () {
    this.$searchInput.on('keyup', $.proxy(this._onSearchInput, this));
    this.$searchBtn.on('click', $.proxy(this._onSearch, this));
    this.$container.on('click', '.fe-external', $.proxy(this._onLinks, this));
  },
  _onLinks: function (evt) {
    // if (Tw.BrowserHelper.isApp()) {
      // this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
        // type: Tw.NTV_BROWSER.EXTERNAL,
        // url: evt.target.href
      // });
      // return false;
    // }
    // return true;
    Tw.CommonHelper.openUrl(evt.target.href);
    return false;
  },
  _onSearchInput: function (evt) {
    if (Tw.FormatHelper.isEmpty(evt.target.value.trim())) {
      this.$searchBtn.addClass('none');
    } else {
      this.$searchBtn.removeClass('none');
    }
  },
  _onSearch: function () {
    var query = this.$searchInput.val();
    if (!Tw.FormatHelper.isEmpty(query.trim())) {
      this._historyService.goLoad('/customer/faq?search=' + query.trim());
    }
  }
};
