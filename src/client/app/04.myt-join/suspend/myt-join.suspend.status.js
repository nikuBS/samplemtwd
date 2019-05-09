/**
 * @file myt-join.suspend.status
 * @author Hyeryoun Lee
 * @since 2018-11-13
 */
/**
 * @class
 * @desc 일시정지 신청현황(MS_03_05_03_01)
 * @param tabEl tab content wrapper
 * @param params
 */
Tw.MyTJoinSuspendStatus = function (rootEl, params) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._params = params;
  this._getSvcInfo();
  this._cachedElement();
};

Tw.MyTJoinSuspendStatus.prototype = {
  /**
   * @function
   * @desc Cache elements for binding events.
   * @returns {void}
   */
  _cachedElement: function () {
    this.$container.on('click', '#fe-reattach-files', $.proxy(this._onClickAttachFiles, this));
  },
  /**
   * @function
   * @desc Bind events to elements.
   */
  _bindEvent: function () {
    this.$container.on('click', '[data-id="bt-reset"]', $.proxy(this._onClickReset, this));
    this.$container.on('click', '[data-id="bt-resuspend"]', $.proxy(this._onClickResuspend, this));
    this.$container.on('click', '#bt-cancel-resuspend', $.proxy(this._onClickCancelResuspend, this));
  },
  /**
   * @function
   * @desc Event listener for the button click on [data-id="bt-resuspend"] 재신청 버튼
   */
  _onClickResuspend: function () {
    this._popupService.open({
      hbs: 'MS_03_05_04',
      data: {
        svcInfo: this._svcInfo,
        period: this._params.status.period,
        reason: this._params.reason
      }
    }, $.proxy(this._onOpenResuspendPopup, this), null, 'resuspend');
  },
  /**
   * @function
   * @desc Resuspend(장기일시정지 재신청) 요청
   * @param $popup Resuspend(장기일시정지 재신청) popup element
   */
  _onOpenResuspendPopup: function ($popup) {
    $popup.find('input[type="date"]').val(Tw.DateHelper.getAddDay(null, 'YYYY-MM-DD'));
    $popup.find('#fe-resuspend').on('click', _.debounce($.proxy(this._requestResuspend, this, $popup), 500));
  },
  /**
   * @function
   * @desc Resuspend(장기일시정지 재신청) 요청
   * @param $popup Resuspend(장기일시정지 재신청) popup element
   */
  _requestResuspend: function ($popup) {
    var fromDate = $popup.find('input[type="date"]').val();
    var diff = Tw.DateHelper.getDiffByUnit(fromDate, Tw.DateHelper.getCurrentShortDate(), 'days');
    if ( diff < 0 ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE);
      return;
    } else if ( diff > 30 ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE_01);
      return;
    }

    var params = { fromDt: fromDate.replace(/-/g, '') };
    this._apiService.request(Tw.API_CMD.BFF_05_0151, params)
      .done($.proxy(this._onSuccessResuspend, this, params))
      .fail($.proxy(this._onError, this));
  },
  /**
   * Success callback for _requestResuspend
   * @param params parameters for request API
   * @param res response
   * @private
   */
  _onSuccessResuspend: function (params, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      params.command = 'resuspend';
      params.svcNum = this._svcInfo.svcNum;
      params.toDt = this._params.status.period.to;
      this._popupService.closeAllAndGo('/myt-join/submain/suspend/complete?' + $.param(params));
    } else if ( res.code in Tw.MYT_JOIN_SUSPEND.ERROR ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ERROR[res.code] || res.msg);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  /**
   * @function
   * @desc Event listener for the button click on #bt-cancel-resuspend(재신청 취소)
   */
  _onClickCancelResuspend: function () {
    this._popupService.open({
      hbs: 'MS_03_05_06',
      data: {
        svcInfo: this._svcInfo,
        period: this._params.status.period,
        resuspend: this._params.status.resuspendDt
      }
    }, $.proxy(this._onOpenCancelResuspendPopup, this), null, 'cancelResuspend');
  },
  /**
   * @function
   * @desc Cancel resuspend(재신청 취소) 요청
   * @param $popup Cancel resuspend(재신청 취소) popup element
   */
  _onOpenCancelResuspendPopup: function ($popup) {
    $popup.find('#fe-reset').on('click', _.debounce($.proxy(this._requestCancelResuspend, this, $popup), 500));
  },
  /**
   * @function
   * @desc Cancel resuspend(재신청 취소) 요청
   */
  _requestCancelResuspend: function () {
    var params = { isReserveCancel: 'Y' };
    this._apiService.request(Tw.API_CMD.BFF_05_0151, params)
      .done($.proxy(this._onSuccessRequestCancel, this, params))
      .fail($.proxy(this._onError, this));
  },
  /**
   * @function
   * @desc Success callback for _requestCancelResuspend
   * @param params parameters for request API
   * @param res response
   * @private
   */
  _onSuccessRequestCancel: function (params, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      params.command = 'cancel-resuspend';
      params.svcInfo = this._svcInfo.svcNum;
      this._popupService.closeAllAndGo('/myt-join/submain/suspend/complete?' + $.param(params));
    } else if ( res.code in Tw.MYT_JOIN_SUSPEND.ERROR ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ERROR[res.code] || res.msg);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  // Reset(해제하기)
  /**
   * @function
   * @desc Event listener for the button click on [data-id="bt-reset"](해제하기)
   */
  _onClickReset: function () {
    this._popupService.open({
      hbs: 'MS_03_05_05',
      data: {
        svcInfo: this._svcInfo,
        period: this._params.status.period,
        reason: this._params.status.reason,
        longterm: this._params.status.type === 'long-term'
      }
    }, $.proxy(this._onOpenResetPopup, this), null, 'reset');
  },
  /**
   * @function
   * @desc Reset(해제하기) 요청
   * @param $popup Reset(해제하기) popup element
   */
  _onOpenResetPopup: function ($popup) {
    $popup.on('click', '#fe-reset', _.debounce($.proxy(this._requestReset, this), 500));
  },
  /**
   * @function
   * @desc Reset(해제하기) 요청
   */
  _requestReset: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0152, {})
      .done($.proxy(this._onSuccessRequestReset, this))
      .fail($.proxy(this._onError, this));
  },
  /**
   * @function
   * @desc Success callback for _requestReset
   * @param res response
   * @private
   */
  _onSuccessRequestReset: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      // update svcInfo
      this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
      this._popupService.closeAllAndGo('/myt-join/submain/suspend/complete?' + $.param({ command: 'reset' }));
    } else if ( res.code in Tw.MYT_JOIN_SUSPEND.ERROR ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ERROR[res.code] || res.msg);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  /**
   * @function
   * @desc SvcInfo 요청
   */
  _getSvcInfo: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successSvcInfo, this))
      .fail($.proxy(this._onError, this));
  },
  /**
   * @function
   * @desc Success callback for _getSvcInfo
   * @param resp
   * @private
   */
  _successSvcInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcInfo = _.clone(resp.result);
      this._svcInfo.svcNum = Tw.FormatHelper.getDashedCellPhoneNumber(this._svcInfo.svcNum.replace(/-/g, ''));
      this._bindEvent();
    }
  },

  ///// file uploading
  // Open the suspend upload file popup
  /**
   * @function
   * @desc Event listener for the button click on '#fe-reattach-files(파일 첨부하기)
   */
  _onClickAttachFiles: function () {
    var popup = {};
    var count = 0;

    if ( this._params.progress.receiveCd === '5000341' || this._params.progress.receiveCd === '5000342' ) {
      popup = {
        content: Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TIP,
        title: Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TITLE,
        hash: 'tip'
      };
      count = 2;
    } else {
      popup = {
        content: Tw.MYT_JOIN_SUSPEND.LONG.ABROAD.TIP,
        title: Tw.MYT_JOIN_SUSPEND.LONG.ABROAD.TITLE,
        hash: 'tip'
      };
      count = 1;
    }
    this._openCommonFileDialog(count, popup);
  },
  /**
   * @function
   * @desc 파일업로드 다이얼로그 Open
   * @param count 파일 첨부 갯수
   * @param popup 파일 업로드 다이얼로그 element
   */
  _openCommonFileDialog: function (count, popup) {
    if ( !this._fileDialog ) {
      this._fileDialog = new Tw.MytJoinSuspendUpload();
    }

    this._fileDialog.show($.proxy(this._onCommonFileDialogConfirmed, this), count, this._files, null, popup);
  },
  /**
   * @function
   * @desc 파일업로드 다이얼로그 Callback function
   * @param files 업로드 된 파일
   */
  _onCommonFileDialogConfirmed: function (files) {
    this._files = files;
    if ( Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid() ) {
      var convFileList = _.compact(this._files).map(function (item) {
        return {
          fileSize: item.size,
          fileName: item.name,
          filePath: item.path
        };
      });
      this._requestUscan(convFileList);
    } else {
      this._requestUpload(this._files);
    }
  },
  /**
   * @function
   * @desc 파일 업로드 요청
   * @param files
   */
  _requestUpload: function (files) {
    var formData = new FormData();
    formData.append('dest', Tw.UPLOAD_TYPE.SUSPEND);
    _.map(files, $.proxy(function (file) {
      formData.append('file', file);
    }, this));
    this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData)
      .done($.proxy(this._successUploadFile, this))
      .fail($.proxy(this._onError, this));
  },
  /**
   * @function
   * @desc Success callback for _requestUpload
   * @param res response
   * @private
   */
  _successUploadFile: function (res) {
    // USCAN upload
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var convFileList = res.result.map(function (item) {
        return {
          fileSize: item.size,
          fileName: item.name,
          filePath: item.path
        };
      });

      this._requestUscan(convFileList);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  /**
   * @function
   * @desc USCAN 요청
   * @param convFileList
   * @private
   */
  _requestUscan: function (convFileList) {
    this._apiService.request(Tw.API_CMD.BFF_01_0046, {
      recvFaxNum: 'skt257@sk.com',
      proMemo: '', // TBD 필수값임 확인필요
      scanFiles: convFileList
    })
      .done($.proxy(this._onSuccessUscanUpload, this))
      .fail($.proxy(this._onError, this));
  },
  /**
   * @function
   * @desc Success call back for _requestUscan
   * @param res
   */
  _onSuccessUscanUpload: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._requestReupload();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  // 파일 재첨부
  /**
   * @function
   * @desc 파일재첨부 요청
   */
  _requestReupload: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0195, {
      seq: this._params.progress.seq
    })
      .done($.proxy(this._onSuccessReupload, this))
      .fail($.proxy(this._onError, this));
  },
  /**
   * @function
   * @desc Success call back for _requestReupload
   * @param res
   */
  _onSuccessReupload: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  /**
   * @function
   * @desc Error call back
   * @param res
   */
  _onError: function (res) {
    Tw.Error(res.code, res.msg).pop();
  },
  /**
   * @function
   * @desc  파일 업로드 지원 가능 버젼(4.4 이상) 체크
   * @returns {*|boolean}
   */
  _isLowerVersionAndroid: function () {
    var androidVersion = Tw.BrowserHelper.getAndroidVersion();
    return androidVersion && androidVersion.indexOf('4.4') !== -1;
  }
};