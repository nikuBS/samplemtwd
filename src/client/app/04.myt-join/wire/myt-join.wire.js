/**
 * FileName: myt-join.wire.as.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
Tw.MyTJoinWire = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._options = options;

  this._bindEvent();
  this._registerHelper();
};

Tw.MyTJoinWire.prototype = {
  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
  },

  /**
   * ui reset
   * @private
   */
  _resetUI: function() {
  },

  /**
   * hbs register helper 등록
   * @private
   */
  _registerHelper: function () {
  }


};
