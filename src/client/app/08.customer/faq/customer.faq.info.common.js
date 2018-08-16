/**
 * FileName: customer.faq.info.common.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.14
 */

Tw.CustomerFaqInfoCommon = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._init();
};

Tw.CustomerFaqInfoCommon.prototype = {
  _init: function () {
  },

  _setTab: function (context, callback, hashList, hashTriggerList) {
    var index;

    this.currentTab = this._hash._currentHashNav || hashList[0];
    index = hashList.indexOf(this.currentTab);

    if (index < 0) {
      this.currentTab = hashList[0];
      this._forceRefreshWithHash(this.currentTab);
    }

    hashTriggerList.eq(index).attr('aria-selected', true);

    $(window).on('hashchange', $.proxy(this._tabChangeHandler, this, callback, context));
  },

  _forceRefreshWithHash: function (hash) {
    this._history.goHash(hash);
    this.currentTab = hash;
  },

  _tabChangeHandler: function (context, callback) {
    if (this._hash._currentHashNav !== this.currentTab) {
      this.currentTab = this._hash._currentHashNav;
      $.proxy(callback, context)();
    }
  }
};
