/**
 * FileName: myt-data.gift.monthly.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataGiftMonthly = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGiftMonthly.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$btn_add_contact = this.$container.find('.fe-btn_add_contact');
    this.$input_auto_gift = this.$container.find('.fe-input_auto_gift');
    this.$btn_auto_contact = this.$container.find('.fe-btn_auto_contact');
    this.$btn_send_auto_gift = this.$container.find('.fe-btn_send_auto_gift');
    this.$btn_wrap_add_contact = this.$container.find('.fe-wrap_add_contact');
    this.$wrap_auto_select_list = this.$container.find('.fe-auto_select_list');
    this.$btn_unsubscribe_auto_gift = this.$container.find('.fe-btn_unsubscribe');
  },

  _bindEvent: function () {
    this.$btn_add_contact.on('click', $.proxy(this._showAddUI, this));
    this.$btn_auto_contact.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$btn_send_auto_gift.on('click', $.proxy(this._getReceiveUserInfo, this));
    this.$input_auto_gift.on('keyup', $.proxy(this._onKeyUpAutoGiftNumber, this));
    this.$btn_unsubscribe_auto_gift.on('click', $.proxy(this._unSubscribeAutoGift, this));
  },

  _showAddUI: function () {
    this.$btn_add_contact.hide();
    this.$btn_wrap_add_contact.show();
  },

  _onKeyUpAutoGiftNumber: function () {
    this._checkValidateSendingButton();
    this.$input_auto_gift.val(this._convertDashNumber(this.$input_auto_gift.val()));
  },

  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;

      this.$inputImmediatelyGift.val(this._convertDashNumber(params.phoneNumber));
    }
  },

  _unSubscribeAutoGift: function (e) {
    var elTarget = $(e.currentTarget);
    var serNum = elTarget.data('sernum');

    this._popupService.openConfirm(
      Tw.ALERT_MSG_MYT_DATA.UNSUBSCRIBE_MONTHLY_GIFT,
      null,
      $.proxy(this._requestUnsubscribeAutoGift, this, serNum)
    );
  },

  _requestUnsubscribeAutoGift: function (serNum) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_06_0005, { serNum: serNum })
      .done($.proxy(this._onSuccessUnsubscribeAutoGift, this));
  },

  _getReceiveUserInfo: function () {
    this.befrSvcNum = this.$input_auto_gift.val().match(/\d+/g).join('');

    this._apiService.request(Tw.API_CMD.BFF_06_0019, { befrSvcNum: this.befrSvcNum }).done($.proxy(this._onSuccessReceiveUserInfo, this));
  },

  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.paramData = $.extend({}, this.paramData, res.result);
      this._subscribeAutoGift();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _subscribeAutoGift: function () {
    var htParams = {
      befrSvcNum: this.$input_auto_gift.val().match(/\d+/g).join(''),
      dataQty: this.$wrap_auto_select_list.find('li.checked input').val()
    };

    this.paramData = $.extend({}, this.paramData, htParams);

    this._apiService.request(Tw.API_CMD.BFF_06_0004, htParams)
      .done($.proxy(this._onSuccessAutoGift, this));
  },

  _onSuccessAutoGift: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt/data/gift/auto-complete?' + $.param(this.paramData));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onSuccessUnsubscribeAutoGift: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _convertDashNumber: function (sTelNumber) {
    return Tw.StringHelper.phoneStringToDash(sTelNumber);
  },

  _checkValidateSendingButton: function () {
    if ( this.$input_auto_gift.val().match(/\d+/g) ) {
      this.$btn_send_auto_gift.attr('disabled', false);
    } else {
      this.$btn_send_auto_gift.attr('disabled', true);
    }
  }
};