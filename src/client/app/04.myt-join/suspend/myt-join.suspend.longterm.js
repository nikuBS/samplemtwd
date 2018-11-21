/**
 * FileName: myt-join.suspend.longterm
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 18.
 */
Tw.MyTJoinSuspendLongTerm = function (tabEl) {
  this.$container = tabEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._cachedElement();
  this._bindEvent();
  this.TYPE = {
    MILITARY: 1,
    ABROAD: 2
  };
};

Tw.MyTJoinSuspendLongTerm.prototype = {
  _cachedElement: function () {
    // this.$inputFile = this.$container.find('.fe-file-input');

    this.$optionSuspendAll = this.$container.find('[data-role="fe-suspend-all"]');
    this.$btUpload = this.$container.find('.fe-upload-file');
  },

  _bindEvent: function () {
    // this.$container.on('click', '.fe-upload-file', $.proxy(this._openCommonFileDialog, this));
    // this.$container.on('click', '.fe-delete-file', $.proxy(this._removeFile, this));
    this.$btUpload.on('click', $.proxy(this._openCommonFileDialog, this));
  },

  _openCommonFileDialog: function () {
    var count = 2;
    if ( !this._fileDialog ) {
      this._fileDialog = new Tw.MytJoinSuspendUpload();
    }
    this._fileDialog.show($.proxy(this._onCommonFileDialogConfirmed, this), count);
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