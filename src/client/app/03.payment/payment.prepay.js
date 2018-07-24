/**
 * FileName: payment.prepay.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.25
 */

Tw.PaymentPrepay = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._initVariables();
  this._bindEvent();
};

Tw.PaymentPrepay.prototype = {
  _initVariables: function () {
    this._init();
  },
  _init: function () {
    this.$container.find('input[type="text"]').val();
    this.$container.find('input[type="number"]').val();
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.fe-only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('change', '.fe-change-type', $.proxy(this._changeType, this));
    this.$container.on('click', '#fe-get-remain-limit', $.proxy(this._getRemainLimit, this));
    this.$container.on('click', '.select-payment', $.proxy(this._getAutoInfo, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.pay-check-box', $.proxy(this._setAutoInfo, this));
    this.$container.on('click', '.select-card-type', $.proxy(this._selectCardType, this));
    this.$container.on('click', '.get-point', $.proxy(this._openGetPoint, this));
    this.$container.on('click', '.select-point', $.proxy(this._selectPoint, this));
    this.$container.on('click', '.pay', $.proxy(this._pay, this));
    this.$container.on('click', '.cancel-process', $.proxy(this._openCancel, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _changeType: function () {
    // change type field
  },
  _getRemainLimit: function () {
    this.$container.find('#fe-get-detail').removeAttr('disabled');
    this._apiService.request(Tw.API_CMD.BFF_07_0073, {})
      .done($.proxy(this._getRemainLimitSuccess))
      .fail($.proxy(this._getRemainLimitFail));
  },
  _getRemainLimitSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$container.find('#fe-remain-limit').text(Tw.FormatHelper.addComma(res.result.microPayLimitAmt));
      this.$container.find('#fe-maximum').text(Tw.FormatHelper.addComma(res.result.tmthChrgPsblAmt));
      this.$container.on('click', '#fe-change-limit', $.proxy(this._openChangeLimit, this));

      if (res.result.tmthChrgPsblAmt > 0) {
        this.$container.find('#fe-go-prepay').removeAttr('disabled');
      }

      if (res.result.autoChrgStCd === Tw.AUTO_CHARGE_CODE.USE) {
        this.$container.on('click', '#fe-cancel-auto-prepay', $.proxy(this._confirmCancel, this));
        this.$container.find('#fe-auto-charge-amt').text(res.result.autoChrgAmt);
        this.$container.find('#fe-auto-charge-standard-amt').text(res.result.autoChrgStrdAmt);
        this.$container.find('#fe-auto-use-wrap').show();
      }
      this.$container.find('#fe-remain-limit-wrap').show();
    }
  },
  _getRemainLimitFail: function () {
    Tw.Logger.info('get remain limit fail');
  },
  _openChangeLimit: function () {
    this._popupService.open('');
  },
  _confirmCancel: function () {
    this._popupService.openAlert(Tw.MSG_PAYMENT.PRE_A07, null, $.proxy(this._cancelAutoPrepay, this));
  },
  _cancelAutoPrepay: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0077, {})
      .done($.proxy(this._cancelAutoPrepaySuccess))
      .fail($.proxy(this._cancelAutoPrepayFail));
  },
  _cancelAutoPrepaySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._history.setHistory();
      this._go('#complete-auto-cancel');
    } else {
      this._cancelAutoPrepayFail();
    }
  },
  _cancelAutoPrepayFail: function () {
    Tw.Logger.info('cancel auto prepay fail');
    this._history.setHistory();
    this._go('#error');
  },
  // 일시불 관련
  _setCardTypeDisabled: function ($amount) {
    if (parseInt($amount, 10) <= 50000) {
      this.$cardTypeSelector.attr('disabled', 'disabled');
    } else {
      this.$cardTypeSelector.removeAttr('disabled');
    }
  },
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.openChoice(Tw.MSG_PAYMENT.SELECT_CARD_TYPE, this._getTypeList(), 'type2', $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr('id', $selectedValue.find('button').attr('id'));
    $target.text($selectedValue.text());
    this._popupService.close();
  },
  _go: function (hash) {
    window.location.hash = hash;
  },
  _getTypeList: function () {
    return [
      { 'attr': 'id="0"', text: Tw.PAYMENT_TYPE['000'] },
      { 'attr': 'id="1"', text: Tw.PAYMENT_TYPE['001'] },
      { 'attr': 'id="2"', text: Tw.PAYMENT_TYPE['002'] },
      { 'attr': 'id="3"', text: Tw.PAYMENT_TYPE['003'] },
      { 'attr': 'id="4"', text: Tw.PAYMENT_TYPE['004'] },
      { 'attr': 'id="5"', text: Tw.PAYMENT_TYPE['005'] },
      { 'attr': 'id="6"', text: Tw.PAYMENT_TYPE['006'] },
      { 'attr': 'id="7"', text: Tw.PAYMENT_TYPE['007'] },
      { 'attr': 'id="8"', text: Tw.PAYMENT_TYPE['008'] },
      { 'attr': 'id="9"', text: Tw.PAYMENT_TYPE['009'] },
      { 'attr': 'id="10"', text: Tw.PAYMENT_TYPE['010'] },
      { 'attr': 'id="11"', text: Tw.PAYMENT_TYPE['011'] },
      { 'attr': 'id="12"', text: Tw.PAYMENT_TYPE['012'] },
      { 'attr': 'id="24"', text: Tw.PAYMENT_TYPE['024'] }
    ];
  }
};