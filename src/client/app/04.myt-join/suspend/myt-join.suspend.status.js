/**
 * FileName: myt-join.suspend.status
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 11. 13.
 */
Tw.MyTJoinSuspendStatus = function (rootEl, params) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._params = params;
  this._getSvcInfo();
  this._cachedElement();
};

Tw.MyTJoinSuspendStatus.prototype = {
  _cachedElement: function () {

  },

  _bindEvent: function () {
    this.$container.on('click', '#bt-reset', $.proxy(this._onClickReset, this));
    this.$container.on('click', '#bt-resuspend', $.proxy(this._onClickResuspend, this));
  },

  _onClickResuspend: function () {
    this._popupService.open({
      hbs: 'MS_03_05_04',
      data: {
        svcInfo: this._svcInfo,
        period: this._params.period,
        reason: this._params.reason
      }
    }, $.proxy(this._onOpenResuspendPopup, this), null, 'reset');
  },

  _onOpenResuspendPopup: function ($popup) {
    $popup.find('input[type="date"]').val(Tw.DateHelper.getAddDay(null, 'YYYY-MM-DD'));
    $popup.one('click', '#fe-resuspend', $.proxy(this._requestResuspend, this));
  },

  _requestResuspend: function () {

  },

  _onClickReset: function () {
    this._popupService.open({
      hbs: 'MS_03_05_05',
      data: {
        svcInfo: this._svcInfo,
        period: this._params.period,
        reason: this._params.reason
      }
    }, $.proxy(this._onOpenResetPopup, this), null, 'reset');
  },

  _onOpenResetPopup: function ($popup) {
    $popup.one('click', '#fe-reset', $.proxy(this._requestReset, this));
  },

  _requestReset: function () {
    skt_landing.action.loading.on({ ta: 'body', co: 'grey', size: true });
    this._apiService.request(Tw.API_CMD.BFF_05_0152, {})
      .done($.proxy(this._onSuccessRequestReset, this))
      .fail($.proxy(this._onError, this));
  },

  _onSuccessRequestReset: function (res) {
    skt_landing.action.loading.off({ ta: 'body' });
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.afterRequestSuccess('', '/myt/join/submain', null, '해제', null);
    } else if ( res.code === 'MOD0022' ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ALERT_EXCEED.MESSAGE, Tw.MYT_JOIN_SUSPEND.ALERT_EXCEED.TITLE);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _getSvcInfo: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successSvcInfo, this))
      .fail($.proxy(this._failSvcInfo, this));
  },
  _successSvcInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcInfo = _.clone(resp.result);
      this._svcInfo.svcNum = Tw.FormatHelper.getFormattedPhoneNumber(this._svcInfo.svcNum)
      this._bindEvent();
    }
  },

  _failSvcInfo: function () {

  },

};