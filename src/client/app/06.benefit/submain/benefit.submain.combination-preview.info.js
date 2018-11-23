/**
 * FileName: benefit.submain.combination-preview.info.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.11.23
 */

Tw.BenefitSubmainCombinationPreviewInfo = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._hashService = Tw.Hash;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.BenefitSubmainCombinationPreviewInfo.prototype = {

  _cachedElement: function () {
    this._$tabHeaders = this.$container.find('[role="tablist"] li');
    this._$tabContents = this.$container.find('li[role="tabpanel"]');
  },

  _bindEvent: function() {
    this._$tabHeaders.on('click', 'a', $.proxy(this._onClickTabHeader, this));
  },

  _init: function () {
    this._hashService.initHashNav($.proxy(this._onHashChange, this));
  },

  _onClickTabHeader: function(e) {
    e.preventDefault();
    var href = $(e.currentTarget).attr('href');
    this._historyService.replaceURL(href);
  },

  _onHashChange: function (hash) {
    var tabId = 'tab1';
    if ( hash.raw && hash.raw === '2' ) {
      tabId = 'tab2';
    }
    this._showTab(tabId);
  },

  _showTab: function(tabId) {
    this._$tabHeaders.attr('aria-selected', 'false');
    this.$container.find('#'+tabId).attr('aria-selected', 'true');

    this._$tabContents.attr('aria-selected', 'false');
    this.$container.find('#'+tabId+'-tab').attr('aria-selected', 'true');
  }

};
