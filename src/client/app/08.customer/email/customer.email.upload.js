/**
 * FileName: customer.email.upload.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.16
 */

Tw.CustomerEmailUpload = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
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
    this.$container.on('click', 'input[type=file]', $.proxy(this._openCustomFileChooser, this));
    this.$container.on('click', '.fe-file-delete', $.proxy(this._removeFile, this));
    this.$container.on('click', '.fe-close-upload', $.proxy(this._hideUploadPopup, this));
    this.$container.on('click', '.fe-upload_email_files', $.proxy(this._uploadFile, this));
    this.$container.on('click', '.fe-upload-file-service', $.proxy(this._onClickServiceUpload, this));
    this.$container.on('click', '.fe-upload-file-quality', $.proxy(this._onClickQualityUpload, this));
    this.$container.on('change', '.fe-wrap-file-upload input.file', $.proxy(this._inputFileChooser, this));
  },

  _openCustomFileChooser: function (e) {
    var $target = $(e.currentTarget);

    if ( Tw.BrowserHelper.isAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.OPEN_FILE_CHOOSER, {
        dest: 'email',
        acceptExt: this._acceptExt,
        limitSize: this._limitFileByteSize
      }, $.proxy(this._nativeFileChooser, this, $target));
    }
  },

  _nativeFileChooser: function ($target, response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      var fileInfo = params.fileData.result[0];

      if ( fileInfo ) {
        var $elFileName = $target.parent().parent().find('.fileview');
        $elFileName.val(fileInfo.originalName);
      }

      this.uploadFiles = this.uploadFiles.concat(fileInfo);

      this._showUploadPopup();
      this._checkUploadButton();

    } else if ( response.resultCode === Tw.NTV_CODE.CODE_01 ) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE);
    } else if ( response.resultCode === Tw.NTV_CODE.CODE_02 ) {
      return this._popupService.openAlert(Tw.CUSTOMER_EMAIL.INVALID_FILE, Tw.POPUP_TITLE.NOTIFY);
    } else {
      return this._popupService.openAlert(Tw.CUSTOMER_EMAIL.INVALID_FILE, Tw.POPUP_TITLE.NOTIFY);
    }
  },

  _inputFileChooser: function (e) {
    var $target = $(e.currentTarget);
    var fileInfo = $target.prop('files').item(0);

    if ( this._acceptExt.indexOf(fileInfo.name.split('.').pop()) === -1 ) {
      this._showUploadPopup();
      return this._popupService.openAlert(Tw.CUSTOMER_EMAIL.INVALID_FILE, Tw.POPUP_TITLE.NOTIFY);
    }

    if ( fileInfo.size > this._limitFileByteSize ) {
      this._showUploadPopup();
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG);
    }

    if ( fileInfo ) {
      var $elFileName = $target.parent().parent().find('.fileview');
      $elFileName.val(fileInfo.name);
    }

    this.uploadFiles = this.uploadFiles.concat(fileInfo);

    this._showUploadPopup();
    this._checkUploadButton();
  },

  _uploadFile: function () {
    if ( this._isLowerVersionAndroid() ) {
      this._successUploadFile();
    } else {
      var uploadQueue = [];

      var fnMakeUploadForm = function (file) {
        var formData = new FormData();
        formData.append('dest', Tw.UPLOAD_TYPE.EMAIL);
        formData.append('file', file);

        uploadQueue.push(this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData));
      };

      this.uploadFiles.map($.proxy(fnMakeUploadForm, this));

      var fnSuccessUpload = function () {
        var fileList = Array.from(arguments);
        var res = { code: Tw.API_CODE.CODE_00, result: [] };

        if ( fileList.indexOf('success') !== -1 ) {
          res.result = res.result.concat(fileList[0].result);
        } else {
          for ( var i = 0; i < fileList.length; i++ ) {
            res.result = res.result.concat(fileList[i][0].result);
          }
        }

        this._successUploadFile(res);
      };

      if ( uploadQueue.length === 1 ) {
        uploadQueue[0].done($.proxy(fnSuccessUpload, this));
      } else {
        $.when.apply($, uploadQueue).done($.proxy(fnSuccessUpload, this));
      }
    }
  },

  _showUploadPopup: function () {
    this._hideUploadPopup();
    this.$container.append(this.tpl_upload_file({ uploadFiles: this.uploadFiles }));

    this._checkUploadButton();
  },

  _onClickServiceUpload: function () {
    if ( !Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid() ) {
      // Not Supported File Upload
      this._popupService.openAlert(Tw.CUSTOMER_EMAIL.NOT_SUPPORT_FILE_UPLOAD);
      return false;
    }

    this.uploadFiles = this.serviceUploadFiles.slice(0);
    this._showUploadPopup();
  },

  _onClickQualityUpload: function () {
    if ( !Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid() ) {
      // Not Supported File Upload
      this._popupService.openAlert(Tw.CUSTOMER_EMAIL.NOT_SUPPORT_FILE_UPLOAD);
      return false;
    }

    this.uploadFiles = this.qualityUploadFiles.slice(0);
    this._showUploadPopup();
  },

  _hideUploadPopup: function () {
    $('.fe-wrap-file-upload').remove();
  },

  _successUploadFile: function (res) {
    this._hideUploadPopup();

    if ( res.code === Tw.API_CODE.CODE_00 || this._isLowerVersionAndroid() ) {
      if ( this._getCurrentType() === 'service' ) {
        this.serviceUploadFiles = this.uploadFiles.slice(0);
        if ( this._isLowerVersionAndroid() ) {
          this.wrap_service.find('.filename-list').html(this.tpl_upload_list({ files: this.serviceUploadFiles }));
        } else {
          this.wrap_service.find('.filename-list').html(this.tpl_upload_list({ files: res.result }));
        }

        if ( this.uploadFiles.length >= 5 ) {
          $('.fe-upload-file-service').prop('disabled', true);
        } else {
          $('.fe-upload-file-service').prop('disabled', false);
        }
      } else {
        this.qualityUploadFiles = this.uploadFiles.slice(0);

        if ( this._isLowerVersionAndroid() ) {
          this.wrap_quality.find('.filename-list').html(this.tpl_upload_list({ files: this.qualityUploadFiles }));
        } else {
          this.wrap_quality.find('.filename-list').html(this.tpl_upload_list({ files: res.result }));
        }

        if ( this.uploadFiles.length >= 5 ) {
          $('.fe-upload-file-quality').prop('disabled', true);
        } else {
          $('.fe-upload-file-quality').prop('disabled', false);
        }
      }
    } else {
      Tw.Error(res.code, res.msg).pop();
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
  },

  _isLowerVersionAndroid: function () {
    var androidVersion = Tw.BrowserHelper.getAndroidVersion();

    return androidVersion && androidVersion.indexOf('4.4') !== -1;
  }
};

