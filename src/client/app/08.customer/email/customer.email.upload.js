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
  this._limitFileByteSize = 2097152;
  this._acceptExt = ['jpg', 'jpeg', 'png', 'gif'];

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailUpload.prototype = {
  uploadFiles: [],
  serviceUploadFiles: [],
  qualityUploadFiles: [],

  _init: function () {
  },

  _cachedElement: function () {
    this.tpl_upload_file = Handlebars.compile($('#tpl_upload_file').html());
    this.tpl_upload_list = Handlebars.compile($('#tpl_upload_list').html());
    this.wrap_service = $('#tab1-tab');
    this.wrap_quality = $('#tab2-tab');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-file-delete', $.proxy(this._removeFile, this));
    this.$container.on('click', '.fe-close-upload', $.proxy(this._hideUploadPopup, this));
    this.$container.on('click', '.fe-upload_email_files', $.proxy(this._uploadFile, this));
    this.$container.on('click', '.fe-upload-file-service', $.proxy(this._onClickServiceUpload, this));
    this.$container.on('click', '.fe-upload-file-quality', $.proxy(this._onClickQualityUpload, this));
    this.$container.on('change', '.fe-wrap-file-upload input.file', $.proxy(this._selectFile, this));
  },

  _selectFile: function (e) {
    var $target = $(e.currentTarget);
    var fileInfo = $target.prop('files').item(0);

    if ( this._acceptExt.indexOf(fileInfo.name.split('.').pop()) === -1 ) {
      return this._popupService.openAlert(Tw.CUSTOMER_EMAIL.INVALID_FILE, Tw.POPUP_TITLE.NOTIFY);
    }

    if ( fileInfo.size > this._limitFileByteSize ) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE);
    }

    if ( fileInfo ) {
      var $elFileName = $(e.currentTarget).parent().parent().find('.fileview');
      $elFileName.val(fileInfo.name);
    }

    this.uploadFiles = this.uploadFiles.concat(fileInfo);

    this._showUploadPopup();
    this._checkUploadButton();
  },

  _uploadFile: function () {
    var formData = new FormData();
    formData.append('dest', Tw.UPLOAD_TYPE.EMAIL);

    this.uploadFiles.map(function (file) {
      formData.append('file', file);
    });

    this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData)
      .done($.proxy(this._successUploadFile, this));
  },

  _showUploadPopup: function () {
    this._hideUploadPopup();
    this.$container.append(this.tpl_upload_file({ uploadFiles: this.uploadFiles }));

    this._checkUploadButton();
  },

  _onClickServiceUpload: function () {
    this.uploadFiles = this.serviceUploadFiles.slice(0);
    this._showUploadPopup();
  },

  _onClickQualityUpload: function () {
    this.uploadFiles = this.qualityUploadFiles.slice(0);
    this._showUploadPopup();
  },

  _hideUploadPopup: function () {
    $('.fe-wrap-file-upload').remove();
  },

  _successUploadFile: function (res) {
    this._hideUploadPopup();

    if ( this._getCurrentType() === 'service' ) {
      this.serviceUploadFiles = this.uploadFiles.slice(0);
      this.wrap_service.find('.filename-list').html(this.tpl_upload_list({ files: res.result }));
    } else {
      this.qualityUploadFiles = this.uploadFiles.slice(0);
      this.wrap_quality.find('.filename-list').html(this.tpl_upload_list({ files: res.result }));
    }
  },

  _checkUploadButton: function () {
    if ( this.uploadFiles.length !== 0 ) {
      this._activeUploadButton();
    } else {
      this._disableUploadButton();
    }
  },

  _removeFile: function (e) {
    var elWrapFile = $(e.currentTarget).closest('.inputbox');
    var currentFileIndex = $('.file-wrap .inputbox').index(elWrapFile);

    this.uploadFiles.splice(currentFileIndex, 1);
    this._showUploadPopup();
  },

  _getCurrentType: function () {
    if ( this.wrap_service.attr('aria-selected') === 'true' ) {
      return 'service';
    }

    return 'quality';
  },

  _activeUploadButton: function () {
    $('.fe-upload_email_files').prop('disabled', false);
  },

  _disableUploadButton: function () {
    $('.fe-upload_email_files').prop('disabled', true);
  }
};

