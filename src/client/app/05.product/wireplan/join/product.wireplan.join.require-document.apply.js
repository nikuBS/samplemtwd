/**
 * @file 상품 > 가입상담예약 > 서류제출
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-08
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param historyList - 서류제출 심사내역
 */
Tw.ProductWireplanJoinRequireDocumentApply = function(rootEl, historyList) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-btn_apply'));

  this._cachedElement();
  this._bindEvent();

  this._fileList = [];
  this._limitFileByteSize = 2097152;
  this._acceptExt = ['jpg', 'jpeg', 'png', 'gif'];
  this._historyList = JSON.parse(window.unescape(historyList));

  this._fileTemplate = Handlebars.compile($('#fe-templ-reserv-file').html());
};

Tw.ProductWireplanJoinRequireDocumentApply.prototype = {

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$fileWrap = this.$container.find('.fe-file_wrap');
    this.$fileList = this.$container.find('.fe-file_list');
    this.$explainFile = this.$container.find('.fe-explain_file');
    this.$explainFileView = this.$container.find('.fe-explain_file_view');
    this.$explainFileViewClone = this.$explainFileView.parents('.file-wrap').clone();
    this.$btnExplainFileAdd = this.$container.find('.fe-btn_explain_file_add');
    this.$btnOpenHistoryDetail = this.$container.find('.fe-btn_open_detail');
    this.$btnApply = this.$container.find('.fe-btn_apply');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$container.on('click', 'input[type=file]', $.proxy(this._openCustomFileChooser, this));
    this.$container.on('change', '.fe-explain_file', $.proxy(this._onChangeExplainFile, this));
    this.$container.on('click', '.fe-btn_explain_file_add', $.proxy(this._uploadExplainFile, this));

    this.$btnOpenHistoryDetail.on('click', $.proxy(this._openHistoryDetailPop, this));
    this.$fileList.on('click', '.fe-btn_explain_file_del', $.proxy(this._delExplainFile, this));
    this.$btnApply.on('click', _.debounce($.proxy(this._procApply, this), 500));
  },

  /**
   * @function
   * @desc 파일 첨부 input change Event
   * @param e - change Event
   * @returns {*|void}
   */
  _onChangeExplainFile: function(e) {
    if (this._fileList.length > 4) {
      return this._toggleBtn(this.$btnExplainFileAdd, false);
    }

    this._toggleBtn(this.$btnExplainFileAdd, !Tw.FormatHelper.isEmpty(e.currentTarget.files));
  },

  /**
   * @function
   * @desc 저버전 AOS 지원 처리 (App 에서 업로드 실행)
   * @param e - input file 클릭 이벤트
   */
  _openCustomFileChooser: function (e) {
    var $target = $(e.currentTarget);

    if ( Tw.CommonHelper.isLowerVersionAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.OPEN_FILE_CHOOSER, {
        dest: Tw.UPLOAD_TYPE.RESERVATION,
        acceptExt: this._acceptExt,
        limitSize: this._limitFileByteSize
      }, $.proxy(this._nativeFileChooser, this, $target));
    }
  },

  /**
   * @function
   * @desc AOS 저버전에서 업로드할 경우 응답 값 처리
   * @param $target - input file
   * @param response - AOS 업로드 값
   * @returns {*|void}
   */
  _nativeFileChooser: function ($target, response) {
    if (response.resultCode === -1) {
      return this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A00);
    }

    if (response.resultCode === Tw.NTV_CODE.CODE_02) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A33.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A33.TITLE);
    }

    if (response.resultCode === Tw.NTV_CODE.CODE_01) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE);
    }

    if (this._fileList.length > 4) {
      return this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A02);
    }

    var params = response.params;
    var fileInfo = params.fileData.result[0];

    this._fileList.push(fileInfo);
    this.$fileList.append(this._fileTemplate(fileInfo));
    this.$fileWrap.show().attr('aria-hidden', 'false');

    this._clearExplainFile();
    this._procEnableApplyBtn();
  },

  /**
   * @function
   * @desc 파일 업로드 실행
   * @returns {*|void}
   */
  _uploadExplainFile: function() {
    var fileInfo = this.$container.find('.fe-explain_file').get(0).files[0];

    if (fileInfo.size > this._limitFileByteSize) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE);
    }

    if (this._acceptExt.indexOf(fileInfo.name.split('.').pop().toLowerCase()) === -1) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A33.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A33.TITLE);
    }

    if (this._fileList.length > 4) {
      return this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A02);
    }

    var dFiles = [];
    dFiles.push(fileInfo);
    dFiles.push(fileInfo);

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    Tw.CommonHelper.fileUpload(Tw.UPLOAD_TYPE.RESERVATION, dFiles)
      .done($.proxy(this._successUploadFile, this))
      .fail($.proxy(this._failUploadFile, this));
  },

  /**
   * @function
   * @desc 업로드 된 파일 삭제
   * @param e - 삭제 버튼 클릭 이벤트
   */
  _delExplainFile: function(e) {
    var $item = $(e.currentTarget).parents('li');

    this._fileList.splice($item.index(), 1);
    this._toggleBtn(this.$btnExplainFileAdd, this._fileList.length < 5);

    $item.remove();

    if (this._fileList.length < 1) {
      this.$fileWrap.hide().attr('aria-hidden', 'true');
    }

    this._clearExplainFile();
    this._procEnableApplyBtn();
  },

  /**
   * @function
   * @desc 파일 업로드 완료 시
   * @param resp - API 응답 값
   * @returns {*|void}
   */
  _successUploadFile: function(resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A00);
    }

    this._fileList.push(resp.result);
    this.$fileList.append(this._fileTemplate(resp.result[0]));
    this.$fileWrap.show().attr('aria-hidden', 'false');

    this._clearExplainFile();
    this._procEnableApplyBtn();
  },

  /**
   * @function
   * @desc 파일 업로드 실패 시
   */
  _failUploadFile: function() {
    Tw.CommonHelper.endLoading('.container');
    this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A00);
  },

  /**
   * @function
   * @desc 파일 업로드 영역 초기화
   */
  _clearExplainFile: function() {
    this.$container.find('.fe-explain_file_view').parents('.file-wrap').html(this.$explainFileViewClone);
    this._toggleBtn(this.$btnExplainFileAdd, false);
    skt_landing.widgets.widget_init('.file-wrap');
  },

  /**
   * @function
   * @desc 버튼 토글
   * @param $btn - 버튼 Element
   * @param isEnable - 활성화 여부
   */
  _toggleBtn: function($btn, isEnable) {
    if (isEnable) {
      $btn.removeAttr('disabled').prop('disabled', false);
      $btn.parent().removeClass('bt-gray1').addClass('bt-blue1');
    } else {
      $btn.attr('disabled', 'disabled').prop('disabled', true);
      $btn.parent().removeClass('bt-blue1').addClass('bt-gray1');
    }
  },

  /**
   * @function
   * @desc 신청하기 버튼 활성화 여부 산출
   * @returns {*|void}
   */
  _procEnableApplyBtn: function() {
    if (this._fileList.length < 1) {
      return this._toggleBtn(this.$btnApply, false);
    }

    this._toggleBtn(this.$btnApply, true);
  },

  /**
   * @function
   * @desc 신청하기 처리 (USCAN)
   */
  _procApply: function() {
    var convFileList0 = [],
      convFileList1 = [];

    this._fileList.forEach(function(itemList) {
      convFileList0.push({
        fileSize: itemList[0].size,
        fileName: itemList[0].name,
        filePath: '/' + itemList[0].path
      });
      convFileList1.push({
        fileSize: itemList[1].size,
        fileName: itemList[1].name,
        filePath: '/' + itemList[1].path
      });
    });

    var apiList = [
      {
        command: Tw.API_CMD.BFF_01_0046,
        params: {
          recvFaxNum: 'skt404@sk.com',
          proMemo: Tw.PRODUCT_RESERVATION.combine,
          scanFiles: convFileList0
        }
      },
      {
        command: Tw.API_CMD.BFF_01_0046,
        params: {
          recvFaxNum: 'skt219@sk.com',
          proMemo: Tw.PRODUCT_RESERVATION.combine,
          scanFiles: convFileList1
        }
      }
    ];

    this._apiService.requestArray(apiList)
      .done($.proxy(this._resApply, this));
  },

  /**
   * @function
   * @desc USCAN 처리 결과
   * @param uscan0 - 첫번째 USCAN 응답 값
   * @param uscan1 - 두번쨰 USCAN 응답 값
   * @returns {*}
   */
  _resApply: function(uscan0, uscan1) {
    if (uscan0.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(uscan0.code, uscan0.msg).pop();
    }

    if (uscan1.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(uscan1.code, uscan1.msg).pop();
    }

    this._openSuccessPop();
  },

  /**
   * @function
   * @desc 심사내역 목록 조회
   */
  _openHistoryDetailPop: function() {
    this._popupService.open({
      'pop_name': 'type_tx_scroll',
      'title': Tw.PRODUCT_REQUIRE_DOCUMENT.HISTORY_DETAIL,
      'title_type': 'sub',
      'cont_align':'tl',
      'contents': (this._historyList.map(function(item) {
        return '- ' + item;
      })).join('<br>'),
      'bt_b': [{
        style_class:'pos-left tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, null);
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   */
  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_subtexts',
      text: Tw.PRODUCT_REQUIRE_DOCUMENT.SUCCESS_TITLE,
      subtexts: [
        Tw.PRODUCT_REQUIRE_DOCUMENT.FILE_COUNT + this._fileList.length + Tw.PRODUCT_REQUIRE_DOCUMENT.FILE_COUNT_UNIT
      ]
    }, $.proxy(this._bindSuccessPop, this), $.proxy(this._backToParentPage, this), 'require_document_success');
  },

  /**
   * @function
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindSuccessPop: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closeSuccessPop, this));
  },

  /**
   * @function
   * @desc 완료 팝업 내 닫기 버튼 클릭 시
   */
  _closeSuccessPop: function() {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료 팝업 종료 시 페이지 이전 페이지로 이동 처리
   * @returns {*|void}
   */
  _backToParentPage: function() {
    if (this._isCombineInfo) {
      return this._historyService.go(-2);
    }

    this._historyService.goBack();
  }

};
