/**
 * FileName: myt-join.suspend.upload.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 11. 15.
 */
Tw.MytJoinSuspendUpload = function () {
  this._popupService = new Tw.PopupService();
};
Tw.MytJoinSuspendUpload.DEFAULT_FILE = { 'attr': 'name="file" accept="image/*, .hwp, .doc, .docx"' };
Tw.MytJoinSuspendUpload.prototype = {
  show: function (callback, fileCount, oldFiles, fileInfo) {
    this._showUploadTip();
    this._callback = callback;
    this._fileCount = fileCount || 1;
    this._fileInfo = fileInfo || new Array(this._fileCount);
    oldFiles = oldFiles || [];
    this._fileInfo = _.map(this._fileInfo, function (info, idx) {
      return _.defaults(info, Tw.MytJoinSuspendUpload.DEFAULT_FILE, { oldFile: oldFiles[idx] });
    });
  },
  _showUploadTip: function () {
    this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TIP, Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TITLE, null,
      $.proxy(this._showUploadPopup, this));
  },

  _showUploadPopup: function () {
    console.log(this._fileInfo);
    this._popupService.open({
      hbs: 'CS_04_01_L02',
      inputfile_num: this._fileInfo,
      warning_msg: [
        { 'txt': Tw.UPLOAD_FILE.WARNING_A01, 'point': '' },
        { 'txt': Tw.UPLOAD_FILE.WARNING_A02, 'point': '' },
        { 'txt': Tw.UPLOAD_FILE.WARNING_A03, 'point': 'bold' }
      ]

    }, $.proxy(this._openUploadFile, this), $.proxy(this._reset, this), 'upload');
  },

  _openUploadFile: function ($popupContainer) {
    this.$btUpload = $popupContainer.find('#fe-upload-ok');
    this.$inputFile = $popupContainer.find('input.file');
    this.$btFile = $popupContainer.find('.fe-file-button');
    this.$inputFile.on('change', $.proxy(this._onChangeFile, this));
    this.$btUpload.on('click', $.proxy(this._onClickOk, this));
    this.$btFile.on('click', $.proxy(this._onClickFileButton, this));
    this.$btUpload.attr('disabled', true);
  },

  _reset: function () {
    this.$inputFile.off('change');
    this.$btUpload.off('click');
    this.$btFile.off('click');
    this.$inputFile = null;
    this.$btUpload = null;
    this.$inputFile = null;
    this.$popupContainer = null;
  },

  _onChangeFile: function (event) {
    var currentFile = event.currentTarget;
    var file = currentFile.files;
    if ( file.length !== 0 ) {
      var $inputBox = $(currentFile).parents('.inputbox');
      if ( !this._validateFile(file[0]) ) {
        $(currentFile).val('');
        this._setFileButton($inputBox, true);
      } else {
        this._setFileButton($inputBox, false);
      }
    }

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
    if ( this._callback ) {
      var uploadFile = [];
      this.$inputFile.each(function () {
        if ( this.files.length !== 0 ) {
          uploadFile.push(this.files[0]);
        }
      });
      this._callback(uploadFile);
    }
    this._popupService.close();
  },

  _onClickFileButton: function (e) {
    var $btFile = $(e.target);
    var $inputBox = $btFile.parents('.inputbox');
    this._setFileButton($inputBox, true);
  },

  _setFileButton($inputBox, addable) {
    if ( addable ) {
      $inputBox.find('input.fileview').val('');
      $inputBox.find('input.file').prop('files', null);
      $inputBox.find('input.file').removeAttr('disabled').css('pointer-events', 'all');
      $inputBox.find('.fe-file-button').text(Tw.UPLOAD_FILE.BUTTON_ADD);
    } else {
      $inputBox.find('input.file').attr('disabled', '').css('pointer-events', 'none');
      $inputBox.find('.fe-file-button').text(Tw.UPLOAD_FILE.BUTTON_DELETE);
    }
    this._checkEnableConfirm();
  },

  _checkEnableConfirm: function () {
    var self = this;
    var disable = this.$inputFile.filter('[disabled]').length === this._fileCount ? false : true;
    self.$btUpload.attr('disabled', disable);
  }
};