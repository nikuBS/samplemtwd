/**
 * FileName: myt-data.prepaid.voice.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.14
 */

Tw.MyTDataPrepaidVoice = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidVoice.prototype = {
  _init: function () {
  //  {
    // "code": "00",
    // "msg": "success",
    // "result":
    // {
    // "prodAmt" : "50000",
    // "remained" : "100",
    // "obEndDt": "20190820",
    // "inbEndDt": "20190830",
    // "numEndDt": "20210421"
    // "dataYn": "Y",
    // "dataOnlyYn": "N"
    // }
    // }
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
 }
};