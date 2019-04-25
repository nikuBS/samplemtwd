/**
 * @file [이메일상담하기-품질케이스전송]
 * @author Lee Kirim
 * @since 2018-10-29
 */

 /**
 * @class 
 * @desc 이메일상담하기 품질케이스 전송하기
 * 특이사항 : 업로드 된 파일이 있으면 유스캔을 먼저 호출해서 전송된 파일을 서버에서 가져가도록 요청하고 반환값과 함께 등록하기 호출
 * @param {Object} rootEl - 최상위 element Object
 * @param {Object} data -  {allSvc, upladObj} 회선정보, 파일업로드 객체
 */
Tw.CustomerEmailQuality = function (rootEl, data) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this.userId = (data && data.allSvc) ? data.allSvc.userId : '';
  
  this.uploadObj = data.uploadObj; // 이메일 업로드 객체
  this._usanService = new Tw.CustomerUscanService(this.uploadObj); // 유스캔 서비스

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailQuality.prototype = {
  _init: function () {
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   */
  _cachedElement: function () {
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality'); // 서비스문의 템플릿 wrapper
    this.$quality_depth1 = this.$container.find('.fe-quality_depth1'); // 1카테고리 버튼
    this.tpl_quality_cell_content = Handlebars.compile($('#tpl_quality_cell_content').html()); // 품질 > 핸드폰 케이스에서 발생 현상 템플릿 전송시 사용
  },

  
  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    this.$container.on('validateForm', $.proxy(this._validateForm, this)); // 밸리데이션 이벤트
    this.$container.on('change keyup', '[required]', $.proxy(this._validateForm, this)); // 필수값 속성 input 변경시 밸리데이션 이벤트 - 등록하기 버튼 활성화여부
    this.$container.on('click', '.fe-quality-register', _.debounce($.proxy(this._request, this), 500)); // 등록하기 버튼 클릭 중복 클릭 방지 적용
  },

  /**
   * @function
   * @desc 등록하기 버튼 클릭 이벤트
   * @param {event} e 
   */
  _request: function (e) {

    // 전화번호 검증
    if ( !this._isValidQualityPhone() ) {
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.INVALID_PHONE,
        Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM,
        $.proxy(function () {
          setTimeout(function () {
            $('.fe-quality_phone').click();
            $('.fe-quality_phone').focus();
          }, 500);
        }, this),
        null,
        $(e.currentTarget)
      );

      return false;
    }

    // 이메일 형식 검증
    if ( !this._isValidQualityEmail() ) {
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.INVALID_EMAIL,
        Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM,
        $.proxy(function () {
          setTimeout(function () {
            $('.fe-quality_email').click();
            $('.fe-quality_email').focus();
          }, 500);
        }, this),
        null,
        $(e.currentTarget)
      );

      return false;
    }

    // 파일 여부 
    var files = this.uploadObj.getQualityFilesInfo();

    if (files.length) {
      // 파일, 업로드 객체, 콜백, 타입
      /**
       * @function
       * @param {object}
       */
      this._usanService.requestUscan({
        files: files, // 파일정보
        Upload: this.uploadObj, // 업로드 생성객체
        type: this.$quality_depth1.data('quality-depth1'), // 카테고리 타입
        request: $.proxy(this._requestCall, this), // 유스캔 호출 후 callback
        $target: $(e.currentTarget), // 처리 후 되돌아갈 포커스 (등록버튼)
        proMemo: this.userId + '/' + this.$wrap_tpl_quality.find('.fe-text_title').val() // API 호출시 메모 정보
      });
      
    } else {
      // 파일없음 바로 호출
      this._requestCall($(e.currentTarget));
    }

    
  },

  /**
   * @function
   * @desc 선택된 카테고리에 따라 분기처리
   * @param {element} $target 등록버튼 엘리먼트
   */
  _requestCall: function ($target) {
    var qualityCategory = this.$quality_depth1.data('quality-depth1'); // 선택된 카테고리
    $target.prop('disabled', true); // 등록하기 버튼 비활성화 (API 중복 호출 방지)
    switch ( qualityCategory ) {
      case 'cell':
        this._requestCell($target);
        break;
      case 'internet':
        this._requestInternet($target);
        break;
      default:
    }
  },
  
  /**
   * @function
   * @desc 입력된 값으로 전송시 필요한 param 반환 [여러케이스 공통 사용범위]
   * @returns {object} params
   */
  _makeParams: function () {
    var arrPhoneNumber = $('.fe-quality_phone').val().split('-');
    var params = {
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15', // 앱접속이면 19 웹접속이면 15
      cntcNumClCd: $('.fe-quality-cntcNumClCd').find(':checked').val(), // 연락가능한번호 휴대폰 or 집전화
      inqSvcClCd: $('.fe-quality-inqSvcClCd').find(':checked').val(), // 2차 카테고리라고 보면 됨 템플릿내 라디오 버튼 옵션
      content: this.$wrap_tpl_quality.find('.fe-text_content').val(), // 내용
      cntcNum1: arrPhoneNumber[0], // 연락가능번호 1
      cntcNum2: arrPhoneNumber[1], // 연락가능번호 2
      cntcNum3: arrPhoneNumber[2], // 연락가능번호 3
      email: $('.fe-quality_email').val(), // 이메일
      smsRcvYn: $('.fe-quality_sms').prop('checked') ? 'Y' : 'N' // 답변 등록시 sms 수신여부
    };

    return params;
  },

  /**
   * @function
   * @desc 휴대폰케이스 전송
   * @param {element} $target 등록하기 버튼 포커스 관련
   */
  _requestCell: function ($target) {
    var elSelectedLine = this.$wrap_tpl_quality.find('[data-svcmgmtnum]').data('svcmgmtnum');
    var $elInputline = this.$wrap_tpl_quality.find('.fe-quality-line');
    var elInputlineVal = $elInputline.is('button') ? $elInputline.text() : $elInputline.val();
    var selSvcMgmtNum = !!elSelectedLine ? elSelectedLine.toString() : '0'; // 현재 와이브로 옵션 없으므로 - 대시만 없애는 방향으로 가능
    var selSvcNum = !!elInputlineVal ? elInputlineVal.replace(/-/gi, '') : '';

    // 개별적인 파라미터 정보
    var htParams = $.extend(this._makeParams(), {
      inptZip: $('.fe-zip').val(), // 우편번호
      inptBasAddr: $('.fe-main-address').val(), // 기본주소
      inptDtlAddr: $('.fe-detail-address').val(), // 상세주소
      selSvcMgmtNum: selSvcMgmtNum, // 회선정보
      content: this.tpl_quality_cell_content({
        place: $('.fe-place').text(), 
        place_detail: $('.fe-place_detail').text(),
        occurrence: $('.fe-occurrence').text(),
        text_name: $('.fe-text_name').val(),
        text_content: this.$wrap_tpl_quality.find('.fe-text_content').val(),
        occurrence_date: $('.fe-occurrence_date').text(),
        occurrence_detail: $('.fe-occurrence_detail').text(),
        inqSvcClCd: $('.fe-quality-inqSvcClCd').find(':checked').parent().text().trim(),
        svcNum: $('.fe-quality-line').is('input') ? $('.fe-quality-line').val() : $('.fe-quality-line').text().trim(),
        inptZip: $('.fe-zip').val(),
        inptBasAddr: $('.fe-main-address').val(),
        inptDtlAddr: $('.fe-detail-address').val()
      }),
      fileAtchYn: this.uploadObj.getQualityFilesInfo().length ? 'Y' : 'N' // 파일첨부여부
    });

    if ( selSvcMgmtNum === '0' ) {
      htParams = $.extend(htParams, { selSvcNum: selSvcNum });
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0044, htParams, null, null, null, { jsonp : false })
      .done($.proxy(this._onSuccessRequest, this, $target))
      .fail($.proxy(this._apiError, this, $target));
  },

  /**
   * @function
   * @desc 인터넷 케이스 전송
   * @param {element} $target 등록하기 버튼 포커스 관련
   */
  _requestInternet: function ($target) {
    var elSelectedLine = this.$wrap_tpl_quality.find('[data-svcmgmtnum]').data('svcmgmtnum');
    var $qualityLine = this.$wrap_tpl_quality.find('.fe-quality-line'); 
    var elInputline = $qualityLine.length ? ( 
                        $qualityLine.is('.fe-numeric') ? $qualityLine.val().replace(/-/gi, '') : $qualityLine.val()
                      ) : '';
    var selSvcMgmtNum = !!elSelectedLine ? elSelectedLine.toString() : '0';
    var selSvcNum = !!elInputline ? elInputline : '';

    // 개별 파라미터 정보
    var htParams = $.extend(this._makeParams(), {
      subject: this.$wrap_tpl_quality.find('.fe-text_title').val(),
      inptZip: $('.fe-zip').length ? ($('.fe-zip').val() || '') : '',
      inptBasAddr: $('.fe-main-address').length ? ($('.fe-main-address').val() || '') : '',
      inptDtlAddr: $('.fe-detail-address').val() ? ($('.fe-detail-address').val() || '') : '',
      selSvcMgmtNum: selSvcMgmtNum,
      fileAtchYn: this.uploadObj.getQualityFilesInfo().length ? 'Y' : 'N' // 파일첨부여부
    });

    if ( selSvcMgmtNum === '0' ) {
      htParams = $.extend(htParams, { selSvcNum: selSvcNum });
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0045, htParams, null, null, null, { jsonp : false })
      .done($.proxy(this._onSuccessRequest, this, $target))
      .fail($.proxy(this._apiError, this, $target));
  },

  /**
   * @function
   * @desc 각 전송 API 성공후 페이지 이동 에러시 에러팝업
   * @param {element} $target 
   * @param {JSON} res 
   */
  _onSuccessRequest: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/emailconsult/complete?email=' + $('.fe-quality_email').val());
    } else {
      Tw.Error(res.code, res.msg).pop($.proxy(this._handleButtonAbled, this, $target), $target);
    }
  },

  /**
   * @function
   * @desc 필수값 input 체크해 등록하기 버튼 활성화 / 비활성화 결정해 적용
   * + 추가로 2카테고리가 선택되어있어야 함
   */
  _validateForm: function () {
    var arrValid = [];

    this.$wrap_tpl_quality.find('[required]').each(function (nIndex, item) {
      // button case (select menu를 보여주는 button)
      if ( $(item).is('button')) {
        arrValid.push(!Tw.FormatHelper.isEmpty($(item).data('value')));
      }

      if ( $(item).prop('type') === 'checkbox' ) {
        arrValid.push($(item).prop('checked'));
      }

      if ( $(item).prop('type') === 'number') {
        var isValidNumber = $(item).val().length !== 0 ? true : false;
        arrValid.push(isValidNumber);
      }

      if ( $(item).prop('type') === 'tel' ) {
        var isPhoneNumber = (Tw.ValidationHelper.isCellPhone($(item).val()) || Tw.ValidationHelper.isTelephone($(item).val()));
        arrValid.push(isPhoneNumber);
      }

      if ( $(item).prop('type') === 'text' ) {
        var isValidText = $(item).val().length !== 0 ? true : false;
        arrValid.push(isValidText);
      }

      if ( $(item).prop('type') === 'textarea' ) {
        var isValidTextArea = $(item).val().length !== 0 ? true : false;
        arrValid.push(isValidTextArea);
      }
    });

    if ( arrValid.indexOf(false) === -1 && !!this.$quality_depth1.data('qualityDepth1') ) {
      $('.fe-quality-register').prop('disabled', false);
    } else {
      $('.fe-quality-register').prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 전화번호 형식 검사 
   * @returns {boolean}
   */
  _isValidQualityPhone: function () {
    var sPhone = $('.fe-quality_phone').val();

    return Tw.ValidationHelper.isCellPhone(sPhone) || Tw.ValidationHelper.isTelephone(sPhone);
  },

  /**
   * @function
   * @desc 이메일 형식 검사
   * @returns {boolean}
   */
  _isValidQualityEmail: function () {
    var sEmail = $('.fe-quality_email').val();

    return Tw.ValidationHelper.isEmail(sEmail);
  },

  /**
   * @function
   * @desc API 호출 실패
   * @param {element} $target 에러팝업 닫힌 후 포커스될 dom 객체
   * @param {JSON} res 에러정보
   */
  _apiError: function ($target, res) {
    Tw.Error(res.code, res.msg).pop($.proxy(this._handleButtonAbled, this, $target), $target);
  },

  // 요청 버튼 클릭가능하도록 처리
  _handleButtonAbled: function ($target) {
    $target.prop('disabled', false);
  },
};