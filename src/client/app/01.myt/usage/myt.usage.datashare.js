Tw.MytUsageDataShare = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._bindEvent();
};

Tw.MytUsageDataShare.prototype = Object.create(Tw.View.prototype);
Tw.MytUsageDataShare.prototype.constructor = Tw.MytUsageDataShare;

Tw.MytUsageDataShare.prototype = Object.assign(Tw.MytUsageDataShare.prototype, {
  _bindEvent: function () {
    this.$container.on('click', '.get-usage-data', $.proxy(this._getUsageData, this));
  },
  _getUsageData: function ($event) {
    $event.preventDefault();

    var targetSelector = $($event.target);
    var cSvcMgmtNum = targetSelector.data('value');

    this._apiService.request(Tw.API_CMD.BFF_05_0009, { cSvcMgmtNum: cSvcMgmtNum })
      .done($.proxy(this._success, this, targetSelector))
      .fail($.proxy(this._fail, this));
  },
  _success: function (targetSelector, res) {
    targetSelector.siblings('em').text(res.result.used);
    targetSelector.hide();
  },
  _fail: function (err) {
    console.log('data-sharing child api error', err);
  }
});
