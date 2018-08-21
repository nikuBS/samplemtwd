/**
 * FileName: myt.bill.history.detail.common.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.02
 */

Tw.MyTBillHistoryDetailCommon = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;
  this._historyService = new Tw.HistoryService();

  this.common = new Tw.MyTBillHistoryCommon(rootEl);

  this.updateUseMicroPayAPI = Tw.API_CMD.BFF_05_0082;

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.MyTBillHistoryDetailCommon.prototype = {
  _init: function () {
    this.query = this.common.parse_query_string();

    if (this.query.cpTel)
      this.$telTextWrap.html(Tw.FormatHelper.getDashedPhoneNumber(this.query.cpTel));

    switch (this.query.type) {
      case '0':
        this.btnProcessCallback = this._autoPaymentBlindProcess;
        break;
      case '1':
        this.btnProcessCallback = this._autoPaymentUnBlindProcess;
        break;
      case '2':
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
    this.$autoPaymentBlindBtn.on('click', $.proxy(function () {
      this.btnProcessCallback();
    }, this));
  },

  _autoPaymentBlindProcess: function () {
    switch (this.query.cpState) {
      case 'A0':
      case 'A1':
        this.alertMessage = Tw.MSG_MYT.HISTORY_ALERT_A5;
        break;
      default:
        this.alertMessage = Tw.MSG_MYT.HISTORY_ALERT_A3;
        break;
    }

    this._openBlindConfirmPopup();
  },

  _autoPaymentUnBlindProcess: function () {
    switch (this.query.cpState) {
      case 'A0':
      case 'A1':
        this.alertMessage = Tw.MSG_MYT.HISTORY_ALERT_A5;
        break;
      default:
        this.alertMessage = Tw.MSG_MYT.HISTORY_ALERT_A3;
        break;
    }

    this._openBlindConfirmPopup();
  },

  _openBlindConfirmPopup: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, this.alertMessage, null,
        null, $.proxy(this._confirmCallback, this), null);
  },

  _confirmCallback: function () {
    this._popupService.close();
    this.CP_STATE = this.query.cpState.substr(0, 1) === 'C' ? 'A' : 'C';
    var API_OPTION = {
      ID_PG: this.query.idpg,
      TY_SVC: this.query.tySvc,
      CP_CODE: this.query.cpCode,
      STATE: this.CP_STATE
    };

    this._apiService.request(this.updateUseMicroPayAPI, API_OPTION)
        .done($.proxy(this._autoPaymentProcessSuccess, this))
        .error($.proxy(this.common._apiError, this.common));
  },

  _autoPaymentProcessSuccess: function (res) {
    var alertMsg;
    if (this.query.cpState.substr(0, 1) === 'C') {
      // 차단 신청
      alertMsg = Tw.MSG_MYT.HISTORY_ALERT_A4;
      this.query.cpState = 'A1';
    } else {
      // 차단 해지 신청
      alertMsg = Tw.MSG_MYT.HISTORY_ALERT_A6;
      this.query.cpState = 'C1';
    }

    this.replaceURL = this._historyService.pathname + this.common.getObjetToParamStr(this.query);

    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.openAlert(alertMsg, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._confirmAlertCallback, this), null);
    } else {
      this.common._apiError(res);
    }
  },

  _confirmAlertCallback: function () {
    this._popupService.close();
    this._historyService.replaceURL(this.replaceURL);
  }

};
