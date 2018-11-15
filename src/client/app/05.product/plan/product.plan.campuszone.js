Tw.ProductPlanCampuszone = function(rootEl) {
  this.$container = rootEl;

  this._cachedElements();
  this._bindEvent();
};

Tw.ProductPlanCampuszone.prototype = {
  _cachedElements: function() {
    this.$lists = this.$container.find('.data-type01-wrap');
  },

  _bindEvent: function() {
    this.$container.on('change', 'input', $.proxy(this._handleSelectList, this));
  },

  _handleSelectList: function(e) {
    var selected = Number(e.currentTarget.getAttribute('data-idx') || 0),
      i = 0,
      list;
    for (; i < this.$lists.length; i++) {
      list = this.$lists[i];
      if (i === selected) {
        list.className = list.className.replace('none', '');
      } else if (list.className.indexOf('none') < 0) {
        list.className += ' none';
      }
    }
  }
};
