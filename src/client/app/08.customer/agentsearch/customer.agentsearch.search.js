/**
 * FileName: customer.agentsearch.search.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.16
 */

Tw.CustomerAgentsearch = function (rootEl, params) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._searchedItemTemplate = Handlebars.compile($('#tpl_search_result_item').html());

  this._options = {
    storeType: 0 // 0: 전체, 1: 지점, 2: 대리점
  };

  this._init(params);
  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerAgentsearch.prototype = {
  _init: function (params) {
    var hash = window.location.hash;
    this._prevTab = hash;
    if (!Tw.FormatHelper.isEmpty(hash) && window.location.hash !== '#name') {
      setTimeout($.proxy(function () {
        this.$container.find('a[href="' + window.location.hash + '"]').eq(0).trigger('click');
      }, this), 0);
    }

    if (!Tw.FormatHelper.isEmpty(params)) {
      /* // More btn 삭제
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
      */

      this._isSearched = true;
    }

    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function (searchString, position) {
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
    // this.$container.on('click', '.bt-more button', $.proxy(this._onMoreRequested, this));  // page navigation으로 변경
    this.$container.on('click', '.fe-branch-detail', $.proxy(this._onBranchDetail, this));
    this.$container.on('click', '.fe-custom-replace-history', $.proxy(this._onTabChanged, this));
    this.$container.on('click', '#fe-cancel-name,#fe-cancel-addr,#fe-cancel-tube',
      $.proxy(this._onCancelInput, this));
    this.$container.on('click', '.fe-go-page,#fe-go-first,#fe-go-prev,#fe-go-next,#fe-go-last',
      $.proxy(this._onPaging, this));
  },
  _onTabChanged: function (e) {
    if (this._isSearched && this._prevTab !== $(e.currentTarget).attr('href')) {
      this.$inputName.val('');
      this.$inputAddr.val('');
      this.$inputTube.val('');
      this.$divResult.addClass('none');
      this._prevTab = window.location.hash;
      this._isSearched = false;
    }
    location.replace(e.currentTarget.href);
  },
  _onInput: function (e) {
    var text = e.currentTarget.value;
    var enable = Tw.FormatHelper.isEmpty(text) ? false : true;

    var targetId = e.currentTarget.id;
    switch (targetId) {
      case 'fe-input-name':
        if (enable) {
          this.$btnSearchName.removeAttr('disabled');
        } else {
          this.$btnSearchName.attr('disabled', 'disabled');
        }
        break;
      case 'fe-input-addr':
        if (enable) {
          this.$btnSearchAddr.removeAttr('disabled');
        } else {
          this.$btnSearchAddr.attr('disabled', 'disabled');
        }
        break;
      case 'fe-input-tube':
        if (enable) {
          this.$btnSearchTube.removeAttr('disabled');
        } else {
          this.$btnSearchTube.attr('disabled', 'disabled');
        }
        break;
      default:
        break;
    }
  },
  _onOptionsClicked: function () {
    this._popupService.open({
        hbs: 'CS_02_01_01'
      },
      $.proxy(function ($root) {
        new Tw.CustomerAgentsearchSearchOptions(
          $root, this._options, $.proxy(this._onOptionsChanged, this));
      }, this),
      null,
      'options'
    );
  },
  _onOptionsChanged: function (options) {
    this._popupService.close();

    if (!!options) {
      this._options = options;

      if (!!this._isSearched) {
        var $activeTab = this.$container.find('li[role="tab"][aria-selected="true"]');
        var tabId = $activeTab.attr('id');
        var id = 'fe-btn-search-name';
        switch (tabId) {
          case 'tab2':
            id = 'fe-btn-search-addr';
            break;
          case 'tab3':
            id = 'fe-btn-search-tube';
            break;
          default:
            break;
        }

        this._onSearchRequested({
          currentTarget: {
            id: id
          }
        });
        return;
      }

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
    this._historyService.replaceURL(this._getSearchUrl(e, true));
  },
  _onPaging: function (e) {
    var $target = $(e.currentTarget);
    if ($target.hasClass('active') || $target.hasClass('disabled')) {
      return;
    }

    var page = undefined;
    if ($target.hasClass('fe-go-page')) {
      page = $target.text();
    } else {
      page = $target.data('page');
    }

    this._historyService.goLoad(this._getSearchUrl(null, false, page));
  },
  _getSearchUrl: function (e, bySearchBtn, page) {  // bySearchBtn: true - 처음검색, false - page 검색
    var url = '/customer/agentsearch/search?type=';
    var hash = '#name';

    if (bySearchBtn) {
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
    } else {
      var currentHash = location.href.match(/#.*/)[0];
      switch (currentHash) {
        case '#name':
          url += 'name&keyword=' + this.$inputName.val();
          break;
        case '#addr':
          url += 'addr&keyword=' + this.$inputAddr.val();
          hash = '#addr';
          break;
        case '#tube':
          url += 'tube&keyword=' + this.$inputTube.val();
          hash = '#tube';
          break;
        default:
          return;
      }
      url += '&page=' + page;
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

    return url;
  },
  /*  // page navigation으로 변경
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
  */
  _onBranchDetail: function (e) {
    if (e.target.nodeName.toLowerCase() === 'a') {
      return;
    }

    var code = $(e.currentTarget).attr('value');

    this._historyService.goLoad('/customer/agentsearch/detail?code=' + code);
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
  },
  _onCancelInput: function (e) {
    var $target = $(e.currentTarget);
    if ($target.attr('id').indexOf('name') !== -1) {
      this.$btnSearchName.attr('disabled', 'disabled');
    } else if ($target.attr('id').indexOf('addr') !== -1) {
      this.$btnSearchAddr.attr('disabled', 'disabled');
    } else if ($target.attr('id').indexOf('tube') !== -1) {
      this.$btnSearchTube.attr('disabled', 'disabled');
    }
  }
};