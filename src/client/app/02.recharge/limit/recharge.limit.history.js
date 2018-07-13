/*
 * FileName: recharge.limit.history.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.11
 */

Tw.RechargeLimitHistory = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._bindEvent();
  this._init();
};

Tw.RechargeLimitHistory.prototype = {
  _init: function () {
    this._selectedTab = window.location.hash || "recharge";

    this._getData();
  },

  _bindEvent: function () {
    this.$container.on('click', '.info-cancel button', $.proxy(this._openCancelAlert, this));
  },

  _openCancelAlert: function () {
    this._popupService.openAlert(Tw.MSG_RECHARGE.LIMIT_A09, Tw.POPUP_TITLE.NOTIFY)
  },

  _getData: function () {
    if (this._selectedTab === 'limit') {

    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0042)
        .done($.proxy(this._handleLoadNewData, this))
        .fail($.proxy(this._fail, this));
    }
  },

  _fail: function (err) {
    Tw.Logger.log('limit fail', err);
  },

  _handleLoadNewData: function (resp) {
    this._setItems(resp);

    var tab = this.$container.find('.tab-contents li.tab-' + this._selectedTab);
    var template = Handlebars.compile($('#tmpl-' + this._selectedTab).html());
    Handlebars.registerPartial('rechargeItems', $('#tmpl-items-' + this._selectedTab).html());
    var contents = template({
      totalCount: this._rechargeItems.length,
      leftCount: Math.max(0, this._rechargeItems.length - 20),
      items: this._rechargeItems.slice(0, 20)
    });
    tab.append(contents);
  },

  _setProperRecharge: function (item) {
    if (item.opTypCd === "1") {
      item.type = {
        icon: "complete",
        label: "충전"
      }
    } else if (item.opTypCd === "3") {
      item.type = {
        icon: "auto",
        label: "자동"
      }
    } else {
      item.type = {
        icon: "cancel",
        label: "취소",
        complete: true,
      }
    }
    item.refundable = item.refundableYn === "Y" ? true : false;
    return item;
  },

  _setItems: function (resp) {
    switch (this._selectedTab) {
      case 'recharge':
        this._rechargeItems = resp.result.map(this._setProperRecharge);
        break;
      case 'limit':
        this._limitItems = resp.result;
        break;
    }
  }
}