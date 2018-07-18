/**
 * FileName: recharge.cookiz.process.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.09
 */

Tw.RechargeCookizProcess = function (rootEl) {
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

Tw.RechargeCookizProcess.prototype = {
  DEFAULT_AMOUNT: 1000,
  target: {
    name: '',
    phone: '',
    phone_no_mask: '',
    amount: 5000,
    type: 0
  },
  provider: {
    prodId: '',
    prodName: '',
    amount: 5000
  },

  _init: function () {
    var setProvider = function (res) {
      if ( res.code === '00' ) {
        var result = res.result;
        this.provider.amount = Number(result.currentTopUpLimit);

        if ( this.provider.amount < this.target.amount ) {
          this.target.amount = this.DEFAULT_AMOUNT;
          this._setAmount();
        }

        this._setAvailableAmount();
      }
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0028, {}).done($.proxy(setProvider, this));
    this.$wrap_tpl_contact.html(this.tpl_contact({ isMobile: Tw.BrowserHelper.isApp() }));
  },

  _cachedElement: function () {
    this.$wrap_tpl_contact = $('.wrap_tpl_contact');
    this.$tubeList = $('.tube-list.two.wrap_amount_change');
    this.tpl_contact = Handlebars.compile($('#tpl_contact').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '#btn_prev', $.proxy(this._goBack, this));
    this.$container.on('click', '#btn_addr', $.proxy(this._onClickBtnAddr, this));
    this.$container.on('click', '.btn_go_history', $.proxy(this._goHistory, this));
    this.$container.on('click', '.close-step', $.proxy(this._onCloseProcess, this));
    this.$container.on('click', '.btn_confirm', $.proxy(this._goToCookizMain, this));
    this.$container.on('input', '.input input', $.proxy(this._setPhoneNumber, this));
    this.$container.on('click', '.tube-select', $.proxy(this._onClickSelectPopup, this));
    this.$container.on('click', '.btn_validateStep1', $.proxy(this._validateCookizStep1, this));
    this.$container.on('click', '.btn_select_amount', $.proxy(this._onClickSelectAmount, this));
    this.$container.on('click', '#btn_cookiz_complete', $.proxy(this._validateCookizComplete, this));
    this.$container.on('click', '.btn_validateRequestStep1', $.proxy(this._validateRequestStep1, this));
    this.$container.on('click', '.wrap_type_change input[name=senddata]', $.proxy(this._onChangeType, this));
    this.$container.on('click', '.wrap_amount_change input[name=senddata]', $.proxy(this._onChangeAmount, this));
  },

  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (resp) {
    var params = resp;
    var phoneNumber = params.phoneNumber.replace(/-/gi, '');
    this.$container.find('.inp_phone').val(phoneNumber);
  },

  _setPhoneNumber: function (e) {
    Tw.InputHelper.inputNumberOnly(e.currentTarget);
    this.target.phone = $(e.currentTarget).val();
    if ( this.target.phone.length <= 0 ) {
      $('.btn_validateRequestStep1').prop('disabled', true);
    } else {
      $('.btn_validateRequestStep1').prop('disabled', false);
    }
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

  _onChangeType: function (e) {
    var elWrapInput = $(e.currentTarget);
    this.target.type = $('.wrap_type_change').find('input').index(elWrapInput);
    var sTypeName = elWrapInput.parent().text().trim();
    $('.recharge_type').text(sTypeName);
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
    $('.tx-data.money .tx-bold').text(Tw.FormatHelper.addComma(this.target.amount.toString()));
    $('.tx-data .num.amount').text(Tw.FormatHelper.addComma(this.target.amount.toString()));
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
    $('.money-select-comment em').text(Tw.FormatHelper.addComma(this.provider.amount.toString()) + Tw.CURRENCY_UNIT.WON);

    this._go('#step2');
  },

  _validateCookizComplete: function () {
    if ( this.target.type === 0 ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0029, { amt: this.target.amount }).done($.proxy(this._onSuccessCookizComplete, this));
    }

    if ( this.target.type === 1 ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0030, { amt: this.target.amount }).done($.proxy(this._onSuccessCookizComplete, this));
    }
  },

  _onSuccessCookizComplete: function (res) {
    if ( res.code === '00' ) {
      $('.recharge_amount').text(Tw.FormatHelper.addComma(String(this.target.amount)));
      this._go('#complete');
    } else {
      this._sendFail(res);
    }
  },

  _getCurrentTabIndex: function () {
    var $currentTab = $('[aria-selected="true"]').first();
    return $('[role=tablist]').children().index($currentTab);
  },

  _onCloseProcess: function () {
    if ( this._getCurrentTabIndex() === 0 ) {
      this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.COOKIZ_A07, null, null, $.proxy(this._goToMain, this));
    }

    if ( this._getCurrentTabIndex() === 1 ) {
      this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.TING_A13, null, null, $.proxy(this._goToMain, this));
    }
  },

  _sendFail: function (res) {
    if ( res.data ) {
      this._popupService.openAlert(res.data.orgDebugMessage);
    }
  },

  _goToMain: function () {
    this._go('main');
  },

  _goToCookizMain: function () {
    this._goBack();
  },

  _goHistory: function () {
    this._history.setHistory();
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