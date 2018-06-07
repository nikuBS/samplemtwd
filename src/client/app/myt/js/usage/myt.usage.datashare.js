Tw.MytUsageDataShare = function (rootEl) {
  this.$container = rootEl;
  this._bindEvent();
};

Tw.MytUsageDataShare.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.get-usage-data', $.proxy(this._showUsageData, this));
  },
  _showUsageData: function ($event) {
    $event.preventDefault();

    var target = $($event.target);
    target.siblings('em').show();
    target.hide();
  }
};