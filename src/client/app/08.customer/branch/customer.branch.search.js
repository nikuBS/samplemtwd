/**
 * FileName: customer.branch.search.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.16
 */

Tw.CustomerBranchSearch = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._searchedItemTemplate = Handlebars.compile($('#tpl_search_result_item').html());

  this._options = {
    storeType: 0  // 0: 전체, 1: 지점, 2: 대리점
  };

  this._page = 1;
  this._lastCmd = null;
  this._lastQueryParams = null;

  this._init();
  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerBranchSearch.prototype = {
  _init: function () {
    var hash = window.location.hash;
    if (!Tw.FormatHelper.isEmpty(hash) && window.location.hash !== '#name') {
      setTimeout($.proxy(function () {
        this.$container.find('a[href="' + window.location.hash + '"]').eq(0).trigger('click');
      }, this), 0);
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
    var cmd = null;
    var params = {};
    switch (e.currentTarget.id) {
      case 'fe-btn-search-name':
        cmd = Tw.API_CMD.BFF_08_0004;
        params.searchText = this.$inputName.val();
        break;
      case 'fe-btn-search-addr':
        cmd = Tw.API_CMD.BFF_08_0005;
        params.searchText = this.$inputAddr.val();
        break;
      case 'fe-btn-search-tube':
        cmd = Tw.API_CMD.BFF_08_0006;
        params.searchText = this.$inputTube.val();
        break;
      default:
        return;
    }
    params.searchText = encodeURIComponent(params.searchText);

    $.extend(true, params, this._options);

    this._apiService.request(cmd, params)
      .done($.proxy(this._onSearchResult, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });

    this._page = 1;

    this._lastCmd = cmd;
    this._lastQueryParams = params;
  },
  _onSearchResult: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (res.result.regionInfoList.length === 0) {
        this.$divNone.removeClass('none');
        this.$divResult.addClass('none');
      } else {
        this.$divResult.removeClass('none');
        this.$divNone.addClass('none');

        this.$resultCount.text(res.result.totalCount);
        this.$ulResult.empty();
        this.$ulResult.append(this._searchedItemTemplate({
          list: res.result.regionInfoList
        }));

        if (res.result.lastPageType === 'Y') {
          this.$divMore.addClass('none');
        } else {
          this.$divMore.removeClass('none');
        }

        this._page++;
      }
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
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
    this._historyService.goLoad('/customer/branch/detail?code=' + code);
  }
};
