/**
 * FileName: myt-join.suspend.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 15.
 */

Tw.MyTJoinSuspend = function (rootEl) {
  this._children = null;
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;
  this._historyService.init();

  this._cachedElement();
  this._bindEvent();

};

Tw.MyTJoinSuspend.prototype = {
  _cachedElement: function () {
  },

  _bindEvent: function () {
  }
};