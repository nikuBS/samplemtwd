/**
 * FileName: customer.email.upload.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.16
 */

Tw.CustomerEmailUpload = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailUpload.prototype = {
  uploadFiles: [],
  type: 'service',

  _init: function () {
  },

  _cachedElement: function () {
    this.tpl_upload_file = Handlebars.compile($('#tpl_upload_file').html());
    this.tpl_upload_list = Handlebars.compile($('#tpl_upload_list').html());
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-remove-file', $.proxy(this._removeFile, this));
    this.$container.on('click', '.fe-close-upload', $.proxy(this._hideUploadPopup, this));
    this.$container.on('click', '.fe-upload_email_files', $.proxy(this._uploadFile, this));
    this.$container.on('click', '.fe-upload-file-service', $.proxy(this._showUploadPopup, this, 'service'));
    this.$container.on('click', '.fe-upload-file-quality', $.proxy(this._showUploadPopup, this, 'quality'));
    this.$container.on('change', '.fe-wrap-file-upload input.file', $.proxy(this._selectFile, this));
  },

  _selectFile: function (e) {
    if ( e.currentTarget.files[0] ) {
      var $elFileName = $(e.currentTarget).parent().parent().find('.fileview');
      $elFileName.val(e.currentTarget.files[0].name);
    }

    if ( this.uploadFiles.length > 4 ) {
      this.uploadFiles.pop();
    }

    this.uploadFiles = this.uploadFiles.concat($(e.currentTarget).prop('files')[0]);
  },

  _uploadFile: function (e) {
    var formData = new FormData();
    this.uploadFiles.map(function (file) {
      formData.append('file', file);
    });

    this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData)
      .done($.proxy(this._successUploadFile, this));

    $('.fe-wrap-file-upload').remove();
  },

  _showUploadPopup: function (sType) {
    this.type = sType;
    this.uploadFiles = [];
    this.$container.append(this.tpl_upload_file());
  },

  _hideUploadPopup: function () {
    $('.fe-wrap-file-upload').remove();
  },

  _successUploadFile: function (res) {
    if ( this.type === 'service' ) {
      $('#tab1-tab .filename-list').html(this.tpl_upload_list({ files: res.result }));
    } else {
      $('#tab2-tab .filename-list').html(this.tpl_upload_list({ files: res.result }));
    }
  },

  _removeFile: function (e) {
    $(e.currentTarget).closest('li').remove();
  }
};

