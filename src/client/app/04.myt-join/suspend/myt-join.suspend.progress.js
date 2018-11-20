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
  //
  // _onClickAttachFiles: function () {
  //   this._popupService.open({
  //     hbs: 'MS_03_05_03_01_L01',
  //     data: {}
  //   }, $.proxy(this._onOpenUploadPopup, this), null, 'upload');
  // },

  // _onOpenUploadPopup: function ($popup) {
  //   $popup.find('#fe-file-dialog').on('click', $.proxy(this._onClickAttachFiles, this, $popup));
  // },

  // Open the suspend upload file popup
  _onClickAttachFiles: function () {
    // TODO reasonCd로 대체
    var data = {};
    if(this._params.suspend.reason === '군입대') {
      data.desc = Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.UPLOAD_DESC;
      data.count = 2;
    } else {
      data.desc = Tw.MYT_JOIN_SUSPEND.LONG.ABROAD.UPLOAD_DESC;
      data.count = 1;
    }

    this._popupService.open({
      hbs: 'MS_03_05_03_01_L01',
      data: data
    }, $.proxy(this._onOpenReattachFilePopup, this), null, 'resuspend');
  },

  _onOpenReattachFilePopup: function ($popup) {
    $popup.find('#fe-request-upload').on('click', $.proxy(this._requestUpload, this, $popup));
    $popup.find('.fe-file-dialog').on('click', $.proxy(this._openCommonFileDialog, this));
  },

  _openCommonFileDialog: function(e){
    e.preventDefault();
    e.stopPropagation();
    if(!this._fileDialog) {
      this._fileDialog = new Tw.MytJoinSuspendUpload($.proxy(this._onCommonFileDialogConfirmed, this), 2);
    }
    this._fileDialog.show();
  },

  _onCommonFileDialogConfirmed: function(files){
    this._files = files;
  },

  _requestUpload: function () {
    var formData = new FormData();
    _.map(this.$inputFile, $.proxy(function (file) {
      if ( file.files.length !== 0 ) {
        formData.append('file', file.files[0]);
      }
    }, this));

    this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData)
      .done($.proxy(this._successUploadFile, this))
      .fail($.proxy(this._failUploadFile, this));
  },

  _onError: function (res) {
    Tw.Error(res.code, res.msg).pop();
  }

};