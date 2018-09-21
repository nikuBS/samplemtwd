/**
 * FileName: myt-data.gift.sms.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTDataGiftSms = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGiftSms.prototype = {
  _init: function () {
    var htQueryParams = Tw.UrlHelper.getQueryParams();
    if ( htQueryParams ) {
      this.phoneNumber = htQueryParams.to;
      this._getReceiveUserInfo(this.phoneNumber);
    }
  },

  _cachedElement: function () {
    this.$btn_send_sms = this.$container.find('#fe-send_gift_sms');
    this.$textarea_sms = this.$container.find('#fe-sms_textarea');
  },

  _bindEvent: function () {
    this.$textarea_sms.on('keyup', $.proxy(this._onChangeTextArea, this));
    this.$btn_send_sms.on('click', $.proxy(this._onClickSendSMS, this));
  },

  _getReceiveUserInfo: function (befrSvcNum) {
    this._apiService.request(Tw.API_CMD.BFF_06_0019, {
      befrSvcNum: befrSvcNum
    }).done($.proxy(this._onSuccessReceiveUserInfo, this));
  },

  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      $('.add-info').text(Tw.FormatHelper.getFormattedPhoneNumber(this.phoneNumber));
      $('.add-name').text(res.result.custName);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onChangeTextArea: function (e) {
    if ( $(e.currentTarget).val().length !== 0 ) {
      this.$btn_send_sms.prop('disabled', false);
    } else {
      this.$btn_send_sms.prop('disabled', true);
    }
  },

  _onClickSendSMS: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0017, {
      befrSvcNum: this.phoneNumber,
      msg: this.$textarea_sms.val()
    }).done($.proxy(this._onSuccessRequestSms, this));
  },

  _onSuccessRequestSms: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt/data');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};