Tw.CustomerDamageInfo = function(rootEl) {
  this.$container = rootEl;
  this._bindEvent();
};

Tw.CustomerDamageInfo.prototype = {

  _bindEvent: function() {
    this.$container.on('click', '.fe-outlink', $.proxy(this._openOutlink, this));
  },

  _openOutlink: function (e) {
    e.preventDefault();
    Tw.CommonHelper.openUrlExternal($(e.currentTarget).attr('href'));
  }

};
