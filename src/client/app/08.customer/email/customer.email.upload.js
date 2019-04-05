/**
 * @file customer.email.upload.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.11.16
 */

Tw.CustomerEmailUpload = function (rootEl, data) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._history = new Tw.HistoryService();
  this._limitFileByteSize = 2097152;
  this._acceptExt = ['jpg', 'jpeg', 'png', 'gif'];

this._init(data);
  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerEmailUpload.prototype = {
  uploadFiles: [],
  serviceUploadFiles: [],
  qualityUploadFiles: [],

  _init: function (data) {
    this.userAgent = data.userAgent;
    this.isAndroid = Tw.BrowserHelper.isAndroid();
    this.isLimitUpload = !Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid(); // 모웹이고(앱은제외) 안드4.4 면 업로드 제한
  },

  _cachedElement: function () {
    this.tpl_upload_list = Handlebars.compile($('#tpl_upload_list').html());
    this.wrap_service = $('#tab1-tab');
    this.wrap_quality = $('#tab2-tab');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-upload-file-service', $.proxy(this._openUploadPage, this, 'service')); // 서비스 파일 첨부하기 버튼
    this.$container.on('click', '.fe-upload-file-quality', $.proxy(this._openUploadPage, this, 'quality')); // 통화품질 파일 첨부하기 버튼
    this.$container.on('click', 'input[type=file]', $.proxy(this._openCustomFileChooser, this)); // 파일 input 클릭시
    this.$container.on('change', 'input[type=file]', $.proxy(this._inputFileChooser, this)); // 파일 input 변경 시 
    this.$container.on('click', '.fe-file-button', $.proxy(this._handleFileBtnClick, this)); // 파일첨부 / 파일삭제 버튼 클릭시 
    this.$container.on('click', '#fe-upload-ok', $.proxy(this._applyFiles, this)); // 적용하기 버튼
    this.wrap_service.on('click', '.fe-remove-file', $.proxy(this._removeFileList, this, 'service'));
    this.wrap_quality.on('click', '.fe-remove-file', $.proxy(this._removeFileList, this, 'quality'));
    // 초기화
    this.$container.on('initUploadFiles', $.proxy(this.initFiles, this));
  },

  // 초기화
  initFiles: function () {
    this.uploadFiles = [];
    this.serviceUploadFiles = [];
    this.qualityUploadFiles = [];
  },

  // 파일 업로드 열기 
  _openUploadPage: function (type, e) {
    if (this.isLimitUpload) {
      // Not Supported File Upload
      // this._popupService.openAlert(Tw.CUSTOMER_EMAIL.NOT_SUPPORT_FILE_UPLOAD);
      // 업로드 비지원 안내 팝업
      return this._popupService.open({
        hbs: 'popup',// hbs의 파일명
        title: '',
        title_type: 'sub',
        cont_align: 'tl',
        contents: Tw.CUSTOMER_EMAIL.NOT_SUPPORT_FILE_UPLOAD,
        bt_b: [{
          style_class: 'bt-red1 pos-right tw-popup-closeBtn',
          txt: Tw.BUTTON_LABEL.CONFIRM
        }]
      }, $.proxy(this._bindAlertPopupClose, this), null, null, $(e.currentTarget));      
    } else {
      this.uploadFiles = (type === 'service' ? this.serviceUploadFiles.slice(0) : this.qualityUploadFiles.slice(0)) ;
      return this._popupService.open({
          hbs: 'CS_04_01_L02',
          inputfile_num: this._getFiles(this.uploadFiles),
          warning_msg: [
            { 'txt': Tw.UPLOAD_FILE.EMAILINFO_01, 'point': '' },
            { 'txt': Tw.UPLOAD_FILE.EMAILINFO_02, 'point': '' },
            { 'txt': Tw.UPLOAD_FILE.EMAILINFO_03, 'point': '' },
          ]
        }, 
        $.proxy(this._handleCallback, this), 
        null, 
        'FileUpload',
        $(e.currentTarget)
      );
    }
  },

  _handleCallback: function ($temp) {
    this.$uploadPage = $temp;
    this._checkUploadButton();
  },

  // 업로드 팝업 열릴 때 5개 미만이면 배열 채워 넣음
  _getFiles: function (arr) {
    var fileNum = 5;
    var result_arr = [];
    var fileObj = null;
    if (arr.length < fileNum) {
      for (var i = 0; i< fileNum; i++) {
        fileObj = arr[i];        
        if (fileObj) {
          result_arr[i] = $.extend(fileObj, {
            oldFile: {name: fileObj.name}
          });
        } else {
          result_arr[i] = null;
        }
      }
    } else {
      result_arr = arr;
    }
    return result_arr;
  },

  _handleFileBtnClick: function (e) {
    var fileIdx = $(e.currentTarget).parentsUntil('.file-wrap').last().index();
    if ( this.uploadFiles[fileIdx] ) {
      // 삭제하기
      this._removeFile(fileIdx);
    } else {
      // 추가하기
      this._openUploadPage()
    }
  },

  // 파일첨부하기 
  _openCustomFileChooser: function (e) {
    var $target = $(e.currentTarget);
    // 저버전 안드로이드일경우
    if ( this._isLowerVersionAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.OPEN_FILE_CHOOSER, {
        dest: 'email',
        acceptExt: this._acceptExt,
        limitSize: this._limitFileByteSize
      }, $.proxy(this._nativeFileChooser, this, $target));
    }
  },

  // 안드로이드 파일 첨부 완료시
  _nativeFileChooser: function ($target, response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      var fileInfo = params.fileData.result[0];

      this.uploadFiles = this.uploadFiles.concat(fileInfo);

      this._handlebarUpdate(); // 팝업 업데이트

    } else {
      $target.val('');
      this._handlebarUpdate();

      if ( response.resultCode === Tw.NTV_CODE.CODE_01 ) {
        return this._popupService.openAlert(
          Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE, 
          Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG, null, null, null,
          $target
        );
      } else if ( response.resultCode === Tw.NTV_CODE.CODE_02 ) {
        return this._popupService.openAlert(
          Tw.CUSTOMER_EMAIL.INVALID_FILE, 
          Tw.POPUP_TITLE.NOTIFY,
          null, null, null, 
          $target
        );
      } else {
        return this._popupService.openAlert(
          Tw.CUSTOMER_EMAIL.INVALID_FILE, 
          Tw.POPUP_TITLE.NOTIFY,
          null, null, null,
          $target
        );
      }
    }
  },

  // 파일 input change
  _inputFileChooser: function (e) {
    var $target = $(e.currentTarget);
    var fileInfo = $target.prop('files').item(0);
    
    if ( this._acceptExt.indexOf(fileInfo.name.split('.').pop()) === -1 ) {
      $target.val('');
      this._handlebarUpdate();
      return this._popupService.openAlert(Tw.CUSTOMER_EMAIL.INVALID_FILE, Tw.POPUP_TITLE.NOTIFY);
    }

    if ( fileInfo.size > this._limitFileByteSize ) {
      $target.val('');
      this._handlebarUpdate();
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG);
    }

    this.uploadFiles = this.uploadFiles.concat(fileInfo);

    this._handlebarUpdate();
  },


  // 파일업로드 업데이트
  _handlebarUpdate: function () {
    this.$uploadPage.find('.widget-box.file').each($.proxy(function(index, box){
      if ( this.uploadFiles[index] ) {        
        $(box).find('.fileview').val(this.uploadFiles[index].name);
        $(box).find('input[type=file]').css('pointer-events', 'none').prop('disabled', true);
        $(box).find('.fe-file-button').text(Tw.UPLOAD_FILE.BUTTON_DELETE);
      } else {
        $(box).find('.fileview').val('');
        $(box).find('input[type=file]').val('').css('pointer-events', 'inherit').prop('disabled', false);
        $(box).find('.fe-file-button').text(Tw.UPLOAD_FILE.BUTTON_ADD);
      }
    }, this));

    this._checkUploadButton();

  },

  // 삭제하기 버튼 클릭 (팝업)
  _removeFile: function (idx) {
    this.uploadFiles.splice(idx, 1);
    this._handlebarUpdate();
  },

  
  // 적용하기
  _applyFiles: function () {
    if ( this._getCurrentType() === 'service' ) { 
      // 파일 변수 저장
      this.serviceUploadFiles = this.uploadFiles.slice(0);
      // 템플릿 적용
      this.wrap_service.find('.filename-list').html(this.tpl_upload_list({ 
        files: this.serviceUploadFiles
      }));
      // 버튼 비활성화 표기
      this._setFileBtnExpress($('.fe-upload-file-service'), this.uploadFiles.length);
    } else {
      // 파일 변수 저장
      this.qualityUploadFiles = this.uploadFiles.slice(0);
      // 템플릿 적용
      this.wrap_quality.find('.filename-list').html(this.tpl_upload_list({ 
        files: this.qualityUploadFiles
      }));
      // 버튼 비활성화 표기
      this._setFileBtnExpress($('.fe-upload-file-quality'), this.uploadFiles.length);
    }

    this._popupService.close();
  },

  // 서비스 파일 첨부 반환
  getServiceFilesInfo: function () {
    return this.serviceUploadFiles;
  },

  // 품질 파일 첨부 반환
  getQualityFilesInfo: function () {
    return this.qualityUploadFiles;
  },

  // 파일 올리기
  uploadFile: function (files, callback) {
    var formData = new FormData();
    formData.append('dest', Tw.UPLOAD_TYPE.EMAIL);
    _.map(files, $.proxy(function (file) {
      formData.append('file', file);
    }));

    this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData)
      .done($.proxy(this._uploadSuccess, this, callback))
      .fail($.proxy(this._onError, this));
  },
  
  
  // 
  _uploadSuccess: function (callback, res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(res.code, res.msg).pop();
    }
    if (typeof callback === 'function') {
      return callback(res);
    }
  },
  
  // 파일첨부하기 버튼 활성화 / 비활성화 
  _setFileBtnExpress: function ($button, num) {
    $button.prop('disabled', (num || this.uploadFiles.length) >= 5);
  },

  // 적용된 각 리스트에서 파일 삭제버튼 클릭 시 
  _removeFileList: function (type, e) {    
    var fileIdx = $(e.currentTarget).parentsUntil('li').last().parent().index();
    if (type === 'service') {
      this.serviceUploadFiles.splice(fileIdx, 1);
      $('.fe-upload-file-service').prop('disabled', false);
    } else {
      this.qualityUploadFiles.splice(fileIdx, 1);
      $('.fe-upload-file-quality').prop('disabled', false);
    }
    this.$container.find('.filename-list li').eq(fileIdx).remove();
  },

  _showUploadPopup: function () {
    if (this.uploadFiles.length) {
      // 파일 첨부된 갯수가 있으면 마지막 줄에 포커스
      this.$container.find('input[type=file]').eq(0).focus();
    } else {
      // 파일 첨부된 갯수가 없으면 팝업 제목에 포커스
      $('.fe-wrap-file-upload').find('h1').attr('tabindex',-1).focus();
    }
  },

  
  _bindAlertPopupClose: function($layer) {
    $layer.on('click', '.tw-popup-closeBtn button', $.proxy(this._execAlertPopupClose, this));
    try {
      $layer.on('touchstart', '.tw-popup-closeBtn button', $.proxy(this._execAlertPopupClose, this));
    } catch (err) {}
  },

  _execAlertPopupClose: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this._popupService.close();
  },

  _checkUploadButton: function () {
    if ( this.uploadFiles.length !== 0 ) {
      this._activeUploadButton();
    } else {
      this._disableUploadButton();
    }
  },
  
  _activeUploadButton: function () {
    $('#fe-upload-ok').prop('disabled', false);
  },

  _disableUploadButton: function () {
    $('#fe-upload-ok').prop('disabled', true);
  },

  _getCurrentType: function () {
    if ( this.wrap_service.attr('aria-selected') === 'true' ) {
      return 'service';
    }
    return 'quality';
  },

  _isLowerVersionAndroid: function () {
    var androidVersion = Tw.BrowserHelper.getAndroidVersion(this.userAgent);

    return androidVersion && androidVersion.indexOf('4.4') !== -1;
  },

  _onError: function(res) {
    return Tw.Error(res.code, res.msg).pop();
  }
};

