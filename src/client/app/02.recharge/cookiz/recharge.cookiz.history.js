/**
 * FileName: recharge.cookiz.history.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.09
 */

Tw.RechargeCookizHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeCookizHistory.prototype = {
  DEFAULT_LIST_COUNT: 20,
  tab1_searchType: '0',
  tab1_searchPeriod: '-3',
  tab1_listIndex: 0,
  tab1_list: [],
  tab2_searchType: '0',
  tab2_searchPeriod: '-3',
  tab2_listIndex: 0,
  tab2_list: [],

  _init: function () {

  },

  _cachedElement: function () {

  },

  _bindEvent: function () {

  },
};