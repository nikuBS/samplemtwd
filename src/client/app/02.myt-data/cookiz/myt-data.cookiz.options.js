/**
 * FileName: myt-data.cookiz.Options.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataCookizOptions = function (rootEl, svcInfo) {
  this.$container = rootEl;
  this.svcInfo = svcInfo;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataCookizOptions.prototype = {
  _init: function () {
    // this._apiService.request(Tw.API_CMD.BFF_06_0028, { childSvcMgmtNum: '' }).done($.proxy(this._onSuccessReceiveUserInfo, this));
    this._initialAuthList();
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-request-gift', $.proxy(this._getRequestGift, this));
    this.$container.on('click', '.fe-auth-history', $.proxy(this._goToAuthHistory, this));
    this.$container.on('click', '.fe-history-more', $.proxy(this._onShowMoreList, this));
  },

  _initialAuthList: function () {
    if ( $('.fe-wrap-history-list li').size() > 20 ) {
      $('.fe-history-more').show();
      this._hideListItem();
    }
  },

  _onShowMoreList: function (e) {
    var elTarget = $(e.currentTarget);
    var elList = $('.fe-wrap-history-list li');

    if ( elList.not(':visible').size() !== 0 ) {
      elList.not(':visible').slice(0, 20).show();
    }

    if ( elList.not(':visible').size() === 0 ) {
      elTarget.remove();
    }
  },

  _hideListItem: function () {
    $('.fe-wrap-history-list li').slice(20).hide();
  },

  _getRequestGift: function () {
    // request Gift by SMS
    this._onDataPesterDetail();
  },

  _onDataPesterDetail: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._popupService.openModalTypeA(
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A18.TITLE,
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A18.MSG,
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A18.BUTTON,
        null,
        $.proxy(this._pesterDetailConfirm, this),
        null);
    }
    else {
      Tw.CommonHelper.openUrlExternal(Tw.OUTLINK.MOBILE_TWORLD);
    }
  },

  _pesterDetailConfirm: function () {
    this._popupService.close();

    var content = Tw.ALERT_MSG_MYT_DATA.TING_PESTER.TITLE +
      Tw.FormatHelper.conTelFormatWithDash(this.svcInfo.svcNum) +
      Tw.ALERT_MSG_MYT_DATA.TING_PESTER.CONTENT +
      Tw.OUTLINK.MOBILE_TWORLD;

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