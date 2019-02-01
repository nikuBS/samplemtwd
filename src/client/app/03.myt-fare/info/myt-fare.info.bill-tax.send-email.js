/*
 * FileName: myt-fare.info.bill-email.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2019. 2. 1
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
}

Tw.MyTFareInfoBillTaxSendEmail.prototype = {
  _init: function() {

  },

  _cachedElement: function() {
    this.$emailInput = this.$container.find('.input input[type="text"]');
    this.$rerequestSendBtn = this.$container.find('.fe-submit button');
    this.$textValidation = this.$container.find('.input-txt-type02');
  },

  _bindEvent: function() {
    this.$rerequestSendBtn.on('click', $.proxy(this._sendRerequestByEmail, this));
    this.$emailInput.on('keyup', $.proxy(this._checkEmailValue, this));
    this.$emailInput.on('focusout', $.proxy(this._checkEmailValidation, this));
    this.$emailInput.siblings('.cancel').on('click', $.proxy(function() {
      this.$emailInput.val('').trigger('keyup');
      this.$rerequestSendBtn.attr('disabled', true);
    }, this));
    this.$emailInput.trigger('keyup');
    this.$container.find('.fe-btn-back').on('click', $.proxy(this._closeResendByEmail, this));
  },

  // 이메일 인풋 포커스 아웃 시 밸리데이션
  _checkEmailValidation: function (e) {
    if (Tw.ValidationHelper.isEmail($(e.currentTarget).val()) || 
      Tw.FormatHelper.isEmpty($(e.currentTarget).val())
    ) {
      this.$textValidation.hide();
    } else {
      this.$textValidation.show();
    }
  },

  // 닫기 확인
  _closeResendByEmail: function () {
    if(!Tw.FormatHelper.isEmpty(this.$emailInput.val())) {
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
        $.proxy(this._closePopAndBack, this),
        null,
        Tw.BUTTON_LABEL.NO,
        Tw.BUTTON_LABEL.YES
      );
    } else {
      this._goBack();
    }
  },

  _checkEmailValue: function (e) {
    this.$rerequestSendBtn.attr('disabled', !Tw.ValidationHelper.isEmail($(e.currentTarget).val()));
  },
  
  _sendRerequestByEmail: function () {    
    this._apiService.request(Tw.API_CMD.BFF_07_0018, {
      eMail:this.$emailInput.val(), 
      selType:'M', 
      selSearch:this.data.taxBillYearMonth
    }).done($.proxy(this._resSendCallback, this)).fail();
  },

  _resSendCallback: function(res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(res.code, res.msg).pop();
    }

    this._popupService.openAlert(
      this.$emailInput.val()+ " "+ Tw.ALERT_MSG_MYT_FARE.ALERT_2_A29,
      Tw.POPUP_TITLE.NOTIFY, 
      Tw.BUTTON_LABEL.CONFIRM, 
      $.proxy(this._closePopAndBack, this),
      $.proxy(this._closePopAndBack, this)
    );
  },

  _closePopAndBack: function() {
    this._popupService.close();
    this._goBack();
  },

  _goBack: function() {
    this._historyService.goBack();
  }
}