/**
 * FileName: customer.main.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.12.27
 */

Tw.CustomerMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerMain.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$fe_faq_search = this.$container.find('.fe-faq-search');
    this.$fe_faq_search_text = this.$container.find('.fe-faq-search-text');
  },

  _bindEvent: function () {
    this.$fe_faq_search.on('click', $.proxy(this._goToFaq, this));
    this.$fe_faq_search_text.on('keyup', $.proxy(this._activateFaqSearch, this));
    this.$container.on('click', '.cancel', $.proxy(this._activateFaqSearch, this));
  },

  _activateFaqSearch: function (e) {
    var isEnter = Tw.InputHelper.isEnter(e);
    if ( !!this.$fe_faq_search_text.val() ) {
      this.$fe_faq_search.prop('disabled', false);
      if (isEnter) {
        this._goToFaq();
      }
    } else {
      this.$fe_faq_search.prop('disabled', true);
    }
  },

  _goToFaq: function () {
    if ( this.$fe_faq_search_text.val() !== '' ) {
      this._history.goLoad('/customer/faq/search?' + $.param({ keyword: this.$fe_faq_search_text.val() }));
    }
  }
};