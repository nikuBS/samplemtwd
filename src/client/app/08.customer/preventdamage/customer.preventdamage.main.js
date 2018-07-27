/**
 * FileName: customer.preventdamage.main.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.18
 */

Tw.CustomerPreventdamageMain = function(rootEl) {
  this.$container = rootEl;

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerPreventdamageMain.prototype = {
  _cachedElement: function() {
    this.$btnGuide = this.$container.find('.fe-btn_guide');
    this.$btnGuideMore = this.$container.find('.fe-btn_guide_more');
    this.$btnWarningMore = this.$container.find('.fe-btn_warning_more');
    this.$listLatestWarning = this.$container.find('.fe-latest_warning_list');
    this.$btnUsefulServiceMore = this.$container.find('.fe-btn_useful_service_more');
    this.$btnRelateSite = this.$container.find('.fe-btn_relate_site');
  },

  _bindEvent: function() {
    this.$btnGuide.on('click', $.proxy(this._goGuide, this));
    this.$btnGuideMore.on('click', $.proxy(this._goGuideMore, this));
    this.$btnWarningMore.on('click', $.proxy(this._goLatestWarningMore, this));
    this.$listLatestWarning.on('click', $.proxy(this._goLatestWarningView, this));
    this.$btnUsefulServiceMore.on('click', $.proxy(this._goUsefulServiceMore, this));
    this.$btnRelateSite.on('click', $.proxy(this._goRelateSite, this));
  },

  _goGuide: function(e) {
    this._go('/customer/prevent-damage/guide?category=' + $(e.currentTarget).data('category'));
  },

  _goGuideMore: function() {
    this._go('/customer/prevent-damage/guide');
  },

  _goLatestWarningMore: function() {
    this._go('/customer/prevent-damage/latest-warning');
  },

  _goLatestWarningView: function(e) {
    this._go('/customer/prevent-damage/latest-warning/view?lwid=' + $(e.currentTarget).data('lwid'));
  },

  _goUsefulServiceMore: function() {
    this._go('/customer/prevent-damage/useful-service');
  },

  _goRelateSite: function() {
    this._go('/customer/prevent-damage/relate-site');
  },

  _go: function(url) {
    location.href = url;
  }
};