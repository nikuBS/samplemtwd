/**
 * @file customer.email.quality.retry.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.11.08
 */

Tw.CustomerEmailQualityRetry = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailQualityRetry.prototype = {
  _init: function () {
    $('.fe-inqid').hide();
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-quality-register', $.proxy(this._retry_inquiry, this));
    this.$container.on('change', '[required]', $.proxy(this._validateForm, this));
    this.$container.on('validateForm', $.proxy(this._validateForm, this));
    this.$container.on('click', '.prev-step', $.proxy(this._stepBack, this));

    new Tw.InputFocusService(this.$container, $('.bt-fixed-area button', this.$container)); // 이동 버튼으로 다음 입력으로 움직이도록 (컨테이터, 마지막 이동버튼)
  },

  _makeParams: function () {
    var arrPhoneNumber = $('.fe-quality_phone').val().split('-');

    return {
      supInqId: $('.fe-inqid').text(),
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15',
      cntcNum1: arrPhoneNumber[0],
      cntcNum2: arrPhoneNumber[1],
      cntcNum3: arrPhoneNumber[2],
      email: $('.fe-quality_email').val(),
      subject: this.$container.find('.fe-text_title').val(),
      content: this.$container.find('.fe-text_content').val(),
      smsRcvYn: $('.fe-quality_sms').prop('checked') ? 'Y' : 'N'
    };
  },

  _retry_inquiry: function (event) {
    var $curTarget = $(event.currentTarget);

    // 번호 검증
    if ( !this._isValidPhone() ) {
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

    // 이메일 검증
    if ( !this._isValidEmail() ) {
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
      '연락 가능한 번호 ('+ $('.fe-quality_phone').val() + ')가 정확하게 입력되었나요?',
      null,
      $.proxy(function(){
        this._apiService.request(Tw.API_CMD.BFF_08_0012, this._makeParams(), null, null, null, { jsonp : false })
          .done($.proxy(this._request_inquiry, this));
      }, this), null, Tw.POPUP_TITLE.EDIT, Tw.POPUP_TITLE.JOIN, $curTarget);
  },

  _request_inquiry: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/customer/emailconsult/complete?email=' + encodeURIComponent($('.fe-quality_email').val()));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _validateForm: function () {
    var arrValid = [];

    this.$container.find('[required]').each(function (nIndex, item) {
      if ( $(item).prop('type') === 'checkbox' ) {
        arrValid.push($(item).prop('checked'));
      }

      if ( $(item).prop('type') === 'number' ) {
        var isValidNumber = $(item).val().length !== 0;
        arrValid.push(isValidNumber);
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
      $('.fe-quality-register').prop('disabled', false);
    } else {
      $('.fe-quality-register').prop('disabled', true);
    }
  },

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
        if (confirmed) {
          this._historyService.goBack();
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES,
      $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 전화번호 형식 검사
   * @returns {boolean}
   */
  _isValidPhone: function () {
    var sPhone = $('.fe-quality_phone').val();
    return Tw.ValidationHelper.isCellPhone(sPhone) || Tw.ValidationHelper.isTelephone(sPhone);
  },

  /**
   * @function
   * @desc 이메일 형식 검사
   * @returns {boolean}
   */
  _isValidEmail: function () {
    var sEmail = $('.fe-quality_email').val();
    return Tw.ValidationHelper.isEmail(sEmail);
  },
};

