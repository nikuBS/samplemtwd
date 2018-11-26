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
    this._onDataPesterDetail();
  },

  // 데이터 조르기
  _onDataPesterDetail: function () {
    //  2_A17 Alert 호출
    this._popupService.openModalTypeA(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.TITLE, Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.MSG,
      Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.BUTTON, null, $.proxy(this._pesterDetailConfirm, this), null);
  },

  _pesterDetailConfirm: function () {
    this._popupService.close();
    // excel 기준 (조르기 : OS 내 페이지 공유화면 제공)
    var content = Tw.ALERT_MSG_MYT_DATA.DATA_PESTER.TITLE + Tw.ALERT_MSG_MYT_DATA.DATA_PESTER.CONTENT;
    Tw.CommonHelper.share(content);
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