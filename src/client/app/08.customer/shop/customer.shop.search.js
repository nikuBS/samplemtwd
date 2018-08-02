/**
 * FileName: customer.shop.search.js (CI_02_01)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.26
 */

Tw.CustomerShopSearch = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._currentTab = 1;
  this._storeType = '0';

  this._cacheElements();
  this._bindEvent();
  this._init();
};

Tw.CustomerShopSearch.prototype = {
  _cacheElements: function () {
    this.$inputName = this.$container.find('#fe-text-name');
    this.$inputAddress = this.$container.find('#fe-text-address');
    this.$inputTube = this.$container.find('#fe-text-tube');
    this.$btnSearch = this.$container.find('.bt-red1 > button');
    this.$optionsTitle = this.$container.find('#fe-options-title');
    this.$btnMore = this.$container.find('.bt-more');
    this.$moreCount = this.$container.find('#fe-more-count');
  },
  _bindEvent: function () {
    this.$container.on('click', 'li[role="tab"] > button', $.proxy(this._onTabChanged, this));
    this.$container.on('keyup', 'input[type="text"]', $.proxy(this._onOffSearchButton, this));
    this.$container.on('click', '.bt-red1 > button', $.proxy(this._requestSearch, this));
    this.$container.on('change', 'input[type="radio"]', $.proxy(this._onOptionsChanged, this));
    this.$container.on('change', 'input[type="checkbox"]', $.proxy(this._onOptionsChanged, this));
    this.$container.on('click', '.fe-shop-detail', $.proxy(this._onShopDetail, this));
    this.$btnMore.on('click', $.proxy(this._onMore, this));
  },
  _init: function () {
    var selectedTab = this.$container.find('li[role="tab"][aria-selected="true"]')[0].id;
    switch (selectedTab) {
      case 'tab1':
        this._currentTab = 1;
        break;
      case 'tab2':
        this._currentTab = 2;
        break;
      case 'tab3':
        this._currentTab = 3;
        break;
      default:
        break;
    }
  },
  _onTabChanged: function (evt) {
    switch (evt.target.id) {
      case 'fe-tab1':
        this._currentTab = 1;
        this._onOffSearchButton({ currentTarget: { id: 'fe-text-name' } });
        break;
      case 'fe-tab2':
        this._currentTab = 2;
        this._onOffSearchButton({ currentTarget: { id: 'fe-text-address' } });
        break;
      case 'fe-tab3':
        this._currentTab = 3;
        this._onOffSearchButton({ currentTarget: { id: 'fe-text-tube' } });
        break;
      default:
        break;
    }
  },
  _onOffSearchButton: function (evt) {
    switch (evt.currentTarget.id) {
      case 'fe-text-name':
        if (this._currentTab === 1) {
          if (this.$inputName.val().trim().length > 0) {
            this.$btnSearch.removeAttr('disabled');
          } else {
            this.$btnSearch.attr('disabled', 'disabled');
          }
       }
        break;
      case 'fe-text-address':
        if (this._currentTab === 2) {
          if (this.$inputAddress.val().trim().length > 0) {
            this.$btnSearch.removeAttr('disabled');
          } else {
            this.$btnSearch.attr('disabled', 'disabled');
          }
        }
        break;
      case 'fe-text-tube':
        if (this._currentTab === 3) {
          if (this.$inputTube.val().trim().length > 0) {
            this.$btnSearch.removeAttr('disabled');
          } else {
            this.$btnSearch.attr('disabled', 'disabled');
          }
        }
        break;
      default:
        break;
    }
  },
  _onOptionsChanged: function (evt) {
    if (evt.target.type === 'radio') {
      this._storeType = evt.target.value;
      this.$optionsTitle.text(this.$optionsTitle.text().replace(/[^,]*,/, evt.target.title + ','));
    } else if (evt.target.type === 'checkbox') {
      var jobs = this.$container.find('input:checked[type=checkbox]');
      var optionsText = '';
      if (jobs.length === 0) {
        optionsText = '전체';
      } else if (jobs[0].value === 'all') {
        optionsText = jobs[0].title;
      } else {
        optionsText = _.reduce(jobs, function (str, job) {
          if (str.length !== 0) {
            str += ', ';
          }
          return str + job.title;
        }, '');
      }
      this.$optionsTitle.text(this.$optionsTitle.text().replace(/,.*/, ', ' + optionsText));
    }
  },
  _onShopDetail: function (evt) {
    this._historyService.goLoad('/customer/shop/detail?code=' + evt.currentTarget.value);
  },
  _onMore: function () {
    var result = this.$container.find('.store-result-list > .none');
    for (var i = 0; i < (result.length < 20 ? result.length: 20); i++) {
      $(result[i]).removeClass('none');
    }

    if (result.length - 20 <= 0) {
      this.$btnMore.hide();
    } else {
      this.$moreCount.text('(' + (result.length - 20 < 20 ? result.length - 20 : 20) + ')');
    }
  },
  _requestSearch: function () {
    var params = { storeType: this._storeType };
    switch (this._currentTab) {
      case 1:
        params.searchType = 'name';
        params.searchText = this.$inputName.val();
        break;
      case 2:
        params.searchType = 'address';
        params.searchText = this.$inputAddress.val();
        break;
      case 3:
        params.searchType = 'tube';
        params.searchText = this.$inputTube.val();
        break;
      default:
        break;
    }

    var jobs = this.$container.find('input:checked[type=checkbox]');
    if (jobs.length === 0 || jobs[0].value === 'all') {
      params.searchAll = 'Y';
    } else {
      _.map(jobs, function (checked) {
        switch (checked.value) {
          case 'premium':
            params.premium = 'Y';
            break;
          case 'pickup':
            params.direct = 'Y';
            break;
          case 'rental':
            params.rent = 'Y';
            break;
          case 'skb':
            params.skb = 'Y';
            break;
          case 'apple':
            params.apple = 'Y';
            break;
          case 'official':
            params.authAgnYn = 'Y';
            break;
          default:
           break;
        }
      });
    }

    var searchUrl = _.reduce(params, function (str, param, key) {
      if (str.match(/\?$/)) {
        return str + key + '=' + param;
      } else {
        return str + '&' + key + '=' + param;
      }
    }, '/customer/shop/search?');
    this._historyService.goLoad(searchUrl);
  }
};
