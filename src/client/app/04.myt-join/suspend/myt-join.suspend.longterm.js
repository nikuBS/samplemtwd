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
    this.$inputFile = this.$container.find('.fe-file-input');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-upload-file', $.proxy(this._showUploadTip, this));
    this.$container.on('click', '.fe-delete-file', $.proxy(this._removeFile, this));
  },

  _showUploadTip: function (e) {
    e.preventDefault();
    e.stopPropagation();
    this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TIP, Tw.MYT_JOIN_SUSPEND.LONG.MILITARY.TITLE, null,
      $.proxy(this._showUploadPopup, this));
  },

  _showUploadPopup: function () {
    this._popupService.open({
      hbs: 'file',
      title: Tw.POPUP_TITLE.UPLOAD_FILE,
      inputfile_num: [
        { 'attr': 'name="file" accept="image/*, .hwp, .doc, .docx"' },
        { 'attr': 'name="file" accept="image/*, .hwp, .doc, .docx"' }
      ],
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
    }, $.proxy(this._openUploadFile, this), $.proxy(this._closeUploadFile, this));
  },

  _openUploadFile: function ($popupContainer) {
    $popupContainer.one('click', '.fe-upload-multi-cancel', $.proxy(this._cancelUploadMulti, this));
    $popupContainer.one('click', '.fe-upload-multi-confirm', $.proxy(this._onClickUploadPopupOk, this));

    this.$btUpload = $popupContainer.find('.fe-upload-multi-confirm > button');
    this.$popupInputFile = $popupContainer.find('input[name=file]');
    this.$popupInputFile.on('change', $.proxy(this._onChangeFile, this));
    this.$btUpload.attr('disabled', true);
  },

  _closeUploadFile: function () {

  },

  _cancelUploadMulti: function () {
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

  _checkEnableConfirm: function () {
    _.map(this.$popupInputFile, $.proxy(function (file) {
      if ( file.files.length !== 0 ) {
        this.$btUpload.attr('disabled', false);
      }
    }, this));
  },

  _onClickUploadPopupOk: function(){
    this._popupService.close();
    var self = this;
    self._uploadFile = [];
    this.$popupInputFile.each(function( index ) {
      if ( this.files.length !== 0 ) {
        self._uploadFile.push(this.files[0]);
        self.$inputFile.eq(index).val(this.files[0].name);
      }
    });
  },

  _uploadMultiFile: function () {
    var formData = new FormData();
    this._uploadFile.map($.proxy(function(file){
      formData.append('file', file);
    }, this));
    this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData)
      .done($.proxy(this._successUploadFile, this))
      .fail($.proxy(this._failUploadFile, this));
  },

  _successUploadFile: function (response) {
    if ( response.code === Tw.API_CODE.CODE_00 ) {
      var fileList = response.result.map(function (file) {
        return {
          name: file.name,
          originalName: file.originalName,
          convertData: Tw.FormatHelper.customDataFormat(file.size, Tw.DATA_UNIT.KB, Tw.DATA_UNIT.GB)
        };
      });

      if ( this._oEmailTemplate.state.tabIndex === 0 ) {
        $('#tab1-tab .file-addlist').html(this.tpl_file_item({ list: fileList }));
      }
      if ( this._oEmailTemplate.state.tabIndex === 1 ) {
        $('#tab2-tab .file-addlist').html(this.tpl_file_item({ list: fileList }));
      }
    }

    this._popupService.close();
  },

  _failUploadFile: function (res) {
    Tw.Error(res.status, res.statusText).pop();
  }
};