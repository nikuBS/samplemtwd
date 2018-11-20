/**
 * FileName: myt-join.suspend.upload.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 11. 15.
 */
Tw.MytJoinSuspendUpload = function (callback, fileCount) {

  this._popupService = new Tw.PopupService();
  this._callback = callback;
  this._fileCount = fileCount || 1;
  this._fileinfo = Array.apply(null, Array(this._fileCount)).map(function () {
    return Tw.MytJoinSuspendUpload.DEFAULT_FILE;
  });
};
Tw.MytJoinSuspendUpload.DEFAULT_FILE = { 'attr': 'name="file" accept="image/*, .hwp, .doc, .docx"' };
Tw.MytJoinSuspendUpload.prototype = {
  show: function () {
    this._showUploadTip();
  },
  _showUploadTip: function () {
    this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TIP, Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TITLE, null,
      $.proxy(this._showUploadPopup, this));
  },

  _showUploadPopup: function () {
    this._popupService.open({
      hbs: 'file',
      title: Tw.POPUP_TITLE.UPLOAD_FILE,
      inputfile_num: this._fileinfo,
      warning_msg: [
        { 'txt': Tw.UPLOAD_FILE.WARNING_A01, 'point': '' },
        { 'txt': Tw.UPLOAD_FILE.WARNING_A02, 'point': '' },
        { 'txt': Tw.UPLOAD_FILE.WARNING_A03, 'point': 'bold' }
      ],
      bt_num: 'two',
      type: [{
        style_class: 'bt-white2 fe-upload-multi-cancel',
        txt: Tw.BUTTON_LABEL.CANCEL
      }, {
        style_class: 'bt-red1 fe-upload-multi-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._openUploadFile, this), $.proxy(this._reset, this));
  },

  _openUploadFile: function ($popupContainer) {
    $popupContainer.one('click', '.fe-upload-multi-cancel', $.proxy(this._onClickCancel, this));
    $popupContainer.one('click', '.fe-upload-multi-confirm', $.proxy(this._onClickOk, this));

    this.$btUpload = $popupContainer.find('.fe-upload-multi-confirm > button');
    this.$popupInputFile = $popupContainer.find('input[name=file]');
    this.$popupInputFile.on('change', $.proxy(this._onChangeFile, this));
    this.$btUpload.attr('disabled', true);
    this.$inputFile = $popupContainer.find('input.file');
  },

  _reset: function () {
    this.$popupInputFile.off('change');
    this.$inputFile = null;
    this.$btUpload = null;
    this.$popupInputFile = null;
  },

  _onClickCancel: function () {
    this._popupService.close();
  },

  _onChangeFile: function ($event) {
    var $currentFile = $event.currentTarget;
    var file = $currentFile.files;
    if ( file.length !== 0 ) {
      if ( !this._validateFile(file[0]) ) {
        $($currentFile).val('');
      }
    }
    this._checkEnableConfirm();
  },
  _validateFile: function (file) {
    if ( file.size > Tw.MAX_FILE_SIZE ) {
      this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A01);
      return false;
    }
    // file suffix validation.
    if ( !/(.gif|.bmp|.jpg|.jpeg|.png|.doc|.pdf|.hwp|.docx)$/ig.test(file.name) ) {
      this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A03);
      return false;
    }
    return true;
  },
  _onClickOk: function () {
    // this._popupService.close();
    // var self = this;
    // self._uploadFile = [];
    // this.$popupInputFile.each(function( index ) {
    //   if ( this.files.length !== 0 ) {
    //     self._uploadFile.push(this.files[0]);
    //     self.$inputFile.eq(index).val(this.files[0].name);
    //   }
    // });

    if ( this._callback ) {
      var uploadFile = [];
      this.$popupInputFile.each(function () {
        if ( this.files.length !== 0 ) {
          uploadFile.push(this.files[0]);
        }
      });
      this._callback(uploadFile);
    }
    this._popupService.close();
  },

  _checkEnableConfirm: function () {
    var self = this;
    var enable = true;
    _.map(this.$inputFile, $.proxy(function (file) {
      if ( file.files.length === 0 ) {
        enable = false;
      }
    }, this));
    self.$btUpload.attr('disabled', !enable);
  }
};