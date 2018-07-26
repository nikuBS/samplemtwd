/**
 * FileName: myt.joinService.protect.cancel.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.24
 */
Tw.MyTJSProtectCancel= function ($element) {
  this.$container = $element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._rendered();
  this._bindEvent();
};

Tw.MyTJSProtectCancel.prototype = {
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
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, '비밀번호가 확인 팝업(변경필요)', null, null, $.proxy(this._onOkPopupClicked, this));
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
  },

  _onApiSuccess: function (params) {
    Tw.Logger.info(params);
    this._popupService.close();
  },

  _onApiError: function (params) {
    // API 호출 오류
    Tw.Logger.warn(params);
  }
};