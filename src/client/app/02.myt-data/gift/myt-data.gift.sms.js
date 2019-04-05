/**
 * @file myt-data.gift.sms.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.17
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
    this.paramData = Tw.UrlHelper.getQueryParams();
    this._setReceiverInfo();
  },

  _cachedElement: function () {
    this.$btn_send_sms = this.$container.find('#fe-send_gift_sms');
    this.$textarea_sms = this.$container.find('#fe-sms_textarea');
  },

  _bindEvent: function () {
    this.$textarea_sms.on('keyup', $.proxy(this._onChangeTextArea, this));
    this.$btn_send_sms.on('click', $.proxy(this._onClickSendSMS, this));
  },

  _setReceiverInfo: function () {
    if ( this.paramData.custNm ) {
      $('.add-name').text(this.paramData.custNm);
    }

    if ( this.paramData.befrSvcNum ) {
      this.paramData.befrSvcNum = this.paramData.befrSvcNum.replace(/-/g, '');
      $('.add-info').text(Tw.FormatHelper.getFormattedPhoneNumber(this.paramData.befrSvcNum));
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
    this._lockSms();

    this._apiService.request(
      Tw.API_CMD.BFF_06_0017,
      { befrSvcMgmtNum: this.paramData.befrSvcMgmtNum, msg: this.$textarea_sms.val() }, null, null, null,
      { jsonp : false }
    ).done($.proxy(this._onSuccessRequestSms, this));
  },

  _onSuccessRequestSms: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/submain');
    } else {
      Tw.Error(res.code, res.msg).pop();
      this._unlockSms();
    }
  },

  _lockSms: function () {
    this.$textarea_sms.prop('disabled', true);
    this.$btn_send_sms.prop('disabled', true);
  },

  _unlockSms: function () {
    this.$textarea_sms.prop('disabled', false);
    this.$btn_send_sms.prop('disabled', false);
  }
};