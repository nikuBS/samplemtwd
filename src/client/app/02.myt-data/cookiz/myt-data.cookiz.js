/**
 * FileName: myt-data.cookiz.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataCookiz = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  // this._cachedElement();
  // this._bindEvent();
  this._init();
};

Tw.MyTDataCookiz.prototype = {
  _init: function () {
    // this._getRemainDataInfo();
  },

  _getRemainDataInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0014, {}).done($.proxy(this._onSuccessRemainDataInfo, this));
  },

  _onSuccessRemainDataInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      // exceptions ProductId NA00001464, NA00001465
    }
  },

  _getReceiveUserInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0019, {}).done($.proxy(this._onSuccessReceiveUserInfo, this));
  },

  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {

    }
  },

  _requestSendingData: function () {
    var htParams = {
      befrSvcNum: '',
      dataQty: ''
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0016, htParams).done($.proxy(this._onSuccessSendingData, this));
  },

  _onSuccessSendingData: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {

    }
  }
};