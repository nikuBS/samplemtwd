/**
 * FileName: payment.history.excess-pay.account.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */
Tw.PaymentHistoryExcessPayAccount = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.PaymentHistoryCommon(rootEl);
  this._bankList = new Tw.BankList(this.$container);

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.PaymentHistoryExcessPayAccount.prototype = {
  _cachedElement: function () {
    this.$closeBtn = this.$container.find('.close-step');
    this.$bankSelector = this.$container.find('.select-name .bt-dropdown');
    this.$bankNumber = this.$container.find('.inputbox input');
    this.$movePrevPage = this.$container.find('.contents-btn .bt-white2');
    this.$moveToPay = this.$container.find('.contents-btn .bt-red1');

    this.$totalCount = this.$container.find('.inquiry-info-stxt em');
    this.$totalAmount = this.$container.find('.inquiry-info-txt em');
  },

  _bindDOM: function () {
    this.$closeBtn.on('click', $.proxy(this._moveToListPage, this));
    this.$bankSelector.on('click', $.proxy(this._selectBank, this));

    this.$movePrevPage.on('click', $.proxy(this._moveToPrevPage, this));
    this.$moveToPay.on('click', $.proxy(this._submitPay, this));
  },

  _init: function () {
    this.paramData = Tw.UrlHelper.getQueryParams();

    this.apiName = Tw.API_CMD.BFF_07_0032;
    this.apiOption = {
      recCnt: this.paramData.recCnt,
      sendSvcMgmtNum: this.paramData.svcMgmtNum,
      bamtClCd: this.paramData.bamtClCd
    };

    this._setUI();
  },

  _setUI: function () {
    this.$totalCount.html(this.paramData.recCnt);
    this.$totalAmount.html(
        Tw.FormatHelper.addComma(this.common._normalizeNumber(this.paramData.total)));
  },

  _moveToPrevPage: function () {
    history.back();
  },

  _submitPay: function () {
    var bankNameId = this.$bankSelector.attr('id');
    var bankNumber = this.$bankNumber.val();

    if (!bankNameId) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.REALTIME_A02);
      return false;
    }
    if (!bankNumber) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.REALTIME_A03, null, null,
          $.proxy(function () {
            this.$bankNumber.val('');
            this.$bankNumber.focus();
          }, this));
      return false;
    }
    this.apiOption.rfndBankCd = bankNameId;
    this.apiOption.rfndBankNum = bankNumber;

    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption).done($.proxy(this._successRegisterAccount, this)).error($.proxy(this._apiError, this));
    }
  },

  _successRegisterAccount: function () {
    this._popupService.openAlert(Tw.MSG_PAYMENT.HISTORY_A01, null, null,
        $.proxy(function () {
          this._moveToListPage();
        }, this));
  },

  _selectBank: function (event) {
    this._bankList.init(event);
  },

  _moveToListPage: function () {
    this.common._goLoad('/payment/history');
  },

  _apiError: function (err) {
    this.common._apiError(err);
  }
};
