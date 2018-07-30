Tw.MytUsageDataShare = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);

  this._bindEvent();
};

Tw.MytUsageDataShare.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.prev-step', $.proxy(this._onClickPrevStep, this));
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
      targetSelector.siblings('em').text(resp.result.used);
      targetSelector.hide();
    } else {
      if ( resp.data ) {
        this._showErrorAlert(resp.data && resp.data.msg);
      } else {
        if ( resp.error ) {
          this._showErrorAlert(resp.error.msg);
        } else {
          this._showErrorAlert(resp.msg);
        }
      }
    }
  },

  _requestFail: function (resp) {
    this._showErrorAlert(resp.data && resp.data.msg);
  },

  _showErrorAlert: function (msg) {
    this._popupService.openAlert(msg);
  },

  _onClickPrevStep: function () {
    this._history.goBack();
  }
};
