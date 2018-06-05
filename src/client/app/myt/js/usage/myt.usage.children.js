Tw.MytUsageChildren = function () {
  this._init();
  this._cachedElement();
  this._bindEvent();
}

Tw.MytUsageChildren.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$container   = $('#wrap');
    this.$select_line = this.$container.find('#line_list');
    this.$mdl_name    = this.$container.find('#mdl_name');
    this.$nick_name   = this.$container.find('#nick_name');
  },

  _bindEvent: function () {
    this.$select_line.on('change', $.proxy(this._changeLine, this));
  },

  _changeLine: function () {
    var $option  = this.$select_line.find(":selected");
    var mdl      = $option.data('mdl');
    var nickname = $option.data('nickname');

    this.$mdl_name.text(mdl);
    this.$nick_name.text(nickname);
  }
}