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
    this._loggedList = window['VALIDATE_FORM'] = window['VALIDATE_FORM']? window['VALIDATE_FORM'] : [];
    this._validateForm();
  },

  /**
   * @function
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   */
  _cachedElement: function () {
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service'); // 서비스문의 템플릿 wrapper
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality'); // 통화품질 템플릿 wrapper
    this.$service_depth1 = this.$container.find('.fe-service_depth1'); // 1카테고리 버튼
    this.$service_depth2 = this.$container.find('.fe-service_depth2'); // 2카테고리 버튼
    this.tpl_quality_cell_content = Handlebars.compile($('#tpl_quality_cell_content').html()); // 품질 > 핸드폰 케이스에서 발생 현상 템플릿 전송시 사용
  },

  /**
   * @function
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    this.$container.on('validateForm', $.proxy(this._validateForm, this)); // 밸리데이션 이벤트
    this.$container.on('change keyup', '[required]', $.proxy(this._validateForm, this)); // 필수값 속성 input 변경시 밸리데이션 이벤트 - 등록하기 버튼 활성화여부
    this.$container.on('click', '.fe-service-register', _.debounce($.proxy(this._request, this), 500)); // 등록하기 버튼 클릭 중복 클릭 방지 적용
    this.$container.on('click', '.fe-quality-register', _.debounce($.proxy(this._request_quality, this), 500)); // 등록하기 버튼 클릭 중복 클릭 방지 적용
    this.$container.on('validateFormByTitle', $.proxy(this._validateFormByTitle, this));
    this.$container.on('validateFormByContent', $.proxy(this._validateFormByContent, this));
  },

  /**
   * @function
   * @desc 등록하기 버튼 클릭 이벤트
   * @param {event} e
   */
  _request: function (e) {
    var $curTarget = $(e.currentTarget);
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
        $curTarget
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
        $curTarget
      );

      return false;
    }
    // [OP002-14121] 연락가능한 번호 추가 확인 프로세스 추가
    this._popupService.openConfirmButton(
      '연락 가능한 번호 ('+ $('.fe-service_phone').val() + ')가 정확하게 입력되었나요?',
      null,
      $.proxy(function(){
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
              $target: $curTarget, // 처리 후 되돌아갈 포커스 (등록버튼)
              proMemo: this.userId + '/' + this.$wrap_tpl_service.find('.fe-text_title').val() // API 호출시 메모 정보
            });
          } else {
            // 파일없음 바로 호출
            this._requestCall($curTarget);
          }
      }, this), null, Tw.POPUP_TITLE.EDIT, Tw.POPUP_TITLE.JOIN, $curTarget);
  },

  /**
   * @function
   * @desc 등록하기 버튼 클릭 이벤트
   * @param {event} e
   */
  _request_quality: function (e) {
    var $curTarget = $(e.currentTarget);
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
        $curTarget
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
        $curTarget
      );

      return false;
    }
    // [OP002-14121] 연락가능한 번호 추가 확인 프로세스 추가
    this._popupService.openConfirmButton(
      '연락 가능한 번호 ('+ $('.fe-service_phone').val() + ')가 정확하게 입력되었나요?',
      null,
      $.proxy(function(){
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
            type: this.$service_depth1.data('service-depth1'), // 카테고리 타입
            request: $.proxy(this._requestCall_quality, this), // 유스캔 호출 후 callback
            $target: $curTarget, // 처리 후 되돌아갈 포커스 (등록버튼)
            proMemo: this.userId + '/' + this.$wrap_tpl_quality.find('.fe-text_title').val() // API 호출시 메모 정보
          });
        } else {
          // 파일없음 바로 호출
          this._requestCall_quality($curTarget);
        }
      }, this), null, Tw.POPUP_TITLE.EDIT, Tw.POPUP_TITLE.JOIN, $curTarget);
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
      case 'CHOCO':
        this._requestCell($target);
        break;
      case 'INTERNET':
        this._requestInternet($target);
        break;
      case 'DIRECT':
        this._requestDirect($target);
        break;
      // case 'CHOCO':  // T멤버십 API 변경으로 인하여 더이상 사용하지 않음
      //   this._requestChocolate($target);
      //   break;
      default:
        break;
    }
  },

  /**
   * @function
   * @desc 선택된 카테고리에 따라 분기처리
   * @param {element} $target 등록버튼 엘리먼트
   */
  _requestCall_quality: function ($target) {
    var qualityCategory = this.$service_depth1.data('service-depth1'); // 선택된 카테고리
    $target.prop('disabled', true); // 등록하기 버튼 비활성화 (API 중복 호출 방지)
    switch ( qualityCategory ) {
      case 'cell':
        this._requestCell_quality($target);
        break;
      case 'internet':
        this._requestInternet_quality($target);
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
    var arrPhoneNumber = $('.fe-service_phone').val().split('-');

    return {
      cntcNum1: arrPhoneNumber[0], // 연락가능한번호 1
      cntcNum2: arrPhoneNumber[1], // 연락가능한번호 2
      cntcNum3: arrPhoneNumber[2], // 연락가능한번호 3
      email: $('.fe-service_email').val(), // 이메일
      subject: this.$wrap_tpl_service.find('.fe-text_title').val(), // 제목
      content: this.$wrap_tpl_service.find('.fe-text_content').val(), // 내용
      smsRcvYn: $('.fe-service_sms').prop('checked') ? 'Y' : 'N' // 답변 등록시 sms 수신여부
    };
  },

  /**
   * @function
   * @desc 입력된 값으로 전송시 필요한 param 반환 [여러케이스 공통 사용범위]
   * @returns {object} params
   */
  _makeParams_quality: function () {
    var arrPhoneNumber = $('.fe-quality_phone').val().split('-');
    return {
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
  },

  /**
   * @function
   * @desc 휴대폰케이스 전송
   * @param {element} $target 등록하기 버튼 포커스 관련
   */
  _requestCell: function ($target) {
    var elSelectedLine = this.$wrap_tpl_service.find('[data-svcmgmtnum]').data('svcmgmtnum'); // 서비스 관리 번호
    var $elInputLine = this.$wrap_tpl_service.find('.fe-service-line'); // 회선번호 입력된 곳
    var elInputlineVal = $elInputLine.is('button') ? $elInputLine.text() : $elInputLine.val(); // text = 마스킹된 전화번호
    var selSvcMgmtNum = !!elSelectedLine ? elSelectedLine.toString() : '0'; // 서비스관리 번호 스트링으로
    var selSvcNum = !!elInputlineVal ? elInputlineVal.replace(/-/gi, '') : '';  // 마스킹된 전화번호에서 - 제거

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
   * @desc 인터넷 케이스 전송 (품질상담)
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

  // /** T 멤버십 API 통합으로 더 이상 사용하지 않음
  //  * @function
  //  * @desc 초코렛 케이스 전송
  //  * @param {element} $target 등록하기 버튼 포커스 관련
  //  */
  // _requestChocolate: function ($target) {
  //   var htParams = $.extend(this._makeParams(), {
  //     category: this.$service_depth2.data('serviceDepth2') // 2카테고리
  //   });

  //   this._apiService.request(Tw.API_CMD.BFF_08_0021, htParams, null, null, null, { jsonp : false })
  //     .done($.proxy(this._onSuccessRequest, this, $target)).fail($.proxy(this._apiError, this, $target));
  // },

  /**
   * @function
   * @desc 휴대폰케이스 전송
   * @param {element} $target 등록하기 버튼 포커스 관련
   */
  _requestCell_quality: function ($target) {
    var elSelectedLine = this.$wrap_tpl_quality.find('[data-svcmgmtnum]').data('svcmgmtnum');
    var $elInputline = this.$wrap_tpl_quality.find('.fe-quality-line');
    var elInputlineVal = $elInputline.is('button') ? $elInputline.text() : $elInputline.val();
    var selSvcMgmtNum = !!elSelectedLine ? elSelectedLine.toString() : '0'; // 현재 와이브로 옵션 없으므로 - 대시만 없애는 방향으로 가능
    var selSvcNum = !!elInputlineVal ? elInputlineVal.replace(/-/gi, '') : '';

    // 개별적인 파라미터 정보
    var htParams = $.extend(this._makeParams_quality(), {
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
      .done($.proxy(this._onSuccessRequest_quality, this, $target))
      .fail($.proxy(this._apiError, this, $target));
  },

  /**
   * @function
   * @desc 인터넷 케이스 전송
   * @param {element} $target 등록하기 버튼 포커스 관련
   */
  _requestInternet_quality: function ($target) {
    var elSelectedLine = this.$wrap_tpl_quality.find('[data-svcmgmtnum]').data('svcmgmtnum');
    var $qualityLine = this.$wrap_tpl_quality.find('.fe-quality-line');
    var elInputline = $qualityLine.length ? (
                        $qualityLine.is('.fe-numeric') ? $qualityLine.val().replace(/-/gi, '') : $qualityLine.val()
                      ) : '';
    var selSvcMgmtNum = !!elSelectedLine ? elSelectedLine.toString() : '0';
    var selSvcNum = !!elInputline ? elInputline : '';

    // 개별 파라미터 정보
    var htParams = $.extend(this._makeParams_quality(), {
      subject: this.$wrap_tpl_quality.find('.fe-text_title').val(),
      inptZip: $('.fe-zip').length ? ($('.fe-zip').val() || '') : '',
      inptBasAddr: $('.fe-main-address').length ? ($('.fe-main-address').val() || '') : '',
      inptDtlAddr: $('.fe-detail-address').val() ? ($('.fe-detail-address').val() || '') : '',
      selSvcMgmtNum: selSvcMgmtNum,
      fileAtchYn: this.uploadObj.getQualityFilesInfo().length ? 'Y' : 'N' // 파일첨부여부
    });

    if ( selSvcMgmtNum === '0' ) {
      htParams = $.extend(htParams, { selSvcNum: selSvcNum });
      // 기획 김린아 요청: 회선이 없는 고객의 경우 [사용하시는 서비스에 맞게 항목을 다시 선택해주세요. ]
      this._popupService.openAlert(Tw.CUSTOMER_EMAIL.RETRY_SERVICE);
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0045, htParams, null, null, null, { jsonp : false })
      .done($.proxy(this._onSuccessRequest_quality, this, $target))
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
      this._history.replaceURL('/customer/emailconsult/complete?email=' + encodeURIComponent($('.fe-service_email').val()));
    } else {
      Tw.Error(res.code, res.msg).pop($.proxy(this._handleButtonAbled, this, $target), $target);
    }
  },

  /**
   * @function
   * @desc 각 전송 API 성공후 페이지 이동 에러시 에러팝업
   * @param {element} $target
   * @param {JSON} res
   */
  _onSuccessRequest_quality: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/emailconsult/complete?email=' + encodeURIComponent($('.fe-quality_email').val()));
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
    if ( $('.fe-service_depth1').attr('data-service-depth1') === 'cell' || $('.fe-service_depth1').attr('data-service-depth1') === 'internet' ) {
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
          var isValidNumber = $(item).val().length !== 0;
          arrValid.push(isValidNumber);
        }

        if ( $(item).prop('type') === 'tel' ) {
          var isPhoneNumber = (Tw.ValidationHelper.isCellPhone($(item).val()) || Tw.ValidationHelper.isTelephone($(item).val()));
          arrValid.push(isPhoneNumber);
        }

        if ( $(item).prop('type') === 'text' ) {
          var isValidText = $(item).val().length !== 0;
          arrValid.push(isValidText);
        }

        if ( $(item).prop('type') === 'textarea' ) {
          var isValidTextArea = $(item).val().length !== 0;
          arrValid.push(isValidTextArea);
        }
      });

      if ( arrValid.indexOf(false) === -1 ) {
        Tw.Logger.log('통화품질 등록하기 가능', $('.fe-quality-register').prop('disabled'));
        $('.fe-quality-register').prop('disabled', false);
        Tw.Logger.log('버튼 상태 변경 후', $('.fe-quality-register').prop('disabled'));
      } else {
        Tw.Logger.log('통화품질 등록하기 불가', $('.fe-quality-register').prop('disabled'));
        $('.fe-quality-register').prop('disabled', true);
        Tw.Logger.log('버튼 상태 변경 후', $('.fe-quality-register').prop('disabled'));
      }
    } else {
      var arrValid = [];

      this.$wrap_tpl_service.find('[required]').each(function (nIndex, item) {
        if ( $(item).prop('type') === 'checkbox' ) {
          arrValid.push($(item).prop('checked'));
        }

        if ( $(item).prop('type') === 'number') {
          var isValidNumber = $(item).val().length !== 0;
          arrValid.push(isValidNumber);
        }

        if ( $(item).prop('type') === 'tel' ) {
          var isPhoneNumber = (Tw.ValidationHelper.isCellPhone($(item).val()) || Tw.ValidationHelper.isTelephone($(item).val()));
          arrValid.push(isPhoneNumber);
        }

        if ( $(item).prop('type') === 'text' ) {
          var isValidText = $(item).val().length !== 0;
          arrValid.push(isValidText);
        }

        if ( $(item).prop('type') === 'textarea' ) {
          var isValidTextArea = $(item).val().length !== 0;
          arrValid.push(isValidTextArea);
        }
      });

      if ( arrValid.indexOf(false) === -1 && !!this.$service_depth2.data('serviceDepth2') ) {
        Tw.Logger.log('서비스문의 등록하기 가능', $('.fe-service-register').attr('disabled'));
        $('.fe-service-register').prop('disabled', false);
        Tw.Logger.log('버튼 상태 변경 후', $('.fe-service-register').attr('disabled'));
      } else {
        Tw.Logger.log('서비스문의 등록하기 불가', $('.fe-service-register').attr('disabled'));
        $('.fe-service-register').prop('disabled', true);
        Tw.Logger.log('버튼 상태 변경 후', $('.fe-service-register').attr('disabled'));
      }
    }
  },


  _validateFormByTitle: function () {
    var key = $('.fe-service_depth1').data('service-depth1') + '-TITLE';

    // 2번째 카테고리가 비노출이 아니면
    if ($('.fe-service_depth2').attr('aria-hidden') !== "true") {
      // 2번째 카테고리가 선택되지 않았으면
      if ($('.fe-service_depth2').attr('is-selected') !== "true") {
        if (this._loggedList.indexOf(key) !== -1) {
          return false;
        } else {
          this._loggedList.push(key);
          this._popupService.openAlert(Tw.CUSTOMER_EMAIL.RETRY_CATEGORY);
          return;
        }
      }
    }
  },

  _validateFormByContent: function () {
    var key = $('.fe-service_depth1').data('service-depth1') + '-CONTENT';

    // 2번째 카테고리가 비노출이 아니면
    if ($('.fe-service_depth2').attr('aria-hidden') !== "true") {
      // 2번째 카테고리가 선택되지 않았으면
      if ($('.fe-service_depth2').attr('is-selected') !== "true") {
        if (this._loggedList.indexOf(key) !== -1) {
          return false;
        } else {
          this._loggedList.push(key);
          this._popupService.openAlert(Tw.CUSTOMER_EMAIL.RETRY_CATEGORY);
          return;
        }
      }
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
  _isValidServiceEmail: function () {
    var sEmail = $('.fe-service_email').val();

    return Tw.ValidationHelper.isEmail(sEmail);
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

  /**
   * @function
   * @desc 요청 버튼 클릭가능하도록 처리 /에러팝업 열린 후 처리 등록하기 버튼 활성화 (등록하기 버튼 누르면 API 호출중 비활성화 시킴)
   * @param {element} $target
   */
  _handleButtonAbled: function ($target) {
    $target.prop('disabled', false);
  },
};
