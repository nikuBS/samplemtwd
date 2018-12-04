/**
 * FileName: customer.main.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.07.25
 */

Tw.CustomerMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerMain.prototype = {
  _cachedElement: function () {
    this.$input_faq = $('.fe-input-faq');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-search-faq', $.proxy(this._onSearchFAQ, this));
  },

  _onSearchFAQ: function () {
    var query = this.$input_faq.val();

    if (!Tw.FormatHelper.isEmpty(query.trim())) {
      this._historyService.goLoad('/customer/faq?search=' + query.trim());
    }
  }
};