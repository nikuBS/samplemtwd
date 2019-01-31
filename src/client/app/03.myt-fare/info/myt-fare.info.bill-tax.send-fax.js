/*
 * FileName: myt-fare.info.bill-tax.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2019. 1. 31
*/

Tw.MyTFareInfoBillTaxSendFax = function (rootEl, data) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);  

  this.data = JSON.parse(data);

  this._cachedElement();
  
  this._init();
  this._bindEvent();
}

Tw.MyTFareInfoBillTaxSendFax.prototype = {
  _init: function() {

  },

  _cachedElement: function() {
    this.$faxNumberInput = this.$container.find('.input input[type="tel"]');
    this.$rerequestSendBtn = this.$container.find('.fe-submit button');
  },

  _bindEvent: function() {
    this.$rerequestSendBtn.on('click', $.proxy(this._sendRerequestByFax, this));
    this.$faxNumberInput.on('keyup', $.proxy(this._checkFaxNumber, this));
    this.$faxNumberInput.siblings('.cancel').on('click', $.proxy(function() {
      this.$faxNumberInput.val('').trigger('keyup');
      this.$rerequestSendBtn.attr('disabled', true);
    }, this));
    this.$faxNumberInput.trigger('keyup');
    this.$container.find('.fe-btn-back').on('click', $.proxy(this._closeResendByFax, this));
  },

  // 닫기 확인
  _closeResendByFax: function () {
    if(!Tw.FormatHelper.isEmpty(this.$faxNumberInput.val())) { 
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

  _checkFaxNumber: function (e) {
    Tw.InputHelper.inputNumberOnly(e.currentTarget);
    this.$rerequestSendBtn.attr('disabled', ( $(e.currentTarget).val().length < 8 ));
  },
  
  _sendRerequestByFax: function () {    
    this._apiService.request(Tw.API_CMD.BFF_07_0019, {
        fax:this.$faxNumberInput.val(),
        selSearch: this.data.taxBillYearMonth,
        selType:'M'
      })
        .done($.proxy(this._resSendCallback, this)).fail();
  },

  _resSendCallback: function(res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(res.code, res.msg).pop();
    }

    this._popupService.openAlert(
      Tw.FormatHelper.getDashedPhoneNumber(this.$faxNumberInput.val())+ " "+ Tw.ALERT_MSG_MYT_FARE.ALERT_2_A28,
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