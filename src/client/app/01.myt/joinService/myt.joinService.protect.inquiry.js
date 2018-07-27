/**
 * FileName: myt.joinService.protect.inquiry.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.24
 */
Tw.MyTJSProtectInquiry = function ($element) {
  this.$container = $element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._rendered();
  this._bindEvent();
};

Tw.MyTJSProtectInquiry.prototype = {
  //element event bind
  _bindEvent: function () {
    // 확인
    this.$okButton.on('click', $.proxy(this._onOkClicked, this));
  },

  //set selector
  _rendered: function () {
    //신청버튼
    this.$okButton = this.$container.find('.bt-red1');
  },

  _onOkClicked: function (/*event*/) {
    // 비밀번호 확인
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_MYT.JOIN_SERVICE_PROTECT_TEST, null, null, $.proxy(this._onOkPopupClicked, this));
  },

  _onOkPopupClicked: function () {
    this._requestProtectPwd();
  },

  _goToComplete: function () {
    // api 성공 후 처리
  },

  _requestProtectPwd: function (/*event*/) {
    // var api = Tw.API_CMD.BFF_05_0069;
    // this._apiService
    //   .request(api, {})
    //   .done($.proxy(this._onApiSuccess, this))
    //   .fail($.proxy(this._onApiError, this));
    this._popupService.close();
  },

  _onApiSuccess: function (params) {
    Tw.Logger.info(params);
  },

  _onApiError: function (params) {
    // API 호출 오류
    Tw.Logger.warn(params);
  }
};