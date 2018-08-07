/**
 * FileName: myt.bill.history.micro.detail.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.02
 */

Tw.MyTBillHistoryMicroDetail = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.MyTBillHistoryCommon(rootEl);

  this.updateUseMicroPayAPI = Tw.API_CMD.BFF_05_0082;

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.MyTBillHistoryMicroDetail.prototype = {
  _init: function () {
    this.query = this.common.parse_query_string();

    console.log(this.query);

    this.$telTextWrap.html(Tw.FormatHelper.getDashedPhoneNumber(this.query.cpTel));

    switch(this.query.type) {
      case '0':
        this.btnProcessCallback = this._autoPaymentBlindProcess;
        break;
      case '1':
        this.btnProcessCallback = this._autoPaymentUnBlindProcess;
        break;
      default:
        break;
    }
  },

  _cachedElement: function () {
    this.$telTextWrap = this.$container.find('.fe-tel-text');
    this.$autoPaymentBlindBtn = this.$container.find('.fe-payment-type button');
    this.$confirmBtn = this.$container.find('.cont-box .bt-blue1 button');
  },

  _bindDOM: function () {
    this.$confirmBtn.on('click', $.proxy(this.common._history.goBack, this));
    this.$autoPaymentBlindBtn.on('click', $.proxy(this.btnProcessCallback, this));
  },

  _autoPaymentBlindProcess: function () {
    switch(this.query.payMethod) {
      case 'A0':
      case 'A1':
        this.stateCode = 'C';
        this.alertMessage = Tw.MSG_MYT.HISTORY_ALERT_A5;
        break;
      default:
        this.stateCode = 'A';
        this.alertMessage = Tw.MSG_MYT.HISTORY_ALERT_A3;
        break;
    }

    this._openConfirmPopup();
  },

  _autoPaymentUnBlindProcess: function () {
    switch(this.query.payMethod) {
      case 'A0':
      case 'A1':
        this.stateCode = 'C';
        this.alertMessage = Tw.MSG_MYT.HISTORY_ALERT_A5;
        break;
      default:
        this.stateCode = 'A';
        this.alertMessage = Tw.MSG_MYT.HISTORY_ALERT_A3;
        break;
    }

    this._openBlindConfirmPopup();
  },

  _openConfirmPopup: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, this.alertMessage, null,
        null, $.proxy(this._confirmCallback, this), null);
  },

  _openBlindConfirmPopup: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, this.alertMessage, null,
        null, $.proxy(this._confirmUnblindCallback, this), null);
  },


  _confirmCallback: function () {
    this._popupService.close();
    console.log('[confirm]');
    var API_OPTION = {
      ID_PG: this.query.idpg,
      TY_SVC: this.query.tySvc,
      CP_CODE: this.query.cpCode,
      STATE: this.stateCode
    };

    this._apiService.request(this.updateUseMicroPayAPI, API_OPTION)
        .done($.proxy(this._autoPaymentProcessSuccess, this))
        .error($.proxy(this.common._apiError, this.common));
  },

  _confirmUnblindCallback: function() {

  },

  _autoPaymentProcessSuccess: function (res) {
    console.log('[myt/bill/history/micro/detail]', res);
    if(res.code === Tw.API_CODE.CODE_00) {
      console.log('[update state]');
    } else {
      this.common._apiError(res);
    }
  }

};
