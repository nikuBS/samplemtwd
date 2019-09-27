/**
 * @file main.menu.settings.notifications.chatbot.js
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.09.20
 * @desc 챗봇 BPCP 연결
 */

/**
 * @namespace
 * @desc 챗봇 BPCP 연결
 */
Tw.MainMenuSettingsTempDsds = function (params) {
  this.$container = params.$element;
  this._data = params.data;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(this.$container);
  this._nativeService = Tw.Native;
};

Tw.MainMenuSettingsTempDsds.prototype = {
  goNative: function (e) {
  var _esimUrl = "https://prj-m.shop.tworld.co.kr/dsds/main";

  this._nativeService.send(Tw.NTV_CMD.OPEN_ESIMURL, {esimUrl: _esimUrl}, $.proxy(this._onContact, this));
  },
  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
    }
  }

};