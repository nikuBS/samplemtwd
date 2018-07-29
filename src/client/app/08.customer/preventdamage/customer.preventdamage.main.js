/**
 * FileName: customer.preventdamage.main.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.18
 */

Tw.CustomerPreventdamageMain = function(rootEl) {
  this.$container = rootEl;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerPreventdamageMain.prototype = {
  _cachedElement: function() {
    this.$btnGuide = this.$container.find('.fe-btn_guide');
    this.$listLatestWarning = this.$container.find('.fe-latest_warning_list');
  },

  _bindEvent: function() {
    this.$btnGuide.on('click', $.proxy(this._goGuide, this));
    this.$listLatestWarning.on('click', $.proxy(this._goLatestWarningView, this));
  },

  _goGuide: function(e) {
    this._history.goLoad('/customer/prevent-damage/guide?category=' + $(e.currentTarget).data('category'));
  },

  _goLatestWarningView: function(e) {
    this._history.goLoad('/customer/prevent-damage/latest-warning/view?lwid=' + $(e.currentTarget).data('lwid'));
  }

};