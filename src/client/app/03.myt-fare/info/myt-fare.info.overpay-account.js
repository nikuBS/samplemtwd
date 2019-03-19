/**
 * FileName: myt-fare.info.overpay-account.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018. 9. 17
 */
Tw.MyTFareInfoOverpayAccount = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._bankList = new Tw.MyTFareBillBankList(this.$container);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTFareInfoOverpayAccount.prototype = {

  _init: function () {
    this.refundAPI_option = {
      //rfndBankNum // 계좌번호
      //svcMgmtNum: this.paramData.svcMgmtNum,
      //rfndBankCd // 은행코드
    };
  },

  _cachedElement: function () {
    this.$refundRequestBtn = this.$container.find('.fe-btn-refund button'); // send btn
    this.$bankList = this.$container.find('.bt-dropdown.big'); // 은행이름선택
    this.$bankAccountInput = this.$container.find('#fe-bank-account'); // 계좌번호 input
    this.$closeBtn = this.$container.find('.fe-btn-back'); // 닫기버튼
  },

  _bindEvent: function () {
    this.$bankList.on('click', $.proxy(this._selectBank, this));

    this.$refundRequestBtn.on('click', $.proxy(this._refundRequestSend, this));
    this.$bankAccountInput.on('keyup', $.proxy(this._accountInputHandler, this));
    this.$bankAccountInput.siblings('button.cancel').eq(0).on('click', $.proxy(this._accountInputHandler, this));
    this.$closeBtn.on('click', $.proxy(this._goBack, this)); // _closeConfirm -> _goBack

    this._refundAccountInfoUpdateCheck();
  },

  _selectBank: function (event) {
    this._bankList.init(event, $.proxy(this._checkIsAbled, this));
  },

  _checkIsAbled: function () {
    this.isBankNameSeted = true;
    this.refundAPI_option.rfndBankCd = this.$bankList.attr('id');
    this._refundAccountInfoUpdateCheck();
  },

  _refundRequestSend: function (e) {
    this._apiService.request(Tw.API_CMD.BFF_07_0088, this.refundAPI_option)
        .done($.proxy(this._successRegisterAccount, this, $(e.currentTarget)))
        .fail($.proxy(this._apiError, this, $(e.currentTarget)));
  },

  _successRegisterAccount: function($target, res) {
    if(res.code === '00') {
      this._popupService.openAlert(
        Tw.POPUP_CONTENTS.REFUND_ACCOUNT_SUCCESS,
        Tw.POPUP_TITLE.NOTIFY, 
        Tw.BUTTON_LABEL.CONFIRM, 
        $.proxy(this._refreshOverPay, this),
        null,
        $target
      );
    } else {
      if(res.code === 'ZNGME0000') {
        res.msg = Tw.ALERT_MSG_MYT_FARE.ALERT_2_A32;
      }
      this._popupService.openAlert(
        res.msg, 
        Tw.POPUP_TITLE.NOTIFY, 
        Tw.BUTTON_LABEL.CONFIRM, 
        null,
        null,
        $target
      );
    }
  },

  _refundAccountInfoUpdateCheck: function () {
    if (this.isBankNameSeted && this.isBankAccountNumberSeted) {
      this.$refundRequestBtn.attr('disabled', false);
    } else {
      this.$refundRequestBtn.attr('disabled', true);
    }
  },

  // 환불 계좌 신청 완료 후 갱신
  _refreshOverPay: function() {
    // this._popupService.close();
    this._historyService.goBack();
  },

  // 닫기 확인
  _closeConfirm: function(e) {
    if(!Tw.FormatHelper.isEmpty(this.$bankAccountInput.val()) ||
      !Tw.FormatHelper.isEmpty(this.refundAPI_option.rfndBankCd) 
    ) { 
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
  
  _accountInputHandler: function (e) {
    this.isBankAccountNumberSeted = ($(e.currentTarget).val().length > 0);
    this.refundAPI_option.rfndBankNum = $(e.currentTarget).val();
    this._refundAccountInfoUpdateCheck();
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
