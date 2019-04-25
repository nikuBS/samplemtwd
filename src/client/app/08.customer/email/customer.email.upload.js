/**
 * @file [이메일상담하기-파일첨부하기]
 * @author Lee Kirim
 * @since 2018-11-16
 */

/**
 * @class 
 * @desc 이메일상담하기 파일첨부하기 동작에 관한 처리
 * @param {Object} rootEl - 최상위 element Object
 * @param {Object} data - customer.email.controller.ts 로 부터 전달되어 정보 {userAgent: ''} 디바이스정보
 */
Tw.CustomerEmailUpload = function (rootEl, data) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._history = new Tw.HistoryService();
  this._limitFileByteSize = 2097152; // 업로드 제한 크기 2mb
  this._acceptExt = ['jpg', 'jpeg', 'png', 'gif']; // 업로드 가능 확장명

  this._init(data);
  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerEmailUpload.prototype = {
  uploadFiles: [], // 업로드된 파일 정보
  serviceUploadFiles: [], // 서비스 업로드된 파일정보
  qualityUploadFiles: [], // 품질 업로드된 파일정보

  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 동작에 필요한 내부 변수를 정의 한다.
   * @return {void}
   */
  _init: function (data) {
    this.userAgent = data.userAgent; // 디바이스 정보
    this.isAndroid = Tw.BrowserHelper.isAndroid(); // 앱이면 true
    this.isLimitUpload = !Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid(); // 모웹이고(앱은제외) 안드4.4 면(true) 업로드 제한
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정 customer.email.html
   */
  _cachedElement: function () {
    this.tpl_upload_list = Handlebars.compile($('#tpl_upload_list').html()); // 업로드된 이미지 리스트 
    this.wrap_service = $('#tab1-tab'); // 서비스 wrapper
    this.wrap_quality = $('#tab2-tab'); // 품질 wrapper
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-upload-file-service', $.proxy(this._openUploadPage, this, 'service')); // 서비스 파일 첨부하기 버튼
    this.$container.on('click', '.fe-upload-file-quality', $.proxy(this._openUploadPage, this, 'quality')); // 통화품질 파일 첨부하기 버튼
    // 파일첨부하기 팝업레이어 이벤트
    this.$container.on('click', 'input[type=file]', $.proxy(this._openCustomFileChooser, this)); // 파일 input 클릭시
    this.$container.on('change', 'input[type=file]', $.proxy(this._inputFileChooser, this)); // 파일 input 변경 시 
    this.$container.on('click', '.fe-file-button', $.proxy(this._handleFileBtnClick, this)); // 파일첨부 / 파일삭제 버튼 클릭시 
    this.$container.on('click', '#fe-upload-ok', $.proxy(this._applyFiles, this)); // 적용하기 버튼
    // 바닥페이지 파일첨부리스트 삭제하기 버튼
    this.wrap_service.on('click', '.fe-remove-file', $.proxy(this._removeFileList, this, 'service'));
    this.wrap_quality.on('click', '.fe-remove-file', $.proxy(this._removeFileList, this, 'quality'));
    // 초기화
    this.$container.on('initUploadFiles', $.proxy(this.initFiles, this));
  },

  /**
   * @function
   * @desc 파일첨부 객체 초기화
   * customer.email.template.js 에서도 호출됨
   */
  initFiles: function () {
    this.uploadFiles = [];
    this.serviceUploadFiles = [];
    this.qualityUploadFiles = [];
  },

  /**
   * @function
   * @desc 파일첨부 레이어 노출
   * @param {string} type 서비스 or 품질
   * @param {event} e 이벤트
   */
  _openUploadPage: function (type, e) {
    // 4.4 안드버전 and 웹으로 접속시는 업로드 제한
    if (this.isLimitUpload) {
      // Not Supported File Upload
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

  /**
   * @function
   * @desc 파일첨부하기 레이어 열린 후 callback
   * @param {element} $temp 레이어팝업 엘리먼트
   */
  _handleCallback: function ($temp) {
    this.$uploadPage = $temp;
    this._checkUploadButton();
  },

  /**
   * @function
   * @desc 업로드 팝업 열릴 때 5개 미만이면 배열 채워 넣음, 업로드데이터 정보를 받아와 hbs 템플릿 노출에 맞도록 변환해 반환
   * @param {array} arr 파일첨부객체
   * @return {array} [null or {...arr[i], oldFile: {name: arr[i].name}}...] 확장된 객체
   */
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

  /**
   * @function
   * @desc 파일첨부 레이어 > 파일첨부 or 삭제버튼 클릭 이벤트 [토글]
   * @param {event} e 
   */
  _handleFileBtnClick: function (e) {
    var fileIdx = $(e.currentTarget).parentsUntil('.file-wrap').last().index(); // 선택한 버튼의 index
    if ( this.uploadFiles[fileIdx] ) {
      // 삭제하기
      this._removeFile(fileIdx);
    } else {
      // 추가하기 해당메뉴는 보이스오버 접근으로 가능 (파일첨부 전에는 css 상 input 이 버튼을 가리고 있음)
      $(e.currentTarget).siblings('input[type="file"]').trigger('click');
    }
  },

  /**
   * @function
   * @desc 파일첨부하기 클릭시 버전체크
   * @param {event} e 
   */
  _openCustomFileChooser: function (e) {
    e.stopPropagation();

    var $target = $(e.currentTarget);
    // 저버전 안드로이드일경우 앱 기능 호출 그외에는 파일첨부 기본 기능 이용
    if ( this._isLowerVersionAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.OPEN_FILE_CHOOSER, {
        dest: 'email',
        acceptExt: this._acceptExt,
        limitSize: this._limitFileByteSize
      }, $.proxy(this._nativeFileChooser, this, $target));
    }
  },

  /**
   * @function
   * @desc 저버전 안드로이드 파일첨부 완료시 callback function
   * 성공시 uploadFiles 에 정보 저장, 실패시 케이스별 팝업 노출
   * @param {element} $target 파일첨부완료시 value 변경될 input 
   * @param {JSON} response 
   */
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
        // 용량초과
        return this._popupService.openAlert(
          Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE, 
          Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG, null, null, null,
          $target
        );
      } else if ( response.resultCode === Tw.NTV_CODE.CODE_02 ) {
        // 잘못된 파일형식
        return this._popupService.openAlert(
          Tw.CUSTOMER_EMAIL.INVALID_FILE, 
          Tw.POPUP_TITLE.NOTIFY,
          null, null, null, 
          $target
        );
      } else {
        // 그외 오류도 잘못된 파일형식으로 안내
        return this._popupService.openAlert(
          Tw.CUSTOMER_EMAIL.INVALID_FILE, 
          Tw.POPUP_TITLE.NOTIFY,
          null, null, null,
          $target
        );
      }
    }
  },

  /**
   * @function
   * @desc 파일첨부 input 변경시
   * @param {event} e 
   */
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


  /**
   * @function
   * @desc 파일업로드 업데이트 파일첨부 레이어 업데이트
   */
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

    // 버튼 활성화 여부
    this._checkUploadButton();

  },

  // 삭제하기 버튼 클릭 (팝업)
  /**
   * @function
   * @desc 지정된 index 의 업로드 파일 삭제 후 파일첨부 레이어 업데이트
   * @param {number} idx 
   */
  _removeFile: function (idx) {
    this.uploadFiles.splice(idx, 1);
    this._handlebarUpdate();
  },

  
  /**
   * @function
   * @desc 적용하기 버튼 클릭 서비스 or 품질 탭 구분해 적용  
   */
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

  /**
   * @function
   * @desc customer.email.service.js에서 호출 서비스 파일 첨부 반환
   */
  getServiceFilesInfo: function () {
    return this.serviceUploadFiles;
  },

  /**
   * @function
   * @desc customer.email.quality.js에서 호출 품질파일 첨부 반환
   */
  getQualityFilesInfo: function () {
    return this.qualityUploadFiles;
  },

  /**
   * @function
   * @desc customer.uscan.service.js 에서 호출 / 등록된 파일 올리기
   * @param {array} files 파일목록
   * @param {function} callback 등록 후 실행할 함수
   */
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
  
  
  /**
   * @function
   * @desc 등록된 파일 올린 후 callback 함수
   * @param {function} callback 등록 후 실행할 함수
   * @param {JSON} res 
   */
  _uploadSuccess: function (callback, res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(res.code, res.msg).pop();
    }
    if (typeof callback === 'function') {
      return callback(res);
    }
  },
  
  /**
   * @function
   * @desc 파일첨부하기 버튼 활성화 / 비활성화 
   * @param {element} $button 
   * @param {number} num 
   */
  _setFileBtnExpress: function ($button, num) {
    $button.prop('disabled', (num || this.uploadFiles.length) >= 5);
  },

  /**
   * @function
   * @desc 적용된 각 리스트에서 파일 삭제버튼 클릭 시 해당 등록되있는 리스트 제거
   * @param {string} type 서비스 or 품질
   * @param {event} e 
   */
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

  /**
   * @function
   * @desc [웹접근성] 으로 사용시 사용하면 됩니다. 현재 사용안함
   */
  _showUploadPopup: function () {
    if (this.uploadFiles.length) {
      // 파일 첨부된 갯수가 있으면 마지막 줄에 포커스
      this.$container.find('input[type=file]').eq(0).focus();
    } else {
      // 파일 첨부된 갯수가 없으면 팝업 제목에 포커스
      $('.fe-wrap-file-upload').find('h1').attr('tabindex',-1).focus();
    }
  },

  /**
   * @function
   * @desc 4.4 웹 파일첨부 미지원 팝업 노출 후 이벤트 바인드
   * @param {element} $layer 
   */
  _bindAlertPopupClose: function($layer) {
    // 닫기버튼 바인드
    $layer.on('click', '.tw-popup-closeBtn button', $.proxy(this._execAlertPopupClose, this));
    // 저사양 단말에서 화면이 바뀌지 않는 현상 대응
    try {
      $layer.on('touchstart', '.tw-popup-closeBtn button', $.proxy(this._execAlertPopupClose, this));
    } catch (err) {}
  },

  /**
   * @function
   * @desc 파일첨부 미지원 팝업 닫기 
   * @param {event} e 
   */
  _execAlertPopupClose: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this._popupService.close();
  },

  /**
   * @function
   * @desc 업로드된 파일이있으면 적용하기 버튼 활성화 or 비활성화
   */
  _checkUploadButton: function () {
    if ( this.uploadFiles.length !== 0 ) {
      this._activeUploadButton();
    } else {
      this._disableUploadButton();
    }
  },
  
  /**
   * @function
   * @desc 적용하기 버튼 활성화
   */
  _activeUploadButton: function () {
    $('#fe-upload-ok').prop('disabled', false);
  },

  /**
   * @function
   * @desc 적용하기 버튼 비활성화
   */
  _disableUploadButton: function () {
    $('#fe-upload-ok').prop('disabled', true);
  },

  /**
   * @function
   * @desc 현재 선택된 탭 구하기
   * @returns {enum {service, quality}} 
   */
  _getCurrentType: function () {
    if ( this.wrap_service.attr('aria-selected') === 'true' ) {
      return 'service';
    }
    return 'quality';
  },

  /**
   * @function
   * @desc 4.4 안드로이드 버전이면 true 반환 파일첨부 4.4 안드로이드 and 웹에서 미지원되는 history 있음
   * @returns {boolean}
   */
  _isLowerVersionAndroid: function () {
    var androidVersion = Tw.BrowserHelper.getAndroidVersion(this.userAgent);

    return androidVersion && androidVersion.indexOf('4.4') !== -1;
  },

  /**
   * @function 
   * @desc API 호출 에러 반환시
   * @param {JOSN} res 
   */
  _onError: function(res) {
    return Tw.Error(res.code, res.msg).pop();
  }
};

