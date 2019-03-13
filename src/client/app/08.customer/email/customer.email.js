/**
 * FileName: customer.email.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.26
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
    this.$container.on(inputKeyUps, '.fe-service_phone', $.proxy(this._onKeyUpPhoneNumber, this));
    this.$container.on(inputKeyUps, '.fe-quality_phone', $.proxy(this._onKeyUpPhoneNumber, this));
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
    this.$container.on('click', '.fe-service-cntcNumClCd', $.proxy(this._onChangeReceiveContact, this));
    this.$container.on('click', '.fe-quality-cntcNumClCd', $.proxy(this._onChangeReceiveContact, this));
  },

  _preventDown: function(e) {
    e.stopPropagation();
  },

  _onChangeReceiveContact: function (e) {
    var radioIndex = $(e.currentTarget).find('.radiobox.focus').index();
    var $wrap_inquiry = $(e.currentTarget).closest('.inquiryform-wrap');
    var $wrap_sms = $wrap_inquiry.find('.fe-wrap-sms');
    if ( radioIndex === 0 ) {
      $wrap_sms.show().attr('aria-hidden', false);
    } else {
      $wrap_sms.hide().attr('aria-hidden', true);
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

    if ( this._isValidPhone($elPhone.val()) || Tw.FormatHelper.isEmpty($elPhone.val()) ) {
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

  _isValidEmail: function (sEmail) {
    return Tw.ValidationHelper.isEmail(sEmail);
  },

  // 이메일인풋, 전화번호 삭제버튼 클릭 후 추가 밸리데이션 정보 가리기
  _onTextInputClear: function (e) {
    $(e.currentTarget).closest('.inputbox').siblings('.error-txt').addClass('blind').attr('aria-hidden', true);
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
      null,
      null
    );
  },

  _openSMSAlert: function (e) {
    if ( $(e.currentTarget).prop('checked') ) {
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.SMS_ALARM,
        null,
        //Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM,
        null
      );
    }
  },

  _stepBack: function () {
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
      Tw.BUTTON_LABEL.YES
    );
  },

  _openTermLayer: function (sCode) {
    Tw.CommonHelper.openTermLayer(sCode);
  }
};

