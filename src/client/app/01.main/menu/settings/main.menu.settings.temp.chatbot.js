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
Tw.MainMenuSettingsTempChatbot = function (params) {
  this.$container = params.$element;
  this._data = params.data;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(this.$container);
  this._bpcpService = Tw.Bpcp;
};

Tw.MainMenuSettingsTempChatbot.prototype = {
  goChatbot: function (e) {
    // var eParam = "custNum=" + this._data._custNum + "~" + "mbrChlId=" + this._data._mbrChlId;
    // this._bpcpService.open("BPCP:0000065084", this._data._svcMgmtNum, eParam);


    this._bpcpService.open("BPCP:0000065084");
    // return this._historyService.replaceURL("http://stg-tworld.sktchatbot.co.kr/?token=036e9045f8ae52254065df96a73a3870&provider_usn=jinajang&type=USER&mbr_chl_id=jinajang&svc_mgmt_num=jinajang");
  }
};