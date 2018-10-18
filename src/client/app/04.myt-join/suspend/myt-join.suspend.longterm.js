/**
 * FileName: myt-join.suspend.longterm
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 18.
 */
Tw.MyTJoinSuspendLongTerm = function (tabEl) {
  this.$container = tabEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._cachedElement();
  this._bindEvent();
};

Tw.MyTJoinSuspendLongTerm.prototype = {
  _cachedElement: function () {
  },

  _bindEvent: function () {
  }
};