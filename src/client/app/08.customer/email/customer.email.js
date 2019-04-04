/**
 * @file customer.email.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.10.26
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
  _init: function () {
    // If there is hash #auto, show second tab(auto gift)
    if ( window.location.hash === '#quality' ) {
      this._goQualityTab();
    }
  },

  _cachedElement: function () {
    this.$btn_faq = this.$container.find('.fe-btn_faq');
  },

  _bindEvent: function () {
    var inputKeyUps = 'keyup input blur';
    this.$btn_faq.on('click', $.proxy(this._openFaq, this));
    this.$container.on('click', '.cancel', $.proxy(this._onChangeContent, this));
    this.$container.on('keyup blur change', '.fe-text_title', $.proxy(this._onChangeTitle, this));
    this.$container.on('keyup blur change', '.fe-text_content', $.proxy(this._onChangeContent, this));
    this.$container.on(inputKeyUps, '.fe-numeric', $.proxy(this._onKeyUpValidNumber, this));
    this.$container.on('blur', '.fe-numeric-uppercase', $.proxy(this._onKeyUpValidNumberUpperCase, this));
    this.$container.on(inputKeyUps, '.fe-phone', $.proxy(this._onKeyUpPhoneNumber, this));
    // this.$container.on(inputKeyUps, '.fe-service_phone', $.proxy(this._onKeyUpPhoneNumber, this));
    // this.$container.on(inputKeyUps, '.fe-quality_phone', $.proxy(this._onKeyUpPhoneNumber, this));
    this.$container.on(inputKeyUps, '.fe-service_email', $.proxy(this._onKeyUpEmail, this));
    this.$container.on(inputKeyUps, '.fe-quality_email', $.proxy(this._onKeyUpEmail, this));
    this.$container.on('click', '.fe-text-cancel', $.proxy(this._onTextInputClear, this));
    this.$container.on('keydown', 'input', $.proxy(this._preventDown, this));
    this.$container.on('click', '.fe-btn_addr', $.proxy(this._onClickBtnAddr, this));
    this.$container.on('click', '.fe-email-close', $.proxy(this._stepBack, this));
    this.$container.on('click', '.fe-service_sms', $.proxy(this._openSMSAlert, this));
    this.$container.on('click', '.fe-quality_sms', $.proxy(this._openSMSAlert, this));
    this.$container.on('click', '.fe-term-private-collect', $.proxy(this._openTermLayer, this, '55'));
    this.$container.on('click', '.fe-term-private-agree', $.proxy(this._openTermLayer, this, '37'));
    this.$container.on('click', '.fe-service-cntcNumClCd li', $.proxy(this._onChangeReceiveContact, this));
    this.$container.on('click', '.fe-quality-cntcNumClCd li', $.proxy(this._onChangeReceiveContact, this));
    this.$container.on('click', '.tab-linker.fe-email-tab a', $.proxy(this._TabLinker, this));
    this.$container.on('click', '.tab-linker.fe-email-tab li', $.proxy(this._TabClick, this));

    new Tw.InputFocusService(this.$container, $('.bt-fixed-area button', this.$container)); // 이동 버튼으로 다음 입력으로 움직이도록 
  },

  _TabClick: function (e) {
    e.stopPropagation();
    // 재문의 케이스일 경우 children button 예외처리
    if($(e.currentTarget).children().is('a')){
      $(e.currentTarget).children().trigger('click');
    }
  },

  _TabLinker: function (e) {
    e.preventDefault(); // 링크이동되는 것을 막음
    e.stopPropagation();
    // 기본 적용 기능 li 에 aria-selected 를 주고 닫음 , 읽히게 하려면 a 에 주어야 함
    $(e.currentTarget).attr('aria-selected', true).parent().siblings('li').find('a').attr('aria-selected', false); 

    // 버튼 수정
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

  _preventDown: function(e) {
    e.stopPropagation();
  },

  _onChangeReceiveContact: function (e) {
    var radioIndex = $(e.currentTarget).index();
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

  _onClickBtnAddr: function (e) {
    var $elInput = $(e.currentTarget).closest('.inputbox').find('input');
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this, $elInput));
  },

  _onContact: function ($elInput, response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      $elInput.val(params.phoneNumber).trigger('keyup');
    }
  },

  _onKeyUpPhoneNumber: function (e) {
    var $elPhone = $(e.currentTarget);
    $elPhone.val(Tw.StringHelper.phoneStringToDash($elPhone.val()));
    var $elErrorPhone = $elPhone.closest('.inputbox').siblings('.fe-error-phone');

    var isCellVali = !$elPhone.is('._phone'); // 초반에 템플릿 불려오면 _cell _phone 클래스 둘다 없음 // 기본값 핸드폰 검사
    var isVali = isCellVali ? this._isValidCell($elPhone.val() || '') : this._isValidTel($elPhone.val() || ''); 

    if ( isVali || Tw.FormatHelper.isEmpty($elPhone.val())) {
      $elErrorPhone.addClass('blind').attr('aria-hidden', true);
    } else {
      $elErrorPhone.removeClass('blind').attr('aria-hidden', false);
    }
  },

  _onKeyUpValidNumber: function (e) {
    var $elNumber = $(e.currentTarget);
    var number = !!$elNumber.val() ? $elNumber.val() : '';
    var sNumber = number.match(/\d+/g);

    $elNumber.val(sNumber);
  },

  // 영문대문자 + 숫자
  _onKeyUpValidNumberUpperCase: function (e) {    
    var $el = $(e.currentTarget);
    var value = !!$el.val() ? $el.val() : '';
    var sValue = value.match(/[\dA-Z]+/gi);
    
    $el.val((sValue || []).join().toString().toUpperCase());
  },

  _onKeyUpEmail: function (e) {
    var $elEmail = $(e.currentTarget);
    var $elErrorEmail = $elEmail.closest('.inputbox').siblings('.fe-error-email');

    if ( this._isValidEmail($elEmail.val()) || Tw.FormatHelper.isEmpty($elEmail.val())) {
      $elErrorEmail.addClass('blind').attr('aria-hidden', true);
    } else {
      $elErrorEmail.removeClass('blind').attr('aria-hidden', false);
    }
  },

  _isValidPhone: function (sPhoneNumber) {
    return Tw.ValidationHelper.isTelephone(sPhoneNumber) || Tw.ValidationHelper.isCellPhone(sPhoneNumber);
  },

  _isValidCell: function (sPhoneNumber) {
    return Tw.ValidationHelper.isCellPhone(sPhoneNumber);
  },

  _isValidTel: function (sPhoneNumber) {
    return Tw.ValidationHelper.isTelephone(sPhoneNumber);
  },

  _isValidEmail: function (sEmail) {
    return Tw.ValidationHelper.isEmail(sEmail);
  },

  // 이메일인풋, 전화번호 삭제버튼 클릭 후 추가 밸리데이션 정보 가리기
  _onTextInputClear: function (e) {
    var valiClass = '';
    if ($(e.currentTarget).siblings('input').attr('class').indexOf('email') >= 0 ) {
      valiClass = 'fe-error-email';
    } else {
      valiClass = 'fe-error-phone';
    }
    $(e.currentTarget).closest('.inputbox').siblings('.' + valiClass).addClass('blind').attr('aria-hidden', true);
  },

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

  _goQualityTab: function () {
    var $tab1 = this.$container.find('#tab1');
    var $tab2 = this.$container.find('#tab2');
    $tab1.attr('aria-selected', false);
    $tab2.attr('aria-selected', true);
  },

  _openFaq: function (e) {
    e.preventDefault();
    var isCell = $('.fe-service_depth1').data('serviceDepth1') === 'CELL';
    this._popupService.open({
        hbs: 'CS_04_01_L01',
        layer: true,
        // title: Tw.CUSTOMER_VOICE.LINE_CHOICE,
        btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: {isCell: isCell}
      },
      $.proxy(this._handleLinkControll, this), null, null,
      $(e.currentTarget)
    );
  },

  // 링크 이동 시 팝업을 닫지 않으면 뒤로가기로 돌아왔을 때 popupservice event 가 작동하지 않는 현상 : 삼성 브라우저 한
  _handleLinkControll: function ($template) {
    $template.on('click', '.link-long a', $.proxy(this._clickFaqLink, this));
  },

  _clickFaqLink: function (e) {
    e.preventDefault();
    e.stopPropagation();
    // this._popupService.close();
    // this._history.goLoad($(e.currentTarget).attr('href'));
    this._history.replaceURL($(e.currentTarget).attr('href'));
  },

  _openSMSAlert: function (e) {
    if ( $(e.currentTarget).prop('checked') ) {
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.SMS_ALARM,
        null,
        //Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        null,
        $(e.currentTarget)
      );
    }
  },

  _stepBack: function (e) {
    // this._backAlert.onClose();
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

  _openTermLayer: function (sCode) {
    Tw.CommonHelper.openTermLayer(sCode);
  }
};

