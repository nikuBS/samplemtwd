/**
 * FileName: customer.email.upload.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.08.14
 */

Tw.CustomerEmailUpload = function (rootEl, oEmailTemplate) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._oEmailTemplate = oEmailTemplate;

  this._cachedElement();
  this._bindEvent();
  this._init();

  this.$inputFile = null;
  this.$btUpload = null;
};

Tw.CustomerEmailUpload.prototype = {
  _init: function () {},

  _cachedElement: function () {
    this.tpl_file_item = Handlebars.compile($('#tpl_file_item').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-upload-file', $.proxy(this._showUploadPopup, this));
    this.$container.on('click', '.fe-delete-file', $.proxy(this._removeFile, this));
  },

  _showUploadPopup: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.open({
      hbs: 'file',
      title: Tw.POPUP_TITLE.UPLOAD_FILE,
      inputfile_num: [
        { 'attr': 'name="file" accept="image/*, .hwp, .doc, .docx"' },
        { 'attr': 'name="file" accept="image/*, .hwp, .doc, .docx"' },
        { 'attr': 'name="file" accept="image/*, .hwp, .doc, .docx"' },
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
    $popupContainer.on('click', '.fe-upload-multi-cancel', $.proxy(this._cancelUploadMulti, this));
    $popupContainer.on('click', '.fe-upload-multi-confirm', $.proxy(this._confirmUploadMulti, this));

    this.$btUpload = $popupContainer.find('.fe-upload-multi-confirm > button');
    this.$inputFile = $popupContainer.find('input[name=file]');
    this.$inputFile.on('change', $.proxy(this._onChangeFile, this));
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
      this._popupService.openAlert(Tw.MSG_CUSTOMER.EMAIL_A05);
      return false;
    }
    // TODO ADD extension validation
    // this._popupService.openAlert(Tw.MSG_CUSTOMER.EMAIL_A06);
    return true;
  },

  _checkEnableConfirm: function () {
    _.map(this.$inputFile, $.proxy(function (file) {
      if ( file.files.length !== 0 ) {
        this.$btUpload.attr('disabled', false);
      }
    }, this));
  },

  _confirmUploadMulti: function () {
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

  _successUploadFile: function (response) {
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

    this._popupService.close();
  },

  _failUploadFile: function (err) {
    console.log(err);
  },

  _removeFile: function (e) {
    $(e.currentTarget).closest('li').remove();
  },

  _disableUploadButton: function () {
    var nMaxFileListSize = 5;

    if ( $('.file-addlist').find('li').size() >= nMaxFileListSize ) {
      $('.fe-upload-file').prop('disabled', true);
    } else {
      $('.fe-upload-file').prop('disabled', false);
    }
  }
};