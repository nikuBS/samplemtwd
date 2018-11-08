/**
 * FileName: membership.benefit.brand.list.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.06
 */

Tw.MembershipBenefitBrandList = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cacheElements();
  this._bindEvent();
};

Tw.MembershipBenefitBrandList.prototype = {
  _cacheElements: function () {
    this.$btnSearch = this.$container.find('#fe-search');
  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-btn-city', $.proxy(this._onClickCity, this));
    this.$container.on('click', '#fe-btn-gu', $.proxy(this._onClickGu, this));
    this.$btnSearch.on('click', $.proxy(this._onSearchRequested, this));
  },
  _onClickCity: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: '광역시/도 선택',
      data: ''
    });
  },
  _onClickGu: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: '시/군/구 선택',
      data: ''
    });
  },
  _onSearchRequested: function () {
    // TODO: Joon api request
  }
};