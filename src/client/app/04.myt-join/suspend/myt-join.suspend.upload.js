/**
 * @file myt-join.suspend.upload.js
 * @author Hyeryoun Lee
 * @since 2018-11-15
 */
/**
 * @class
 * @desc 일시정지신청/현황에서 사용하는 File Upload Dialog
 * @returns {void}
 */
Tw.MytJoinSuspendUpload = function () {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
};
/**
 * @member {Object}
 * @desc Default file attributes
 * @enum {Object}
 * @const
 * @readonly
 */
Tw.MytJoinSuspendUpload.DEFAULT_FILE = { 'attr': 'name="file" accept="image/bmp, image/x-windows-bmp, image/gif, image/jpeg, image/pjpeg, image/png, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf, application/unknown, .bmp, .gif, .jpg, .jpeg, .png, .doc, .docx, .hwp, .pdf"' };
Tw.MytJoinSuspendUpload.prototype = {
  show: function (callback, fileCount, oldFiles, fileInfos, tooltip, $focusEl) {
    oldFiles = oldFiles || [];
    this._callback = callback;
    this._fileCount = fileCount || 1;
    this._acceptExt = ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'hwp', 'pdf'];
    this._fileInfos = _.map(fileInfos || new Array(this._fileCount), function (fileInfo, index) {
      return _.defaults(fileInfo, Tw.MytJoinSuspendUpload.DEFAULT_FILE, { oldFile: oldFiles[index] });
    });
    if ( tooltip ) {
      this._showUploadTip(tooltip, $focusEl);
    } else {
      this._showUploadPopup();
    }
  },
  /**
   * @function
   * @desc 파일 업로드 Dialog 전 툴팁 안내
   * @param tooltip 툴팁 정보(타이틀 , 내용)
   * @param $focusEl 팝업 trigger element(접근성 처리)
   */
  _showUploadTip: function (tooltip, $focusEl) {
    this._popupService.open({
      title: tooltip.title,
      title_type: 'sub',
      cont_align: 'tl',
      contents: tooltip.content,
      bt_b: [{
        style_class: 'bt-blue1 pos-right tw-popup-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, null, $.proxy(this._showUploadPopup, this), tooltip.hash, $focusEl);
  },
  /**
   * @function
   * @desc 파일 업로드 Dialog
   */
  _showUploadPopup: function () {
    // 모바일웹 4.4 버젼은 파일 업로드 미지원
    if ( !Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid() ) {
      // Not Supported File Upload
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_SUPPORT_FILE_UPLOAD);
      return;
    }

    this._popupService.open({
      hbs: 'CS_04_01_L02',
      inputfile_num: this._fileInfos,
      warning_msg: [
        { 'txt': Tw.UPLOAD_FILE.WARNING_A01, 'point': '' },
        { 'txt': Tw.UPLOAD_FILE.WARNING_A03, 'point': '' }
      ]
    }, $.proxy(this._openUploadFile, this), $.proxy(this._reset, this), 'upload');
  },
  /**
   * @function
   * @desc Callback for popup open
   * @param $popupContainer
   */
  _openUploadFile: function ($popupContainer) {
    this.$btUpload = $popupContainer.find('#fe-upload-ok');
    this.$inputFile = $popupContainer.find('input.file');
    this.$btFile = $popupContainer.find('.fe-file-button');
    this.$inputFile.on('change', $.proxy(this._onChangeFile, this));
    this.$btUpload.on('click', $.proxy(this._onClickOk, this));
    this.$btFile.on('click', $.proxy(this._onClickFileButton, this));

    this.$btUpload.attr('disabled', true);

    if ( Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid() ) {
      this.$inputFile.css('display', 'none');
      this._nativeUploaded = [this._fileCount];
    }
  },

  _openCustomFileChooser: function ($target) {
    if ( this._isLowerVersionAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.OPEN_FILE_CHOOSER, {
        dest: 'suspend',
        acceptExt: this._acceptExt,
        limitSize: String(Tw.MAX_UPLOAD_FILE_SIZE)
      }, $.proxy(this._nativeFileChooser, this, $target));
    }
  },

  /**
   * @function
   * @desc 안드로이드 저사양 버젼에서 native file upload 호
   * @param $target
   * @param response
   */
  _nativeFileChooser: function ($target, response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      var fileInfo = params.fileData.result[0];

      if ( fileInfo ) {
        var $elFileName = $target.find('input.fileview');
        $elFileName.val(fileInfo.originalName);
      }
      this._nativeUploaded[$target.data('index')] = fileInfo;
      this._setFileButton($target, false);
    } else if ( response.resultCode === Tw.NTV_CODE.CODE_01 ) {
      this._popupService.openAlert(Tw.UPLOAD_FILE.CONFIRM_A01);
    } else if ( response.resultCode === Tw.NTV_CODE.CODE_02 ) {
      this._popupService.openAlert(Tw.UPLOAD_FILE.CONFIRM_A02);
    }
  },

  _reset: function () {
    this.$inputFile.off('change');
    this.$btUpload.off('click');
    this.$btFile.off('click');
    this.$inputFile = null;
    this.$btUpload = null;
    this.$inputFile = null;
    this.$popupContainer = null;
    // tooltip popup이 남아있는 경우가 있음
    this._popupService.close();
  },
  /**
   * @function
   * @desc Event listener for change on input.file
   * @param event
   */
  _onChangeFile: function (event) {
    var input = event.target;
    var files = input.files;
    if ( files.length !== 0 ) {
      var $input = $(input);
      var $inputBox = $input.closest('.inputbox');
      var file = files[0];
      if ( !this._validateFile(file) ) {
        $input.val('');
        this._setFileButton($inputBox, true);
      } else {
        this._setFileButton($inputBox, false);
      }
    }
  },
  /**
   * @function
   * @desc 사용자 선택 파일 valication check
   * @param file
   * @returns {boolean}
   */
  _validateFile: function (file) {
    if ( file.size > Tw.MAX_UPLOAD_FILE_SIZE ) {
      this._popupService.openAlert(Tw.UPLOAD_FILE.CONFIRM_A01);
      return false;
    }
    // file suffix validation.
    if ( !/\.(bmp|gif|jpg|jpeg|png|doc|docx|hwp|pdf)$/ig.test(file.name) ) {
      this._popupService.openAlert(Tw.UPLOAD_FILE.CONFIRM_A02);
      return false;
    }
    return true;
  },
  /**
   * @function
   * @desc Event listener for the button click on #fe-upload-ok(파일업로드)
   */
  _onClickOk: function () {
    if ( this._callback ) {
      if ( Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid() ) {
        this._callback(this._nativeUploaded, true);
      } else {
        /*
        var files = [];
        this.$inputFile.each(function () {
          if ( this.files.length !== 0 ) {
            files.push(this.files[0]);
          }
        });
        */
        // NOTE: 채워진 File 값만 추려서 보냄 (실제 추릴 필요 없음. this._fileCount를 만족해야 첨부가능하기 때문)
        /*
        var files = _.filter(_.map(this._fileInfos, function (fileInfo) {
          return fileInfo && fileInfo.oldFile;
        }), function (fileInfo) { return !!fileInfo; });
        */
        var files = _.map(this._fileInfos, function (fileInfo) {
          return fileInfo && fileInfo.oldFile;
        });
        this._callback(files);
      }
    }
    this._popupService.close();
  },
  /**
   * @function
   * @desc Event listener for the button click on .fe-file-button(파일찾기/삭제)
   * @param e
   * @private
   */
  _onClickFileButton: function (e) {
    var $btFile = $(e.target);
    var $inputBox = $btFile.parents('.inputbox');
    if ( $inputBox.find('input.file').attr('disabled') ) {// 파일삭제
      // 파일삭제시 input 처리
      this._setFileButton($inputBox, true);
    } else {
      if ( Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid() ) {
        this._openCustomFileChooser($inputBox);
      }
    }
  },
  /**
   * @function
   * @desc  파일 업로드 지원 가능 버젼(4.4 이상) 체크
   * @returns {*|boolean}
   */
  _isLowerVersionAndroid: function () {
    var androidVersion = Tw.BrowserHelper.getAndroidVersion();
    return androidVersion && androidVersion.indexOf('4.4') !== -1;
  },
  /**
   * @function
   * @desc 파일 버튼 타이틀 설정(파일 선택시: 파일삭제)
   * @param $inputBox input element
   * @param addable 파일 선택 여부
   * @private
   */
  _setFileButton: function ($inputBox, addable) {
    var index = $inputBox.attr('data-index');
    var $inputFile = $inputBox.find('input.file');
    var $buttonFile = $inputBox.find('.fe-file-button');
    if ( addable ) {
      delete this._fileInfos[index].oldFile;
      $inputBox.find('input.fileview').val('');
      $inputFile.prop('files', null);
      $inputFile.val('');
      $inputFile.removeAttr('disabled').css('pointer-events', 'all');
      $buttonFile.text(Tw.UPLOAD_FILE.BUTTON_ADD);
    } else {
      this._fileInfos[index].oldFile = $inputFile[0].files[0];
      $inputFile.attr('disabled', '').css('pointer-events', 'none');
      $buttonFile.text(Tw.UPLOAD_FILE.BUTTON_DELETE);
    }
    this._checkEnableConfirm();
  },
  /**
   * @function
   * @desc 완료 조건 체크(파일 업로드 갯수 체크)
   */
  _checkEnableConfirm: function () {
    var disabled = this.$inputFile.filter('[disabled]').length !== this._fileCount;
    this.$btUpload.attr('disabled', disabled);
  }
};
