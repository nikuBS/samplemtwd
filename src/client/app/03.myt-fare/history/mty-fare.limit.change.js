/**
 * FileName: myt-fare.limit.change.js
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018. 9. 17
 */
Tw.MyTFareLimitChange = function (rootEl, data) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(rootEl);
  this._popupService = Tw.Popup;

  this.data = JSON.parse(data).result;

  this._init();
};

Tw.MyTFareLimitChange.prototype = {
  _init : function() {
    this._cachedElement();
    this._bindEvent();

    if(this.data.isUnpaid === 'Y') {

    }

  },
  _cachedElement: function () {

  },
  _bindEvent: function () {

  }
};