/**
 * FileName: myt-join.suspend.progress
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 11. 15.
 */

Tw.MyTJoinSuspendProgress = function (rootEl, params) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._params = params;
  this._cachedElement();
  this._bindEvent();
};

Tw.MyTJoinSuspendProgress.prototype = {
  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '#fe-reattach-files', $.proxy(this._onClickAttachFiles, this));
  },

  // Open the suspend upload file popup
  _onClickAttachFiles: function () {
    // TODO reasonCd로 대체
    var data = {};
    if ( this._params.suspend.reason === '군입대' ) {
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
    this._fileDialog.show($.proxy(this._onCommonFileDialogConfirmed, this), count, this._params.suspend.attFileList);
  },

  _onCommonFileDialogConfirmed: function (files) {
    this._files = files;
    this._requestUpload(this._files);
  },

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