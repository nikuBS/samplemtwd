/**
 * FileName: customer.useguide.common.js
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018. 10. 18
 */
Tw.CustomerUseguideCommon = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._cachedElement();
  this._bindEvent();

  this._init();
};

Tw.CustomerUseguideCommon.prototype = {
  _init : function() {
    this._hasTab();
    this._activeCurrentHashTab();
  },
  _cachedElement: function () {

  },
  _bindEvent: function () {

  },
  _hasTab: function() {
    this.$tabWrapper = this.$container.find('.tab-linker');
    this._hasTab = this.$tabWrapper.length > 0;
    this._initTab();
  },
  _initTab: function() {
    if(!this._hasTab) return false;
    $(window).on('hashchange', $.proxy(this._activeCurrentHashTab, this));
    this.$tabLinker = this.$tabWrapper.find('a');
    this.$tabContentsWrapper = this.$container.find('.tab-contents div[role="tabpanel"]');
    this._ownHash = _.reduce(this.$tabLinker, function(prev, next) {
      prev.push(next.hash.replace(/#/, ''));
      return prev;
    }, []);
    this.$tabLinker.on('click', $.proxy(this._tabClickHandler, this));
  },
  _activeCurrentHashTab: function() {
    if(!this._hasTab) return false;
    this._currentHashIndex = _.indexOf(this._ownHash, this._hash._currentHashNav);
    this._currentHashIndex = this._currentHashIndex > 0 ? this._currentHashIndex : 0;
    this.$tabLinker.eq(this._currentHashIndex).click();
    _.map(this.$tabLinker.parent('li'), function(o, i) {
      $(o).attr('aria-selected', this._currentHashIndex === i);
    }, this);
  },
  _tabClickHandler: function(e) {
    this.$tabContentsWrapper.addClass('blind');
    this.$tabContentsWrapper.eq(this.$tabLinker.index(e.target)).removeClass('blind');
  },

  _parse_query_string: function () {
    return Tw.UrlHelper.getQueryParams();
  }
};
