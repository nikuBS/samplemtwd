/**
 * @file myt-fare.info.bill-email.js
 * @author Lee Kirim (kirim@sk.com)
 * @since 2019. 2. 1
*/

Tw.MyTFareInfoBillTaxSendEmail = function (rootEl, data) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);  

  this.data = JSON.parse(data);

  this._cachedElement();
  
  this._init();
  this._bindEvent();
};

Tw.MyTFareInfoBillTaxSendEmail.prototype = {
  _init: function() {

  },

  _cachedElement: function() {
    this.$emailInput = this.$container.find('.input input[type="text"]');
    this.$rerequestSendBtn = this.$container.find('.fe-submit button');
    this.$validataionTxt = this.$container.find('.fe-validation');
    // this.$textValidation = this.$container.find('.fe-txt-wrong-email');
  },

  _bindEvent: function() {
    this.$rerequestSendBtn.on('click', $.proxy(this._sendRerequestByEmail, this));
    this.$emailInput.on('keyup focusout', $.proxy(this._checkEmailValue, this));
    // this.$emailInput.on('focusout', $.proxy(this._checkEmailValidation, this));
    this.$emailInput.siblings('.cancel').on('click', $.proxy(function() {
      this.$emailInput.val('').trigger('keyup');
      this.$rerequestSendBtn.attr('disabled', true);
      this._checkEmailValidation();
    }, this));
    // this.$emailInput.trigger('keyup');
    this.$container.find('.fe-btn-back').on('click', $.proxy(this._goBack, this)); // _closeResendByEmail -> _goBack
  },

  // 이메일 인풋 포커스 아웃 시 밸리데이션
  _checkEmailValidation: function () {
    if (Tw.ValidationHelper.isEmail(this.$emailInput.val()) || 
      Tw.FormatHelper.isEmpty(this.$emailInput.val())
    ) {
      this.$textValidation.hide();
    } else {
      this.$textValidation.show();
    }
  },

  // 닫기 확인
  _closeResendByEmail: function (e) {
    if(!Tw.FormatHelper.isEmpty(this.$emailInput.val())) {
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
        $.proxy(this._closePopAndBack, this),
        null,
        Tw.BUTTON_LABEL.NO,
        Tw.BUTTON_LABEL.YES,
        $(e.currentTarget)
      );
    } else {
      this._goBack();
    }
  },

  _checkEmailValue: function (e) {
    var isEmail = Tw.ValidationHelper.isEmail($(e.currentTarget).val());
    var isEmpty = Tw.FormatHelper.isEmpty($(e.currentTarget).val());
    if (isEmpty) {
      this.$validataionTxt.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V42);
    } 
    else if (!isEmail) {
      this.$validataionTxt.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V21);
    }
    if(!isEmpty && isEmail) {
      this.$rerequestSendBtn.attr('disabled', false);
      this.$validataionTxt.attr('aria-hidden', true).addClass('blind').text('');
    } else {
      this.$rerequestSendBtn.attr('disabled', true);
      this.$validataionTxt.attr('aria-hidden', false).removeClass('blind');
    }
    // this.$rerequestSendBtn.attr('disabled', !Tw.ValidationHelper.isEmail($(e.currentTarget).val()));
  },
  
  _sendRerequestByEmail: function (e) {    
    this._apiService.request(Tw.API_CMD.BFF_07_0018, {
      eMail:this.$emailInput.val(), 
      selType:'M', 
      selSearch:this.data.taxBillYearMonth
    }).done($.proxy(this._resSendCallback, this, $(e.currentTarget)))
    .fail($.proxy(this._apiError, this, $(e.currentTarget)));
  },

  _resSendCallback: function($target, res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return this._apiError($target, res); // Tw.Error(res.code, res.msg).pop();
    }

    this._popupService.openAlert(
      this.$emailInput.val()+ ' ' + Tw.ALERT_MSG_MYT_FARE.ALERT_2_A29,
      Tw.POPUP_TITLE.NOTIFY, 
      Tw.BUTTON_LABEL.CONFIRM, 
      $.proxy(this._goBack, this),
      null,
      $target
    );
  },

  _closePopAndBack: function() {
    this._popupService.close();
    this._goBack();
  },

  _goBack: function() {
    this._historyService.goBack();
  },

  _apiError: function ($target, err) {
    return Tw.Error(err.code, err.msg).pop(null, $target);
  }
};
