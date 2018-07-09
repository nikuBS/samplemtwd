/**
 * FileName: recharge.ting.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeTingProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
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
    amount: 7000
  },

  _init: function () {
    this.$wrap_tpl_contact.html(this.tpl_contact({ isMobile: Tw.BrowserHelper.isMobile() }));
    this._setAvailableAmount();
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
    this.$container.on('click', '.close-step', $.proxy(this._onClosePopup, this));
    this.$container.on('click', '.btn_go_history', $.proxy(this._goHistory, this));
    this.$container.on('input', '.input input', $.proxy(this._setPhoneNumber, this));
    this.$container.on('click', '#btn_go_complete', $.proxy(this._validateStep2, this));
    this.$container.on('click', '.tube-select', $.proxy(this._onClickSelectPopup, this));
    this.$container.on('click', '.btn_validateStep1', $.proxy(this._validateStep1, this));
    this.$container.on('click', '.btn_validateRequestStep1', $.proxy(this._validateRequestStep1, this));
    this.$container.on('click', 'input[name=senddata]', $.proxy(this._onChangeAmount, this));
    this.$container.on('click', '.btn_select_amount', $.proxy(this._onClickSelectAmount, this));
  },

  _onClickBtnAddr: function () {
    Tw.Native.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (resp) {
    var params = resp.params;
    var phoneNumber = params.phoneNumber.replace(/-/gi, '');
    this.$container.find('.inp_phone').val(phoneNumber);
  },

  _onClosePopup: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.TING_A12, '', $.proxy(this._onCloseProcess, this));
  },

  _onCloseProcess: function () {
    // this._popupService.close();
    skt_landing.action.auto_scroll();
    this._go('main');
  },

  _setPhoneNumber: function (e) {
    Tw.InputHelper.inputNumberOnly(e.currentTarget);
    this.target.phone = $(e.currentTarget).val();
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
    });

    setTimeout(function () {
      $('.popup-info').addClass('scrolling');
    }, 100);
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
    skt_landing.action.auto_scroll();
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
    this._apiService.request(Tw.API_CMD.BFF_06_0022, { befrSvcNum: this.target.phone })
      .done(function () {
      })
      .fail($.proxy(this._sendFail, this));

    var res = {
      code: '00',
      msg: 'success',
      result: {
        chargableAmt: '20000',
        custName: '홍*동',
        befrSvcNum: '01012**34**'
      }
    };

    var result = res.result;
    this.target.name = result.custName;
    this.target.phone = result.befrSvcNum;
    this.target.phone_no_mask = $('.inp_phone').val();

    $('.money-select-comment em').text(Tw.FormatHelper.addComma(this.provider.amount.toString()) + Tw.CURRENCY_UNIT.WON);
    $('.t-gift-data .txt').html(this.target.name);
    $('.t-gift-data .tel').html(Tw.FormatHelper.conTelFormatWithDash(this.target.phone));
    this._go('#step2');
  },

  _validateStep2: function () {
    this._history.setHistory();
    this._go('#complete');
  },

  _validateRequestStep1: function () {
    this.target.phone_no_mask = $('.inp_phone').val();
    $('.tx-data .num').html(Tw.FormatHelper.conTelFormatWithDash(this.target.phone_no_mask));

    this._history.setHistory();
    this._go('#request-complete');
  },

  _sendFail: function () {
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
    window.location.hash = hash;
  }
};