/**
 * FileName: customer.shop.search.js (CI_02_01)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.26
 */

Tw.CustomerShopSearch = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._hashService = Tw.Hash;

  this._currentTab = 1;
  this._storeType = '0';

  this._cacheElements();
  this._bindEvent();

  this._hashService.initHashNav($.proxy(this._onTabChanged, this));
};

Tw.CustomerShopSearch.prototype = {
  _cacheElements: function () {
    this.$inputName = this.$container.find('#fe-text-name');
    this.$inputAddress = this.$container.find('#fe-text-address');
    this.$inputTube = this.$container.find('#fe-text-tube');
    this.$btnSearch = this.$container.find('.bt-red1 > button');
    this.$optionsTitle = this.$container.find('#fe-options-title');
  },
  _bindEvent: function () {
    this.$container.on('keyup', 'input[type="text"]', $.proxy(this._onOffSearchButton, this));
    this.$container.on('click', '.bt-red1 > button', $.proxy(this._requestSearch, this));
    this.$container.on('change', 'input[type="radio"]', $.proxy(this._onOptionsChanged, this));
    this.$container.on('change', 'input[type="checkbox"]', $.proxy(this._onOptionsChanged, this));
  },
  _onTabChanged: function (hash) {
    switch (hash.raw) {
      case '':
      case 'name':
        this._currentTab = 1;
        this._onOffSearchButton({ currentTarget: { id: 'fe-text-name' } });
        break;
      case 'address':
        this._currentTab = 2;
        this._onOffSearchButton({ currentTarget: { id: 'fe-text-address' } });
        break;
      case 'tube':
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
  _requestSearch: function () {
    var query = '';
    switch (this._currentTab) {
      case 1:
        query = this.$inputName.val();
        break;
      case 2:
        query = this.$inputAddress.val();
        break;
      case 3:
        query = this.$inputTube.val();
        break;
      default:
        break;
    }
    var params = { searchText: query };
    params.storeType = this._storeType;

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

    // TODO: request search
  }
};
