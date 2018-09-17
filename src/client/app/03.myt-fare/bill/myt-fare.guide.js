/**
 * FileName: myt-fare.guide.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */

Tw.MyTFareGuide = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  // this._cachedElement();
  // this._bindEvent();
  this._init();
};

Tw.MyTFareGuide.prototype = {
  _init: function () {
    this._getRemainDataInfo();
  },

  _getReceiveUserInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0019, {}).done($.proxy(this._onSuccessReceiveUserInfo, this));
  },
  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {

    }
  }

};