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

Tw.MytJoinSuspendUpload.DEFAULT_FILE = { 'attr': 'name="file" accept="image/gif, image/jpeg, image/png, .doc, .docx, .pdf, .hwp, .png"' };
Tw.MytJoinSuspendUpload.prototype = {
  show: function (callback, fileCount, oldFiles, fileInfo, tooltip, $focusEl) {
    this._callback = callback;
    this._fileCount = fileCount || 1;
    this._fileInfo = fileInfo || new Array(this._fileCount);
    oldFiles = oldFiles || [];
    this._acceptExt = ['jpg', 'jpeg', 'png', 'docx', 'doc', 'pdf', 'hwp'];
    this._fileInfo = _.map(this._fileInfo, function (info, idx) {
      return _.defaults(info, Tw.MytJoinSuspendUpload.DEFAULT_FILE, { oldFile: oldFiles[idx] });
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
      inputfile_num: this._fileInfo,
      warning_msg: [
        { 'txt': Tw.UPLOAD_FILE.WARNING_A01, 'point': '' },
        { 'txt': Tw.UPLOAD_FILE.WARNING_A03, 'point': 'bold' }
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
        limitSize: Tw.MAX_FILE_SIZE.toString()
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
  /**
   * @function
   * @desc 사용자 선택 파일 valication check
   * @param file
   * @returns {boolean}
   */
  _validateFile: function (file) {
    if ( file.size > Tw.MAX_FILE_SIZE ) {
      this._popupService.openAlert(Tw.UPLOAD_FILE.CONFIRM_A01);
      return false;
    }
    // file suffix validation.
    if ( !/(.gif|.bmp|.jpg|.jpeg|.doc|.pdf|.hwp|.docx|.png)$/ig.test(file.name) ) {
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
        var uploadFile = [];
        this.$inputFile.each(function () {
          if ( this.files.length !== 0 ) {
            uploadFile.push(this.files[0]);
          }
        });
        this._callback(uploadFile);
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
    if ( addable ) {
      $inputBox.find('input.fileview').val('');
      $inputBox.find('input.file').prop('files', null);
      $inputBox.find('input.file').val('');
      $inputBox.find('input.file').removeAttr('disabled').css('pointer-events', 'all');
      $inputBox.find('.fe-file-button').text(Tw.UPLOAD_FILE.BUTTON_ADD);
    } else {
      $inputBox.find('input.file').attr('disabled', '').css('pointer-events', 'none');
      $inputBox.find('.fe-file-button').text(Tw.UPLOAD_FILE.BUTTON_DELETE);
    }
    this._checkEnableConfirm();
  },
  /**
   * @function
   * @desc 완료 조건 체크(파일 업로드 갯수 체크)
   */
  _checkEnableConfirm: function () {
    var self = this;
    var disable = this.$inputFile.filter('[disabled]').length === this._fileCount ? false : true;
    self.$btUpload.attr('disabled', disable);
  }
};