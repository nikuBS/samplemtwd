/**
 * FileName: recharge.ting.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeTingProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeTingProcess.prototype = {
  target: {
    name: '',
    phone: '',
    phone_no_mask: '',
    amount: 5000
  },
  provider: {
    amount: 10000
  },

  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0020, {}).done($.proxy(this._setProvider, this));
    this.$wrap_tpl_contact.html(this.tpl_contact({ isMobile: Tw.BrowserHelper.isMobile() }));
  },

  _cachedElement: function () {
    this.$tubeList = $('.tube-list.two');
    this.$wrap_tpl_contact = $('.wrap_tpl_contact');
    this.tpl_contact = Handlebars.compile($('#tpl_contact').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '#btn_prev', $.proxy(this._goBack, this));
    this.$container.on('click', '.btn_confirm', $.proxy(this._goTingMain, this));
    this.$container.on('click', '#btn_addr', $.proxy(this._onClickBtnAddr, this));
    this.$container.on('click', '.btn_go_history', $.proxy(this._goHistory, this));
    this.$container.on('click', '.close-step', $.proxy(this._onCloseProcess, this));
    this.$container.on('input', '.input input', $.proxy(this._setPhoneNumber, this));
    this.$container.on('click', '#btn_go_complete', $.proxy(this._validateStep2, this));
    this.$container.on('click', '.tube-select', $.proxy(this._onClickSelectPopup, this));
    this.$container.on('click', '.btn_validateStep1', $.proxy(this._validateStep1, this));
    this.$container.on('click', 'input[name=senddata]', $.proxy(this._onChangeAmount, this));
    this.$container.on('click', '.btn_select_amount', $.proxy(this._onClickSelectAmount, this));
    this.$container.on('click', '.btn_validateRequestStep1', $.proxy(this._validateRequestStep1, this));
  },

  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (resp) {
    var params = resp;
    var phoneNumber = params.phoneNumber.replace(/-/gi, '');
    this.$container.find('.inp_phone').val(phoneNumber);
  },

  _setProvider: function (response) {
    if ( response.code === '00' ) {
      this.provider.amount = Number(response.result.transferableAmt);
      this._setAvailableAmount();
    }
  },

  _setPhoneNumber: function (e) {
    Tw.InputHelper.inputNumberOnly(e.currentTarget);
    this.target.phone = $(e.currentTarget).val();
    if ( this.target.phone.length <= 0 ) {
      $('.btn_validateStep1').prop('disabled', true);
    } else {
      $('.btn_validateStep1').prop('disabled', false);
    }
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

  _onClickSelectPopup: function () {
    var arrOption = [];

    for ( var amount = 1000; amount <= Number(this.provider.amount); amount = amount + 1000 ) {
      arrOption.push({
        checked: amount === Number(this.target.amount) ? true : false,
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
    $('.popup-info').find('input[value=' + this.target.amount + ']').click();
    $('.popup-info').addClass('scrolling');
  },

  _onClickSelectAmount: function (e) {
    this.target.amount = $(e.currentTarget).closest('.popup').find('input:checked').prop('value');
    var targetButton = this.$tubeList.find('input[title=' + this.target.amount + ']');

    if ( targetButton.length !== 0 ) {
      targetButton.click();
    } else {
      this.$tubeList.find('li.checked').removeClass('checked');
    }

    this._setAmount();

    this._popupService.close();
  },

  _setAmount: function () {
    $('.tx-data.money .tx-bold').text(Tw.FormatHelper.addComma(this.target.amount));
    $('.tx-data .num.amount').text(Tw.FormatHelper.addComma(this.target.amount));
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

  _validateStep1: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0022, { chrgSvcNum: this.target.phone }).done($.proxy(this._validStep1, this));
  },

  _validStep1: function (response) {
    this.target.phone_no_mask = this.target.phone;

    if ( response.code === '00' ) {
      var result = response.result;
      this.target.name = result.custName;
      this.target.phone = result.befrSvcNum;

      $('.money-select-comment em').text(Tw.FormatHelper.addComma(this.provider.amount.toString()) + Tw.CURRENCY_UNIT.WON);
      $('.t-gift-data .txt').html(this.target.name);
      $('.t-gift-data .tel').html(Tw.FormatHelper.conTelFormatWithDash(this.target.phone));

      this._go('step2');
    } else {
      this._sendFail(response);
    }
  },

  _validateStep2: function () {

    this._apiService.request(Tw.API_CMD.BFF_06_0023, {
      befrSvcNum: this.target.phone_no_mask,
      amt: this.target.amount
    }).done($.proxy(this._validComplete, this));
  },

  _validComplete: function (response) {
    if ( response.code === '00' ) {
      this._history.setHistory();
      this._go('#complete');
    } else {
      this._sendFail(response);
    }
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
      this._history.setHistory();
      this._go('#request-complete');
    } else {
      this._sendFail(response);
    }
  },

  _sendFail: function (res) {
    if ( res.data ) {
      this._popupService.openAlert(res.data.orgDebugMessage);
    }
  },

  _getCurrentTabIndex: function () {
    var $currentTab = $('[aria-selected="true"]').first();
    return $('[role=tablist]').children().index($currentTab);
  },

  _onCloseProcess: function () {
    if ( this._getCurrentTabIndex() === 0 ) {
      this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.TING_A12, null, null, $.proxy(this._goToMain, this));
    }

    if ( this._getCurrentTabIndex() === 1 ) {
      this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.TING_A13, null, null, $.proxy(this._goToMain, this));
    }
  },

  _goToMain: function () {
    this._go('main');
  },

  _goTingMain: function () {
    this._goBack();
  },

  _goHistory: function () {
    this._goLoad('/recharge/ting/history');
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