/**
 * @file [이메일상담하기]
 * @author Lee Kirim
 * @since 2018-10-26
 */

 /**
 * @class 
 * @desc 이메일상담하기 class
 * @param {Object} rootEl - 최상위 element Object
 */
Tw.CustomerEmail = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmail.prototype = {

  /**
   * @function
   * @member 
   * @desc 객체 생성시 초기화에 필요한 것
   * @return {void}
   */
  _init: function () {
    // 해쉬값이 qauility 로 오면 두번째 탭인 통화품질상담 탭으로 이동
    if ( window.location.hash === '#quality' ) {
      this._goQualityTab();
    }
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - custoemr.email.html 참고
   */
  _cachedElement: function () {
    this.$btn_faq = this.$container.find('.fe-btn_faq'); // 자주하는 질문 버튼
  },

  /**
   * @function
   * @desc 이벤트 바인드 / 콘테이너에 이벤트를 주고 있어 새로 생성되는 객체에도 이벤트가 바인드 됨을 유의해야 함
   */
  _bindEvent: function () {
    var inputKeyUps = 'keyup input blur'; // 입력 이벤트 목록
    this.$btn_faq.on('click', $.proxy(this._openFaq, this)); // 자주하는 질문 클릭 -> 질문 리스트 팝업열림 - 문구 변경 : 혹시 이런 서비스를 찾고 계신가요?
    this.$container.on('click', '.cancel', $.proxy(this._onChangeContent, this)); // 인풋내 삭제버튼 클릭 -> 인풋 내용 지움
    this.$container.on('keyup blur change', '.fe-text_title', $.proxy(this._onChangeTitle, this)); // 제목입력 인풋 입력 이벤트
    this.$container.on('keyup blur change', '.fe-text_content', $.proxy(this._onChangeContent, this)); // 내용입력 인풋 입력 이벤트
    this.$container.on(inputKeyUps, '.fe-numeric', $.proxy(this._onKeyUpValidNumber, this)); // 숫자입력 형태 인풋 입력이벤트 -> 밸리데이션
    this.$container.on('blur', '.fe-numeric-uppercase', $.proxy(this._onKeyUpValidNumberUpperCase, this)); // 대문자형태 인풋 입력이벤트 -> 밸리데이션
    this.$container.on(inputKeyUps, '.fe-phone', $.proxy(this._onKeyUpPhoneNumber, this)); // 전화번호형태 인풋 입력이벤트 -> 밸리데이션
    this.$container.on(inputKeyUps, '.fe-service_email', $.proxy(this._onKeyUpEmail, this)); // 서비스카테고리 이메일 인풋 입력 이벤트 
    this.$container.on(inputKeyUps, '.fe-quality_email', $.proxy(this._onKeyUpEmail, this)); // 품질카테고리 이메일 인풋 입력 이벤트
    this.$container.on('click', '.fe-text-cancel', $.proxy(this._onTextInputClear, this)); // 받으실분 번호 삭제버튼 클릭이벤트 --> email or phone 형식의 input에 사용
    this.$container.on('keydown', 'input', $.proxy(this._preventDown, this)); // 인풋형식 keydown 이벤트 
    this.$container.on('click', '.fe-btn_addr', $.proxy(this._onClickBtnAddr, this)); // 주소록 버튼 클릭 연락가능번호 입력부분 / 앱일경우 노출되는 버튼
    this.$container.on('click', '.fe-email-close', $.proxy(this._stepBack, this)); // 창닫기 버튼 클릭시 -> 창닫기 확인
    this.$container.on('click', '.fe-service_sms', $.proxy(this._openSMSAlert, this)); // 서비스탭내 연락가능 번호 답변등록시 sms 받기 체크박스 클릭 이벤트 -> 확인창열림
    this.$container.on('click', '.fe-quality_sms', $.proxy(this._openSMSAlert, this)); // 품질탭내 연락가능 번호 답변등록시 sms 받기 체크박스 클릭 이벤트 -> 확인창 열림
    this.$container.on('click', '.fe-term-private-collect', $.proxy(this._openTermLayer, this, '55')); // 현재 사용안함 customer.email.common.template.html
    this.$container.on('click', '.fe-term-private-agree', $.proxy(this._openTermLayer, this, '37')); // 현재 사용안함 customer.email.common.template.html
    this.$container.on('click', '.fe-service-cntcNumClCd li', $.proxy(this._onChangeReceiveContact, this)); // 서비스카테고리 내 연락가능번호 휴대폰/일반전화 라디오 
    this.$container.on('click', '.fe-quality-cntcNumClCd li', $.proxy(this._onChangeReceiveContact, this)); // 품질카테고리 내 연락가능번호 휴대폰/일반전화 라디오 
    this.$container.on('click', '.tab-linker.fe-email-tab a', $.proxy(this._TabLinker, this)); // 상단 탭 링크 > a 클릭이벤트
    this.$container.on('click', '.tab-linker.fe-email-tab li', $.proxy(this._TabClick, this)); // 상단 탭 링크 클릭이벤트

    new Tw.InputFocusService(this.$container, $('.bt-fixed-area button', this.$container)); // 이동(엔터) 버튼으로 다음 입력으로 움직이도록 
  },

  /**
   * @function [웹접근성]
   * @desc 상단탭 기본적으로 wigets.js 에서 이벤트 처리 
   * 웹접근성을 위해 확산 방지 및 스택오버 방지 등 처리
   * @param {evnt} e 
   */
  _TabClick: function (e) {
    e.stopPropagation();
    // 재문의 케이스일 경우 children button 예외처리
    if($(e.currentTarget).children().is('a')){
      $(e.currentTarget).children().trigger('click');
    }
  },

  /**
   * @function [웹접근성]
   * @desc 상단탭 a 클릭 이벤트 
   * @param {event} e 
   */
  _TabLinker: function (e) {
    e.preventDefault(); // 링크이동되는 것을 막음
    e.stopPropagation();
    // 기본 적용 기능 li 에 aria-selected 를 주고 닫음 , 보이스오버로 읽히게 하려면 a 에 주어야 함
    $(e.currentTarget).attr('aria-selected', true).parent().siblings('li').find('a').attr('aria-selected', false); 

    // 등록하기 버튼 숨기기/보이기 (등록하기 버튼이 서비스문의/통화품질문의 버튼으로 나뉘어 있음)
    if ( $(e.currentTarget).parent().index() === 0 ) {
      // 서비스
      $('.fe-service-register', this.$container).removeClass('none').attr('aria-hidden', false);
      $('.fe-quality-register', this.$container).addClass('none').attr('aria-hidden', true);
    } else {
      // 통화품질
      $('.fe-service-register', this.$container).addClass('none').attr('aria-hidden', true);
      $('.fe-quality-register', this.$container).removeClass('none').attr('aria-hidden', false);
    }
    
  },

  /**
   * @function
   * @desc device 호환성 적용에 의한 처리
   * input keyup event에 이벤트 처리, keydown 이벤트 삼성브라우저에서 이슈 있어 기본 동작 막음
   * @param {event} e 
   */
  _preventDown: function(e) {
    e.stopPropagation();
  },

  /**
   * @function
   * @desc 연락가능번호 휴대폰 / 일반전화 라디오 버튼 클릭 이벤트
   * @param {event} e 
   */
  _onChangeReceiveContact: function (e) {
    var radioIndex = $(e.currentTarget).index(); // 클릭한 라디오 인덱스 0: 휴대폰. 1: 일반전화 customer.email.common.template.html 참조
    var $wrap_inquiry = $(e.currentTarget).closest('.inquiryform-wrap');
    var $phoneInput = $(e.currentTarget).parentsUntil('.inquiryform-wrap').parent().find('.fe-service_phone, .fe-quality_phone');
    var $wrap_sms = $wrap_inquiry.find('.fe-wrap-sms');
    if ( radioIndex === 0 ) {
      // 휴대폰 케이스
      $wrap_sms.show().attr('aria-hidden', false); // sms 받기 
      $phoneInput.addClass('_cell').removeClass('_phone').trigger('keyup');
    } else {
      // 일반전화 케이스
      $wrap_sms.hide().attr('aria-hidden', true);
      $phoneInput.removeClass('_cell').addClass('_phone').trigger('keyup');
    }
  },

  /**
   * @function
   * @desc 주소록 버튼 클릭 이벤트 앱과 연동 
   * @param {event} e 
   */
  _onClickBtnAddr: function (e) {
    var $elInput = $(e.currentTarget).closest('.inputbox').find('input'); // 주소록 전화번호가 입력될 input
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this, $elInput)); // _onContact -> 주소록 선택 후 콜백 function
  },

  /**
   * @function _onClickBtnAddr callback
   * @desc 앱 주소록 응답값 input 에 입력 
   * @param {element} $elInput 전화번호가 입력될 input
   * @param {JSON} response 주소록으로부터 응답값
   */
  _onContact: function ($elInput, response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      // keyup trigger:  $elInput fe-phone 클래스 _onKeyUpPhoneNumber 함수를 호출함
      $elInput.val(params.phoneNumber).trigger('keyup');
    }
  },

  /**
   * @function
   * @desc fe-phone 클래스가 있는 모듬 input 의 keyup 이벤트
   * 밸리데이션 체크 
   * @param {event} e 
   */
  _onKeyUpPhoneNumber: function (e) {
    var $elPhone = $(e.currentTarget); // 이벤트 대상
    $elPhone.val(Tw.StringHelper.phoneStringToDash($elPhone.val())); // xxxxxxxxxx -> xxx-xxx-xxxx 
    var $elErrorPhone = $elPhone.closest('.inputbox').siblings('.fe-error-phone'); // 밸리데이션 문구 

    // 초반에 템플릿 불려오면 _cell _phone 클래스 둘다 없음 // 라디오 버튼 핸드폰/전화번호 선택에 따라 클래스를 변경함 (기본값: 핸드폰) 
    // _cell or (none) => true / _phone => false
    // 핸드폰 밸리데이션여부
    var isCellVali = !$elPhone.is('._phone'); 
    var isVali = isCellVali ? this._isValidCell($elPhone.val() || '') : this._isValidTel($elPhone.val() || ''); // 밸리데이션 핸드폰/전화번호 구분해 밸리데이션

    // 밸리데이션 문구 노출여부 결정, 추가고려 : 빈값이면 밸리데이션 체크 하지 않음
    if ( isVali || Tw.FormatHelper.isEmpty($elPhone.val())) {
      $elErrorPhone.addClass('blind').attr('aria-hidden', true);
    } else {
      $elErrorPhone.removeClass('blind').attr('aria-hidden', false);
    }
  },

  /**
   * @function
   * @desc fe-numeric 클래스 input keyup 이벤트 숫자 제외하고 입력된 값 삭제
   * @param {event} e 
   */
  _onKeyUpValidNumber: function (e) {
    var $elNumber = $(e.currentTarget);
    var number = !!$elNumber.val() ? $elNumber.val() : '';
    var sNumber = number.match(/\d+/g);

    $elNumber.val(sNumber);
  },

  /**
   * @function
   * @desc fe-numeric-uppercase 클래스 input keyup 이벤트 / 영문대문자 + 숫자
   * @param {event} e 
   */
  _onKeyUpValidNumberUpperCase: function (e) {    
    var $el = $(e.currentTarget);
    var value = !!$el.val() ? $el.val() : '';
    var sValue = value.match(/[\dA-Z]+/gi);
    
    $el.val((sValue || []).join().toString().toUpperCase());
  },

  /**
   * @function
   * @desc fe-service_email fe-quality_email 클래스 input keyup 이벤트 / 이메일 형식 검사
   * @param {event} e
   */
  _onKeyUpEmail: function (e) {
    var $elEmail = $(e.currentTarget);
    var $elErrorEmail = $elEmail.closest('.inputbox').siblings('.fe-error-email'); // 이메일 밸리데이션 문구

    // 이메일형식 or 빈값일때 밸리데이션 문구 숨김
    if ( this._isValidEmail($elEmail.val()) || Tw.FormatHelper.isEmpty($elEmail.val())) {
      $elErrorEmail.addClass('blind').attr('aria-hidden', true);
    } else {
      $elErrorEmail.removeClass('blind').attr('aria-hidden', false);
    }
  },

  /**
   * @function
   * @desc 전화번호 or 핸드폰 형식이면 true 
   * @param {string} sPhoneNumber 
   * @returns {boolean}
   */
  _isValidPhone: function (sPhoneNumber) {
    return Tw.ValidationHelper.isTelephone(sPhoneNumber) || Tw.ValidationHelper.isCellPhone(sPhoneNumber);
  },

  /**
   * @function
   * @desc 핸드폰 형식이면 true
   * @param {string} sPhoneNumber 
   * @returns {boolean}
   */
  _isValidCell: function (sPhoneNumber) {
    return Tw.ValidationHelper.isCellPhone(sPhoneNumber);
  },

  /**
   * @function
   * @desc 전화번호 형식이면 true
   * @param {string} sPhoneNumber 
   * @returns {boolean}
   */
  _isValidTel: function (sPhoneNumber) {
    return Tw.ValidationHelper.isTelephone(sPhoneNumber);
  },

  /**
   * @function
   * @desc 이메일 형식이면 true
   * @param {string} sEmail 
   * @returns {boolean}
   */
  _isValidEmail: function (sEmail) {
    return Tw.ValidationHelper.isEmail(sEmail);
  },

  /**
   * @function
   * @desc 받으실분 번호 삭제버튼 클릭이벤트 이메일 형식이나 전화번호 형식 input의 삭제버튼에 사용함을 전제 / 인풋삭제시 밸리데이션 문구 삭제
   * 이메일인풋, 전화번호 삭제버튼 클릭 후 추가 밸리데이션 정보 가리기
   * @param {event} e 
   */
  _onTextInputClear: function (e) {
    var valiClass = ''
    if ($(e.currentTarget).siblings('input').attr('class').indexOf('email') >= 0 ) {
      valiClass = 'fe-error-email';
    } else {
      valiClass = 'fe-error-phone';
    }
    $(e.currentTarget).closest('.inputbox').siblings('.' + valiClass).addClass('blind').attr('aria-hidden', true);
  },

  /**
   * @function
   * @desc 제목입력 textarea keyup 이벤트 최대글자 수 20 까지만 노출되도록 
   * @param {event} e 
   */
  _onChangeTitle: function (e) {
    var nMaxTitle = 20;
    var $elTarget = $(e.currentTarget);
    var sMaxValue = !!$elTarget.val() ? $elTarget.val().slice(0, nMaxTitle) : $elTarget.val();
    var $elLength = $elTarget
      .closest('.inputbox')
      .find('.byte-current');

    $elTarget.val(sMaxValue);
    $elLength.text(Tw.FormatHelper.convNumFormat(sMaxValue.length));

    this.$container.trigger('validateForm');
  },

  /**
   * @function
   * @desc 내용입력 textarea keyup 이벤트 최대글자 수 12000 까지만 노출되도록
   * @param {event} e 
   */
  _onChangeContent: function (e) {
    var nMaxContent = 12000;
    var $elTarget = $(e.currentTarget);
    var sMaxValue = !!$elTarget.val() ? $elTarget.val().slice(0, nMaxContent) : $elTarget.val();
    var $elLength = $elTarget
      .closest('.inputbox')
      .find('.byte-current');

    $elTarget.val(sMaxValue);
    $elLength.text(Tw.FormatHelper.convNumFormat(sMaxValue.length));

    this.$container.trigger('validateForm');
  },

  /**
   * @function
   * @desc 통화품질상담 탭으로 이동
   */
  _goQualityTab: function () {
    var $tab1 = this.$container.find('#tab1');
    var $tab2 = this.$container.find('#tab2');
    // 해당 속성을 바꾸면 widgets.js 에서 로딩시 하위 노출 콘텐츠를 바꿔준다. (로딩 순서)
    $tab1.attr('aria-selected', false);
    $tab2.attr('aria-selected', true);
  },

  /**
   * @function
   * @desc 자주하는질문 버튼 클릭 풀팝업 
   * @param {event} e 
   */
  _openFaq: function (e) {
    e.preventDefault();
    var isCell = $('.fe-service_depth1').data('serviceDepth1') === 'CELL'; // 선택된 카테고리가 핸드폰인지 여부 
    /**
     * @function 
     * @param {Object} {hbs: hbs 의 파일명, layer: 레이어 여부, title: 액션시트 제목, data: 데이터 리스트, btnfloating: {txt: 닫기버튼 문구, attr: 닫기버튼 attribute, class: 닫기버튼 클래스}}
     * @param {function} function_open_call_back 액션시트 연 후 호출 할 function
     * @param {function} function_close_call_back 액션시트 닫힌 후 호출할 function
     * @param {string} 액션시트 열 때 지정할 해쉬값, 기본값 popup{n}
     * @param {Object} $target 액션시트 닫힐 때 포커스 될 엘리먼트 여기에서는 카테고리 선택 버튼
     * @desc 라디오 선택 콤보박스 형태
     */
    this._popupService.open({
        hbs: 'CS_04_01_L01',
        layer: true,
        btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: {isCell: isCell}
      },
      $.proxy(this._handleLinkControll, this), null, null,
      $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 자주하는질문 팝업 열리고 callback
   * @param {element} $template 팝업 객체
   */
  _handleLinkControll: function ($template) {
    // 링크형식 클릭이벤트 바인드
    $template.on('click', '.link-long a', $.proxy(this._clickFaqLink, this));
  },

  /**
   * @function
   * @desc replaceURL 팝업을 닫고 링크이동을 하면 뒤로가기로 다시 해당 페이지 접근하면 스크립트가 동작하지 않는오류가 있다 (IOS, 삼성 브라우저등에서)
   * @param {event} e 
   */
  _clickFaqLink: function (e) {
    e.preventDefault();
    e.stopPropagation();
    this._history.replaceURL($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 답변등록시 문자로 받기 체크박스 체크시 알림팝업 노출
   * @param {event} e 
   */
  _openSMSAlert: function (e) {
    // 체크되었을때만 팝업이 노출
    if ( $(e.currentTarget).prop('checked') ) {
      /**
       * @desc 포인트 예약취소 알림 팝업
       * @param {string} msg 확인 메세지
       * @param {string} title 확인 제목
       * @param {string} label 확인 버튼 문구
       * @param {function} close_call_back_function 창 닫힌 후 실행할 function
       * @param {Object} $target 창 닫힌 후 포커스 될 타겟 element
       */
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.SMS_ALARM,
        null,
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        null,
        $(e.currentTarget)
      );
    }
  },

  /**
   * @function
   * @desc 이메일상담하기 닫기버튼 클릭시 닫기 확인 팝업 노출
   * @param {event} e 
   */
  _stepBack: function (e) {
    var confirmed = false;
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
      $.proxy(function () {
        confirmed = true;
        this._popupService.close();
      }, this),
      $.proxy(function () {
        if ( confirmed ) {
          this._history.goBack();
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES,
      $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 이용약관 팝업열기 현재 사용안하고 있음
   * @param {string} sCode 
   */
  _openTermLayer: function (sCode) {
    Tw.CommonHelper.openTermLayer(sCode);
  }
};

