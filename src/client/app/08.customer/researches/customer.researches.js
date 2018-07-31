/*
 * FileName: customer.researches.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerResearches = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);

  this._bindEvent();
};

Tw.CustomerResearches.prototype = {
  _bindEvent: function () {
    this.$container.on('click', 'li.bt-blue1 > button', $.proxy(this._handleParticipate, this));
  },

  _handleParticipate: function () {
    // 참여하기 버튼 클릭
  }
};