/**
 * @file [이메일상담하기-서비스케이스전송]
 * @author Lee Kirim
 * @since 2018-10-29
 */

 /**
 * @class 
 * @desc 이메일상담하기 서비스케이스 전송하기
 * 특이사항 : 업로드 된 파일이 있으면 유스캔을 먼저 호출해서 전송된 파일을 서버에서 가져가도록 요청하고 반환값과 함께 등록하기 호출
 * @param {Object} rootEl - 최상위 element Object
 * @param {Object} data -  {allSvc, upladObj} 회선정보, 파일업로드 객체
 */
Tw.CustomerEmailService = function (rootEl, data) {
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

Tw.CustomerEmailService.prototype = {
  /**
   * @function
   * @desc 실행시 폼 밸리데이션 호출
   */
  _init: function () {
    this._validateForm();
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   */
  _cachedElement: function () {
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service'); // 서비스문의 템플릿 wrapper
    this.$service_depth1 = this.$container.find('.fe-service_depth1'); // 1카테고리 버튼
    this.$service_depth2 = this.$container.find('.fe-service_depth2'); // 2카테고리 버튼
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    this.$container.on('validateForm', $.proxy(this._validateForm, this)); // 밸리데이션 이벤트 
    this.$container.on('change keyup', '[required]', $.proxy(this._validateForm, this)); // 필수값 속성 input 변경시 밸리데이션 이벤트 - 등록하기 버튼 활성화여부
    this.$container.on('click', '.fe-service-register', _.debounce($.proxy(this._request, this), 500)); // 등록하기 버튼 클릭 중복 클릭 방지 적용
  },

  /**
   * @function
   * @desc 등록하기 버튼 클릭 이벤트
   * @param {event} e 
   */
  _request: function (e) {

    // 전화번호 검증 
    if ( !this._isValidServicePhone() ) {
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.INVALID_PHONE,
        Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM,
        $.proxy(function () {
          setTimeout(function () {
            $('.fe-service_phone').click();
            $('.fe-service_phone').focus();
          }, 500);
        }, this),
        null,
        $(e.currentTarget)
      );

      return false;
    }

    // 이메일 형식 검증
    if ( !this._isValidServiceEmail() ) {
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.INVALID_EMAIL,
        Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM,
        $.proxy(function () {
          setTimeout(function () {
            $('.fe-service_email').click();
            $('.fe-service_email').focus();
          }, 500);
        }, this),
        null,
        $(e.currentTarget)
      );

      return false;
    }

    // 파일 여부 
    var files = this.uploadObj.getServiceFilesInfo();
    
    // 파일이 있다면 유스캔 전송 호출
    if (files.length) {
      // 파일, 업로드 객체, 콜백, 타입
      /**
       * @function
       * @param {object}
       */
      this._usanService.requestUscan({
        files: files, // 파일정보
        Upload: this.uploadObj, // 업로드 생성객체
        type: this.$service_depth1.data('service-depth1'), // 카테고리 타입
        request: $.proxy(this._requestCall, this), // 유스캔 호출 후 callback
        $target: $(e.currentTarget), // 처리 후 되돌아갈 포커스 (등록버튼) 
        proMemo: this.userId + '/' + this.$wrap_tpl_service.find('.fe-text_title').val() // API 호출시 메모 정보
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
    var serviceCategory = this.$service_depth1.data('service-depth1'); // 선택된 카테고리
    $target.prop('disabled', true); // 등록하기 버튼 비활성화 (API 중복 호출 방지)
    switch ( serviceCategory ) {
      case 'CELL':
        this._requestCell($target);
        break;
      case 'INTERNET':
        this._requestInternet($target);
        break;
      case 'DIRECT':
        this._requestDirect($target);
        break;
      case 'CHOCO':
        this._requestChocolate($target);
        break;
      default:
        break;
    }
  },

  /**
   * @function
   * @desc 입력된 값으로 전송시 필요한 param 반환 [여러케이스 공통 사용범위]
   * @returns {object} params
   */
  _makeParams: function () {
    var arrPhoneNumber = $('.fe-service_phone').val().split('-');

    var params = {
      cntcNum1: arrPhoneNumber[0], // 연락가능한번호 1
      cntcNum2: arrPhoneNumber[1], // 연락가능한번호 2
      cntcNum3: arrPhoneNumber[2], // 연락가능한번호 3
      email: $('.fe-service_email').val(), // 이메일
      subject: this.$wrap_tpl_service.find('.fe-text_title').val(), // 제목
      content: this.$wrap_tpl_service.find('.fe-text_content').val(), // 내용
      smsRcvYn: $('.fe-service_sms').prop('checked') ? 'Y' : 'N' // 답변 등록시 sms 수신여부
    };

    return params;
  },

  /**
   * @function
   * @desc 휴대폰케이스 전송
   * @param {element} $target 등록하기 버튼 포커스 관련
   */
  _requestCell: function ($target) {
    var elSelectedLine = this.$wrap_tpl_service.find('[data-svcmgmtnum]').data('svcmgmtnum');
    var $elInputLine = this.$wrap_tpl_service.find('.fe-service-line');
    var elInputlineVal = $elInputLine.is('button') ? $elInputLine.text() : $elInputLine.val();
    var selSvcMgmtNum = !!elSelectedLine ? elSelectedLine.toString() : '0';
    var selSvcNum = !!elInputlineVal ? elInputlineVal.replace(/-/gi, '') : '';

    var htParams = $.extend(this._makeParams(), {
      selSvcMgmtNum: selSvcMgmtNum, // 선택된 회선정보
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15', // 앱으로 접속 : 19 웹으로 접속: 15
      ofrCtgSeq: this.$service_depth2.data('serviceDepth2'), // 2카테고리
      cntcNumClCd: $('.fe-service-cntcNumClCd').find(':checked').val(), // 연락가능한 전화번호 타입
      fileAtchYn: this.uploadObj.getServiceFilesInfo().length ? 'Y' : 'N' // 파일첨부여부
    });

    // 선택된 회선정보가 없을때는 직접입력된 번호를 param에 추가
    if ( selSvcMgmtNum === '0' ) {
      htParams = $.extend(htParams, { selSvcNum: selSvcNum });
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0042, htParams, null, null, null, { jsonp : false })
      .done($.proxy(this._onSuccessRequest, this, $target)).fail($.proxy(this._apiError, this, $target));
  },

  /**
   * @function
   * @desc 인터넷 케이스 전송
   * @param {element} $target 등록하기 버튼 포커스 관련
   */
  _requestInternet: function ($target) {
    var elSelectedLine = this.$wrap_tpl_service.find('[data-svcmgmtnum]').data('svcmgmtnum');
    var elInputline = this.$wrap_tpl_service.find('.fe-service-line').val();
    var selSvcMgmtNum = !!elSelectedLine ? elSelectedLine.toString() : '0';
    var selSvcNum = !!elInputline ? elInputline : '';

    var htParams = $.extend(this._makeParams(), {
      selSvcMgmtNum: selSvcMgmtNum, // 선택된 회선정보
      inqSvcClCd: 'I', // 문의서비스구분코드 I : 인터넷/IPTV / P : 집전화/인터넷 전화
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15', // 앱으로 접속 : 19 웹으로 접속: 15
      ofrCtgSeq: this.$service_depth2.data('serviceDepth2'), // 2카테고리
      cntcNumClCd: $('.fe-service-cntcNumClCd').find(':checked').val(), // 연락가능한 전화번호 타입 
      fileAtchYn: this.uploadObj.getServiceFilesInfo().length ? 'Y' : 'N' // 파일첨부여부
    });

    if ( selSvcMgmtNum === '0' ) {
      htParams = $.extend(htParams, { selSvcNum: selSvcNum });
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0043, htParams, null, null, null, { jsonp : false })
      .done($.proxy(this._onSuccessRequest, this, $target)).fail($.proxy(this._apiError, this, $target));
  },

  /**
   * @function
   * @desc 다이렉트 케이스 전송
   * @param {element} $target 등록하기 버튼 포커스 관련
   */
  _requestDirect: function ($target) {
    var depth2Category = this.$service_depth2.data('serviceDepth2');
    var htParams;

    // param 추가
    if ( depth2Category === '07' || depth2Category === '10' ) {
      // 기종정보 전송 해야 하는 케이스
      htParams = $.extend(this._makeParams(), {
        category: this.$service_depth2.data('serviceDepth2'), // 2카테고리
        phoneId: $('.fe-select-device').data('phoneid') // 기종정보
      });
    } else {
      // 주문번호 전송해야하는 케이스
      htParams = $.extend(this._makeParams(), {
        category: this.$service_depth2.data('serviceDepth2'), // 2카테고리
        orderNo: $('.fe-text_order').val() // 주문정보
      });
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0020, htParams, null, null, null, { jsonp : false })
      .done($.proxy(this._onSuccessRequest, this, $target)).fail($.proxy(this._apiError, this, $target));
  },

  /**
   * @function
   * @desc 초코렛 케이스 전송
   * @param {element} $target 등록하기 버튼 포커스 관련
   */
  _requestChocolate: function ($target) {
    var htParams = $.extend(this._makeParams(), {
      category: this.$service_depth2.data('serviceDepth2') // 2카테고리
    });

    this._apiService.request(Tw.API_CMD.BFF_08_0021, htParams, null, null, null, { jsonp : false })
      .done($.proxy(this._onSuccessRequest, this, $target)).fail($.proxy(this._apiError, this, $target));
  },

  /**
   * @function
   * @desc 각 전송 API 성공후 페이지 이동 에러시 에러팝업
   * @param {element} $target 
   * @param {JSON} res 
   */
  _onSuccessRequest: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/emailconsult/complete?email=' + $('.fe-service_email').val());
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

    this.$wrap_tpl_service.find('[required]').each(function (nIndex, item) {
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

    if ( arrValid.indexOf(false) === -1 && !!this.$service_depth2.data('serviceDepth2') ) {
      $('.fe-service-register').prop('disabled', false);
    } else {
      $('.fe-service-register').prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 전화번호 형식 검사 
   * @returns {boolean}
   */
  _isValidServicePhone: function () {
    var sPhone = $('.fe-service_phone').val();

    return Tw.ValidationHelper.isCellPhone(sPhone) || Tw.ValidationHelper.isTelephone(sPhone);
  },

  /**
   * @function
   * @desc 이메일 형식 검사
   * @returns {boolean}
   */
  _isValidServiceEmail: function () {
    var sEmail = $('.fe-service_email').val();

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

  /**
   * @function
   * @desc 요청 버튼 클릭가능하도록 처리 /에러팝업 열린 후 처리 등록하기 버튼 활성화 (등록하기 버튼 누르면 API 호출중 비활성화 시킴)
   * @param {element} $target 
   */
  _handleButtonAbled: function ($target) {
    $target.prop('disabled', false);
  },
};