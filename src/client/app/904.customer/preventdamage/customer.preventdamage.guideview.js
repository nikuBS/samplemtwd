/**
 * FileName: customer.preventdamage.guideview.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.24
 */

Tw.CustomerPreventdamageGuideview = function(rootEl) {
  this.$container = rootEl;

  this._init();
};

Tw.CustomerPreventdamageGuideview.prototype = {
  _init: function() {
    setTimeout($.proxy(this._loadImgs, this), 1000);
  },

  _loadImgs: function() {
    this.$container.find('[data-src]')
      .each(function() {
        $(this).attr('src', $(this).data('src')).show();
      });
  }
};