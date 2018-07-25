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
  },

  _bindEvent: function() {
    this.$btnGuide.on('click', $.proxy(this._goGuide, this));
    this.$btnGuideMore.on('click', $.proxy(this._goGuideMore, this));
  },

  _goGuide: function(e) {
    this._go('/customer/prevent-damage/guide?category=' + $(e.currentTarget).data('category'));
  },

  _goGuideMore: function() {
    this._go('/customer/prevent-damage/guide');
  },

  _go: function(url) {
    location.href = url;
  }
};