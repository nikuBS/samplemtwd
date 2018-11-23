/**
 * FileName: myt-data.prepaid.voice.auto.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.16
 */

Tw.MyTDataPrepaidVoiceAutos = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidVoiceAutos.prototype = {
  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0064, {})
      .done($.proxy(this._onCompleteAlarm, this));
  },

  _cachedElement: function () {
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$btn_request = $('.fe-request-recharge');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-unsubscribe-auto-recharge', $.proxy(this._onClickUnsubscribeAutoRecharge, this));
    this.$container.on('click', '.fe-select-amount', $.proxy(this._onClickSelectAmount, this));
    this.$container.on('click', '.fe-select-date', $.proxy(this._onClickSelectDate, this));
    this.$container.on('click', '.fe-select-expire', $.proxy(this._onClickSelectExpire, this));
    // this.$container.on('click', '.fe-request-recharge', $.proxy(this._onClickRequestRecharge, this));
    this.$container.on('change input blur click', '[required]', $.proxy(this._checkIsAbled, this));
  },

  _checkIsAbled: function () {
    if ( this.$cardNumber.val() !== '' && this.$cardY.val() !== '' && this.$cardM.val() !== '' && this.$cardPw.val() !== '' ) {
      this.$btn_request.prop('disabled', false);
    } else {
      this.$btn_request.prop('disabled', true);
    }
  },

  _validateCreditCard: function () {
    var isValid = this._validation.checkMoreLength(this.$cardNumber.val(), 15, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4) &&
      this._validation.checkLength(this.$cardY.val(), 4, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkLength(this.$cardM.val(), 2, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6) &&
      this._validation.checkLength(this.$cardPw.val(), 2, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V7);

    if ( isValid ) {
      var htParams = {
        cardNum: $.trim(this.$cardNumber.val()).substr(0, 6)
      };

      this._apiService.request(Tw.API_CMD.BFF_06_0065, htParams)
        .done($.proxy(this._getCreditCardInfo, this));
    }
  },

  _onClickSelectDate: function (e) {
    var $elButton = $(e.currentTarget);
    var fnSelectAmount = function (item) {
      return {
        value: item.text,
        option: false,
        attr: 'data-value=' + item.value
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_ALARM.title,
        data: [{ list: Tw.MYT_PREPAID_DATE.list.map($.proxy(fnSelectAmount, this)) }]
      },
      $.proxy(this._selectPopupCallback, this, $elButton),
      null
    );
  },

  _onClickSelectExpire: function () {

  },

  _onClickSelectAmount: function (e) {
    var $elButton = $(e.currentTarget);
    var fnSelectAmount = function (item) {
      return {
        value: item.text,
        option: false,
        attr: 'data-value=' + item.value
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_AMOUNT.list.map($.proxy(fnSelectAmount, this)) }]
      },
      $.proxy(this._selectPopupCallback, this, $elButton),
      null
    );
  },

  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '[data-value]', $.proxy(this._setSelectedValue, this, $target));
  },

  _setSelectedValue: function ($target, e) {
    this._popupService.close();
    $target.text($(e.currentTarget).text());
    $target.data('amount', $(e.currentTarget).data('value'));
  },

  _onClickUnsubscribeAutoRecharge: function () {
    this._popupService.openModalTypeA(
      Tw.MYT_DATA_PREPAID.A70_TITLE,
      Tw.MYT_DATA_PREPAID.A70_CONTENT,
      Tw.MYT_DATA_PREPAID.A70_BTN_CONFIRM,
      null,
      $.proxy(this._unsubscribeAutoRecharge, this),
      $.proxy(this._closeUnsubscribeAutoRecharge, this)
    );
  },

  _closeUnsubscribeAutoRecharge: function () {
    this._popupService.close();
  },

  _unsubscribeAutoRecharge: function () {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_06_0057, {})
      .done($.proxy(this._onSuccessUnsubscribe, this));
  },

  _onSuccessUnsubscribe: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      //TODO Complete Page
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};