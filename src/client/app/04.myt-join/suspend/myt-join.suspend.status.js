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
    this.$container.on('click', '#fe-reattach-files', $.proxy(this._onClickAttachFiles, this));
  },

  _bindEvent: function () {
    this.$container.on('click', '#bt-reset', $.proxy(this._onClickReset, this));
    this.$container.on('click', '#bt-resuspend', $.proxy(this._onClickResuspend, this));
    this.$container.on('click', '#bt-cancel-resuspend', $.proxy(this._onClickCancelResuspend, this));
  },

  // Resuspend
  _onClickResuspend: function () {
    this._popupService.open({
      hbs: 'MS_03_05_04',
      data: {
        svcInfo: this._svcInfo,
        period: this._params.period,
        reason: this._params.reason
      }
    }, $.proxy(this._onOpenResuspendPopup, this), null, 'resuspend');
  },

  _onOpenResuspendPopup: function ($popup) {
    $popup.find('input[type="date"]').val(Tw.DateHelper.getAddDay(null, 'YYYY-MM-DD'));
    $popup.find('#fe-resuspend').on('click', $.proxy(this._requestResuspend, this, $popup));
  },

  _requestResuspend: function ($popup) {
    var fromDate = $popup.find('input[type="date"]').val();
    var diff = Tw.DateHelper.getDiffByUnit(fromDate, Tw.DateHelper.getCurrentShortDate(), 'days');
    if ( diff < 0 ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE);
      return;
    }

    skt_landing.action.loading.on({ ta: 'body', co: 'grey', size: true });
    var params = { fromDt: fromDate.replace(/-/g, '') };
    this._apiService.request(Tw.API_CMD.BFF_05_0151, params)
      .done($.proxy(this._onSuccessResuspend, this, params))
      .fail($.proxy(this._onError, this));
  },

  _onSuccessResuspend: function (params, res) {
    skt_landing.action.loading.off({ ta: 'body' });
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var duration = Tw.DateHelper.getFullKoreanDate(params.fromDt);
      var desc = Tw.MYT_JOIN_SUSPEND.SUCCESS_SUSPEND_MESSAGE.replace('{DURATION}', duration)
        .replace('{SVC_NUMBER}', this._svcInfo.svcNum);
      this._popupService.afterRequestSuccess('/myt-join/submain', '/myt-join/submain', null, Tw.MYT_JOIN_SUSPEND.RESUSPEND, desc);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  // Cancel resuspend
  _onClickCancelResuspend: function () {
    this._popupService.open({
      hbs: 'MS_03_05_06',
      data: {
        svcInfo: this._svcInfo,
        period: this._params.status.period,
        resuspend: this._params.status.resuspend
      }
    }, $.proxy(this._onOpenCancelResuspendPopup, this), null, 'cancelReset');
  },

  _onOpenCancelResuspendPopup: function ($popup) {
    $popup.find('#fe-reset').on('click', $.proxy(this._requesCancelResuspend, this, $popup));
  },

  _requesCancelResuspend: function () {
    skt_landing.action.loading.on({ ta: 'body', co: 'grey', size: true });
    var params = { isReserveCancel: 'Y' };
    this._apiService.request(Tw.API_CMD.BFF_05_0151, params)
      .done($.proxy(this._onSuccessRequestCancel, this, params))
      .fail($.proxy(this._onError, this));
  },

  _onSuccessRequestCancel: function (params, res) {
    skt_landing.action.loading.off({ ta: 'body' });
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var duration = Tw.DateHelper.getFullKoreanDate(params.fromDt);
      var desc = Tw.MYT_JOIN_SUSPEND.SUCCESS_SUSPEND_MESSAGE.replace('{DURATION}', duration)
        .replace('{SVC_NUMBER}', this._svcInfo.svcNum);
      this._popupService.afterRequestSuccess('/myt-join/submain', '/myt-join/submain', null, Tw.MYT_JOIN_SUSPEND.CANCEL_RESUSPEND, desc);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  // Reset
  _onClickReset: function () {
    this._popupService.open({
      hbs: 'MS_03_05_05',
      data: {
        svcInfo: this._svcInfo,
        period: this._params.status.period,
        reason: this._params.status.reason,
        longterm: this._params.status.type == 'long-term'
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
      this._popupService.afterRequestSuccess('', '/myt-join/submain', null, Tw.MYT_JOIN_SUSPEND.RESET, null);
    } else if ( res.code === 'MOD0022' ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ALERT_EXCEED.MESSAGE, Tw.MYT_JOIN_SUSPEND.ALERT_EXCEED.TITLE);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _getSvcInfo: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successSvcInfo, this))
      .fail($.proxy(this._onError, this));
  },
  _successSvcInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcInfo = _.clone(resp.result);
      this._svcInfo.svcNum = Tw.FormatHelper.getFormattedPhoneNumber(this._svcInfo.svcNum);
      this._bindEvent();
    }
  },

  _onError: function (res) {
    Tw.Error(res.code, res.msg).pop();
  },

  ///// file uploading
  // Open the suspend upload file popup
  _onClickAttachFiles: function () {
    // TODO reasonCd로 대체
    var data = {};
    if ( this._params.progress.reason === '군입대' ) {
      data.count = 2;
    } else {
      data.count = 1;
    }
    this._openCommonFileDialog(data.count);
  },

  _openCommonFileDialog: function (count) {
    if ( !this._fileDialog ) {
      this._fileDialog = new Tw.MytJoinSuspendUpload();
    }
    this._fileDialog.show($.proxy(this._onCommonFileDialogConfirmed, this), count, this._params.progress.attFileList);
  },

  _onCommonFileDialogConfirmed: function (files) {
    this._files = files;
    this._requestUpload(this._files);
  },

  _requestUpload: function (files) {
    var formData = new FormData();
    _.map(files, $.proxy(function (file) {
      formData.append('file', file);
    }, this));

    this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData)
      .done($.proxy(this._successUploadFile, this))
      .fail($.proxy(this._onError, this));
  },

  _successUploadFile: function (res) {
    // USCAN upload
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var convFileList = res.result.map(function (item) {
        return {
          fileSize: item.size,
          fileName: item.name,
          filePath: 'uploads/'
        };
      });

      this._apiService.request(Tw.API_CMD.BFF_01_0046, {
        recvFaxNum: 'skt257@sk.com',
        proMemo: '', // TBD
        scanFiles: convFileList
      })
        .done($.proxy(this._onSuccessUscanUpload, this))
        .fail($.proxy(this._onError, this));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  _onSuccessUscanUpload: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onError: function (res) {
    Tw.Error(res.code, res.msg).pop();
  }


};