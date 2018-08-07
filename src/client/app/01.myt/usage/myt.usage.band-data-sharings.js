Tw.MytUsageBandDataSharings = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.MytUsageBandDataSharings.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.fe-btn-used-data', $.proxy(this._onClickBtnUsedData, this));
  },
  _onClickBtnUsedData: function ($event) {
    $event.preventDefault();

    var targetSelector = $($event.target);
    var svcMgmtNum = targetSelector.data('svcmgmtnum');

    this._apiService.request(Tw.API_CMD.BFF_05_0009, { cSvcMgmtNum: svcMgmtNum })
      .done($.proxy(this._requestDone, this, targetSelector))
      .fail($.proxy(this._requestFail, this));
  },

  _requestDone: function (targetSelector, resp) {
    if ( resp.code === '00' ) {
      var used = Tw.FormatHelper.convDataFormat(resp.result.used, Tw.DATA_UNIT.KB);
      targetSelector.siblings('.ff-hn').text(used.data + used.unit);
      targetSelector.hide();
    } else {
      this._showErrorAlert(resp.code + ' ' + resp.msg);
    }
  },

  _requestFail: function (resp) {
    this._showErrorAlert(resp.code + ' ' + resp.msg);
  },

  _showErrorAlert: function (msg) {
    this._popupService.openAlert(msg);
  }

};
