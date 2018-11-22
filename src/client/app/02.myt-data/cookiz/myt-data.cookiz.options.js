/**
 * FileName: myt-data.cookiz.Options.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataCookizOptions = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataCookizOptions.prototype = {
  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0028, { childSvcMgmtNum: '' }).done($.proxy(this._onSuccessReceiveUserInfo, this));
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-request-gift', $.proxy(this._getRequestGift, this));
    this.$container.on('click', '.fe-auth-history', $.proxy(this._goToAuthHistory, this));
  },

  _getRequestGift: function () {
  },

  _goToAuthHistory: function () {
    this._historyService.goLoad('/myt-data/recharge/cookiz/auth');
  },

  _onSuccessRequestGift: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/cookiz/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};