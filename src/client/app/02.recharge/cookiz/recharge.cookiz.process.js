/**
 * FileName: recharge.cookiz.process.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.09
 */

Tw.RechargeCookizProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeCookizProcess.prototype = {
  target: {
    name: '',
    phone: '',
    phone_no_mask: '',
    amount: 5000
  },
  provider: {
    amount: 7000
  },

  _init: function () {

  },

  _cachedElement: function () {
    this.$container.on('click', '.btn_confirm', $.proxy(this._goToMain, this));
    this.$container.on('click', '.btn_validateRequestStep1', $.proxy(this._validateRequestStep1, this));
    this.$container.on('click', '.btn_validateStep1', $.proxy(this._validateCookizStep1, this));
    this.$container.on('click', 'input[name=senddata]', $.proxy(this._onChangeAmount, this));
    this.$container.on('click', '.tube-select', $.proxy(this._onClickSelectPopup, this));
    this.$container.on('click', '.close-step', $.proxy(this._onCloseProcess, this));
  },

  _bindEvent: function () {

  },

  _setAvailableAmount: function () {
    var setAvailableUI = function (index, targetEl) {
      var $input = $(targetEl).find('input');
      var amount = Number($input.prop('title'));

      if ( amount > this.provider.amount ) {
        $(targetEl).addClass('disabled');
      }

      if ( amount === this.target.amount ) {
        $(targetEl).addClass('checked');
      }
    };

    this.$tubeList.find('li').each($.proxy(setAvailableUI, this));
  },

  _onChangeAmount: function (e) {
    var elTargetParent = $(e.currentTarget).parent();

    if ( elTargetParent.hasClass('disabled') ) {
      return;
    }

    elTargetParent.addClass('checked');
    this.target.amount = $(e.currentTarget).prop('title');

    this._setAmount();
  },

  _setAmount: function () {
    $('.tx-data.money .tx-bold').text(Tw.FormatHelper.addComma(this.target.amount));
    $('.tx-data .num.amount').text(Tw.FormatHelper.addComma(this.target.amount));
  },

  _onClickSelectPopup: function () {
    var arrOption = [];

    for ( var amount = 1000; amount <= Number(this.provider.amount); amount = amount + 1000 ) {
      arrOption.push({
        checked: amount === Number(this.target.amount),
        value: amount.toString(),
        text: Tw.FormatHelper.addComma(amount.toString())
      });
    }

    this._popupService.open({
      hbs: 'select',
      title: Tw.POPUP_TITLE.SELECT_GIFT_AMOUNT,
      close_bt: true,
      select: [{ options: arrOption }],
      bt_num: 'one',
      type: [{
        style_class: 'bt-red1 btn_select_amount',
        txt: Tw.BUTTON_LABEL.SELECT
      }]
    }, $.proxy(this._onOpenSelectPopup, this));
  },

  _onOpenSelectPopup: function () {
    $('.popup-info').addClass('scrolling');
  },

  _validateRequestStep1: function () {
    var $wrap_request_step = $('#request-step1');
    this.target.phone_no_mask = $wrap_request_step.find('.inp_phone').val();
    $('#request-complete').find('.tx-data .num').html(Tw.FormatHelper.getFormattedPhoneNumber(this.target.phone_no_mask));

    this._apiService.request(Tw.API_CMD.BFF_06_0025, { senderSvcNum: this.target.phone_no_mask })
      .done($.proxy(this._validRequestComplete, this));
  },

  _validRequestComplete: function (response) {
    if ( response.code === '00' ) {
      this._go('#request-complete');
    } else {
      this._sendFail(response);
    }
  },

  _validateCookizStep1: function () {
    this._go('#step2');
  },

  _onCloseProcess: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.TING_A12, null, null, $.proxy(this._goToMain, this));
  },

  _goToMain: function () {
    this._go('#main');
  },

  _goHistory: function () {
    this._goLoad('/recharge/cookiz/history');
  },

  _goBack: function () {
    this._history.go(-1);
  },

  _goLoad: function (url) {
    location.href = url;
  },

  _go: function (hash) {
    this._history.setHistory();
    window.location.hash = hash;
  }
};