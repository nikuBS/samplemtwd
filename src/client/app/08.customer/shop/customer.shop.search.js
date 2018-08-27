/**
 * FileName: customer.shop.search.js (CI_02_01)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.26
 */

Tw.CustomerShopSearch = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._searchedItemTemplate = Handlebars.compile($('#tpl_search_result_item').html());

  this._currentTab = 1;
  this._storeType = '0';

  this._pageCount = 2;

  this._cacheElements();
  this._bindEvent();
  this._setCurrentTab();
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
    this.$result = this.$container.find('.store-result-list');
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
  _setCurrentTab: function () {
    var curTabId = this.$container.find('li[role="tab"][aria-selected="true"]').attr('id');
    this._currentTab = curTabId === 'tab1' ? 1 : curTabId === 'tab2' ? 2 : 3;
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
      if (this.$optionsTitle.text().includes(',')) {
        this.$optionsTitle.text(
          this.$optionsTitle.text().replace(/[^,]*,/, evt.target.title + ','));
      } else {
        this.$optionsTitle.text(evt.target.title);
      }
    } else if (evt.target.type === 'checkbox') {
      var jobs = this.$container.find('input:checked[type=checkbox]');
      var optionsText = '';
      optionsText = _.reduce(jobs, function (str, job) {
        if (str.length !== 0) {
          str += ', ';
        }
        return str + job.title;
      }, '');

      if (this.$optionsTitle.text().includes(',')) {
        this.$optionsTitle.text(this.$optionsTitle.text().replace(/,.*/, ', ' + optionsText));
      } else {
        this.$optionsTitle.text(this.$optionsTitle.text() + ',' + optionsText);
      }

      if (optionsText === '') {
        this.$optionsTitle.text(this.$optionsTitle.text().replace(',', ''));
      }
    }
  },
  _onShopDetail: function (evt) {
    this._historyService.goLoad('/customer/shop/detail?code=' + evt.currentTarget.value);
  },
  _onMore: function () {
    var cmd = Tw.API_CMD.BFF_08_0004;
    var params = { currentPage: this._pageCount };
    switch (this._currentTab) {
      case 1:
        params.searchText = this.$inputName.val();
        break;
      case 2:
        cmd = Tw.API_CMD.BFF_08_0005;
        params.searchText = this.$inputAddress.val();
        break;
      case 3:
        cmd = Tw.API_CMD.BFF_08_0006;
        params.searchText = this.$inputTube.val();
        break;
      default:
        break;
    }

    params.searchText = encodeURIComponent(params.searchText);

    this._buildSearchOptions(params);

    this._apiService.request(cmd, params)
      .done($.proxy(this._onMoreResult, this))
      .fail(function (err) {
        Tw.Popup.openAlert(err.code + ' ' + err.msg);
      });
  },
  _onMoreResult: function (res) {
    if (res.result.lastPageType === 'Y') {
      this.$btnMore.hide();
    } else {
      var newCount = res.result.totalCount - (this._pageCount * 20) >= 20 ?
        20 : res.result.totalCount - (this._pageCount * 20);
      this.$moreCount.text(newCount);
    }

    this.$result.append(this._searchedItemTemplate({
      list: res.result.regionInfoList
    }));

    this._pageCount++;
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

    this._buildSearchOptions(params);

    var searchUrl = _.reduce(params, function (str, param, key) {
      if (str.match(/\?$/)) {
        return str + key + '=' + param;
      } else {
        return str + '&' + key + '=' + param;
      }
    }, '/customer/shop/search?');
    this._historyService.goLoad(searchUrl);
  },
  _buildSearchOptions: function (params) {
    var jobs = this.$container.find('input:checked[type=checkbox]');
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
};
