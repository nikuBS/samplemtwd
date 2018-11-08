/**
 * FileName: customer.branch.search.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.16
 */

Tw.CustomerBranchSearch = function (rootEl, params) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._searchedItemTemplate = Handlebars.compile($('#tpl_search_result_item').html());

  this._options = {
    storeType: 0  // 0: 전체, 1: 지점, 2: 대리점
  };

  this._init(params);
  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerBranchSearch.prototype = {
  _init: function (params) {
    var hash = window.location.hash;
    if (!Tw.FormatHelper.isEmpty(hash) && window.location.hash !== '#name') {
      setTimeout($.proxy(function () {
        this.$container.find('a[href="' + window.location.hash + '"]').eq(0).trigger('click');
      }, this), 0);
    }

    // Save current search result's query detail
    if (!Tw.FormatHelper.isEmpty(params)) {
      this._page = 2;
      $.extend(true, this._options, params);
      delete this._options.searchText;

      this._lastCmd = Tw.API_CMD.BFF_08_0004;
      switch (hash) {
        case '#addr':
          this._lastCmd = Tw.API_CMD.BFF_08_0005;
          break;
        case '#tube':
          this._lastCmd = Tw.API_CMD.BFF_08_0006;
          break;
      }

      this._lastQueryParams = params;
      this._lastQueryParams.searchText = encodeURIComponent(params.searchText);
    }

    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString, position) {
          var subjectString = this.toString();
          if (typeof position !== 'number' || !isFinite(position) ||
              Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
          }
          position -= searchString.length;
          var lastIndex = subjectString.indexOf(searchString, position);
          return lastIndex !== -1 && lastIndex === position;
      };
    }
  },
  _cacheElements: function () {
    this.$inputName = this.$container.find('#fe-input-name');
    this.$inputAddr = this.$container.find('#fe-input-addr');
    this.$inputTube = this.$container.find('#fe-input-tube');
    this.$btnSearchName = this.$container.find('#fe-btn-search-name');
    this.$btnSearchAddr = this.$container.find('#fe-btn-search-addr');
    this.$btnSearchTube = this.$container.find('#fe-btn-search-tube');
    this.$btnOptions = this.$container.find('.bt-dropdown');
    this.$divNone = this.$container.find('.fe-none');
    this.$divResult = this.$container.find('.fe-result');
    this.$ulResult = this.$container.find('#fe-result-list');
    this.$resultCount = this.$container.find('#fe-result-count');
    this.$divMore = this.$container.find('.btn-more');
  },
  _bindEvents: function () {
    this.$container.on('keyup', 'input', $.proxy(this._onInput, this));
    this.$container.on('click', '.cancel', $.proxy(this._onInput, this));
    this.$container.on('click', '#fe-btn-search-name, #fe-btn-search-addr, #fe-btn-search-tube',
      $.proxy(this._onSearchRequested, this));
    this.$btnOptions.on('click', $.proxy(this._onOptionsClicked, this));
    this.$container.on('click', '.bt-more button', $.proxy(this._onMoreRequested, this));
    this.$container.on('click', '.fe-branch-detail', $.proxy(this._onBranchDetail, this));
    this.$container.on('click', '.fe-data-charge', $.proxy(this._onNearBranchClicked, this));
  },
  _onInput: function (e) {
    var elem = e.currentTarget;
    var needToEnable = Tw.FormatHelper.isEmpty(elem.value) ? false : true;
    if (elem.id.indexOf('name') !== -1) {
      if (needToEnable) {
        this.$btnSearchName.removeAttr('disabled');
      } else {
        this.$btnSearchName.attr('disabled', 'disabled');
      }
    } else if (elem.id.indexOf('addr') !== -1) {
      if (needToEnable) {
        this.$btnSearchAddr.removeAttr('disabled');
      } else {
        this.$btnSearchAddr.attr('disabled', 'disabled');
      }
    } else {
      if (needToEnable) {
        this.$btnSearchTube.removeAttr('disabled');
      } else {
        this.$btnSearchTube.attr('disabled', 'disabled');
      }
    }
  },
  _onOptionsClicked: function () {
    this._popupService.open(
      { hbs: 'CS_02_01_01' },
      $.proxy(function ($root) {
        new Tw.CustomerBranchSearchOptions(
          $root, this._options, $.proxy(this._onOptionsChanged, this));
      }, this),
      null,
      'options'
    );
  },
  _onOptionsChanged: function (options) {
    this._popupService.close();
    if (options) {
      this._options = options;

      // make text to show about options set
      var text = Tw.BRANCH_SEARCH_OPTIONS[this._options.storeType];
      var optionToShow = '';
      var count = 0;
      for (var key in this._options) {
        if (key === 'storeType') {
          continue;
        }
        count++;
        if (Tw.FormatHelper.isEmpty(optionToShow)) {
          optionToShow = Tw.BRANCH_SEARCH_OPTIONS[key];
        }
      }
      if (count > 0) {
        text += ', ' + optionToShow;
        if (count > 1) {
          text += Tw.BRANCH_SEARCH_OPTIONS.etc + (count - 1) + Tw.BRANCH_SEARCH_OPTIONS.count;
        }
      }
      this.$btnOptions.text(text);
    }
  },
  _onSearchRequested: function (e) {
    var url = '/customer/branch/search?type=';
    var hash = '#name';

    switch (e.currentTarget.id) {
      case 'fe-btn-search-name':
        url += 'name&keyword=' + this.$inputName.val();
        break;
      case 'fe-btn-search-addr':
        url += 'addr&keyword=' + this.$inputAddr.val();
        hash = '#addr';
        break;
      case 'fe-btn-search-tube':
        url += 'tube&keyword=' + this.$inputTube.val();
        hash = '#tube';
        break;
      default:
        return;
    }

    url += '&storeType=' + this._options.storeType;

    url += '&options=';
    for (var key in this._options) {
      if (key === 'storeType') {
        continue;
      }
      if (url.endsWith('&options=')) {
        url += key;
      } else {
        url += '::' + key;
      }
    }
    if (url.endsWith('&options=')) {
      url = url.substring(0, url.indexOf('&options='));
    }
    url += hash;

    this._historyService.goLoad(url);
  },
  _onMoreRequested: function () {
    this._lastQueryParams.currentPage = this._page;
    this._apiService.request(this._lastCmd, this._lastQueryParams)
      .done($.proxy(this._onMoreResult, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  },
  _onMoreResult: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$ulResult.append(this._searchedItemTemplate({
        list: res.result.regionInfoList
      }));

      if (res.result.lastPageType === 'Y') {
        this.$divMore.addClass('none');
      } else {
        this.$divMore.removeClass('none');
      }

      this._page++;
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  _onBranchDetail: function (e) {
    if (e.target.nodeName.toLowerCase() === 'a') {
      return;
    }

    var code = $(e.currentTarget).attr('value');

    if (Tw.BrowserHelper.isApp()) {
      this._showDataChargePopup($.proxy(function () {
        this._historyService.goLoad('/customer/branch/detail?code=' + code);
      }, this));
    } else {
      this._historyService.goLoad('/customer/branch/detail?code=' + code);
    }
  },
  _onNearBranchClicked: function (e) {
    if (Tw.BrowserHelper.isApp()) {
      this._showDataChargePopup($.proxy(function () {
        this._historyService.goLoad($(e.currentTarget).attr('href'));
      }, this));
      return false;
    }
    return true;
  },
  _showDataChargePopup: function (onConfirm) {
    this._popupService.openConfirm(
      Tw.POPUP_CONTENTS.NO_WIFI,
      Tw.POPUP_TITLE.EXTERNAL_LINK,
      $.proxy(function () {
        this._popupService.close();
        onConfirm();
      }, this)
    );
  }
};
