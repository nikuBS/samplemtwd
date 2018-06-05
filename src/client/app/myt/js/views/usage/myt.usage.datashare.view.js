Tw.MytUsageDataShareView = function (rootEl) {
  this.$container = rootEl;
  this._bindEvent();
};

Tw.MytUsageDataShareView.prototype = {
  _bindEvent: function () {
    this.$container.find('.get-usage-data').on('click', $.proxy(this._showUsageData, this));
  },
  _showUsageData: function ($event) {
    $event.preventDefault();

    var target = $($event.target);
    target.siblings('em').show();
    target.hide();
  }
};