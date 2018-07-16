/*
 * FileName: recharge.limit.history.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.11
 */

Tw.RechargeLimitHistory = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeLimitHistory.prototype = {
  DEFAULT_LIST_COUNT: 20,

  TABS: {
    RECHARGE: 'recharge',
    LIMIT: 'limit',
  },

  _init: function () {
    this._selectedTab = window.location.hash || this.TABS.RECHARGE;

    this._getData();
  },

  _cachedElement: function () {
    this.$rechargeTab = this.$container.find('li.tab-recharge');
    this.$limitTab = this.$container.find('li.tab-limit');
  },

  _bindEvent: function () {
    this.$container.on('click', '.info-cancel button', $.proxy(this._openCancelAlert, this));
    this.$container.on('click', '.gift-bt-more', $.proxy(this._handleMoreClick, this));
  },

  _openCancelAlert: function () {
    this._popupService.openAlert(Tw.MSG_RECHARGE.LIMIT_A09, Tw.POPUP_TITLE.NOTIFY);
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
      leftCount: Math.max(0, this._rechargeItems.length - this.DEFAULT_LIST_COUNT),
      items: this._rechargeItems.slice(0, this.DEFAULT_LIST_COUNT)
    });
    tab.append(contents);
  },

  _handleMoreClick: function (e) {
    var items, $tab;

    switch (this._selectedTab) {
      case this.TABS.LIMIT:
        items = this._limitItems;
        $tab = this.$limitTab;
        break;
      case this.TABS.RECHARGE:
      default:
        items = this._rechargeItems;
        $tab = this.$rechargeTab;
        break;
    }

    var template = Handlebars.compile('{{>' + this._selectedTab + 'Items}}');
    var leftCount = e.target.getAttribute('data-left-count');
    var firstIdx = items.length - leftCount;
    var eItems = template({ items: items.slice(firstIdx, firstIdx + this.DEFAULT_LIST_COUNT) });
    $tab.find('ul').append(eItems);
    leftCount = leftCount - this.DEFAULT_LIST_COUNT;

    if (leftCount > 0) {
      e.target.setAttribute('data-left-count', leftCount);
      e.target.innerText = e.target.innerText.replace(/\((.+?)\)/, '(' + leftCount + ')');
    } else {
      e.target.style.display = 'none';
    }
  },

  _setProperRecharge: function (item) {
    if (item.opTypCd === "1") {
      item.type = {
        icon: "complete",
        label: Tw.RECHARGE_TYPE.RECHARGE
      }
    } else if (item.opTypCd === "3") {
      item.type = {
        icon: "auto",
        label: Tw.RECHARGE_TYPE.REGULAR
      }
    } else {
      item.type = {
        icon: "cancel",
        label: Tw.RECHARGE_TYPE.CANCEL,
        complete: true,
      }
    }
    item.refundable = item.refundableYn === "Y" ? true : false;
    return item;
  },

  _setItems: function (resp) {
    switch (this._selectedTab) {
      case this.TABS.LIMIT:
        this._limitItems = resp.result;
        break;
      case this.TABS.RECHARGE:
      default:
        this._rechargeItems = resp.result.map(this._setProperRecharge);
        break;
    }
  }
}