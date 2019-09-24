/**
 * @file 지점/대리점 검색 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-16
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 * @param  {String} params - query params
 */
Tw.CustomerAgentsearch = function (rootEl, params) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this.tubeNameList = []; // 지하철 역명 저장되는 배열
  

  this._searchedItemTemplate = Handlebars.compile($('#tpl_search_result_item').html());

  this._options = {
    storeType: 0 // 0: 전체, 1: 지점, 2: 대리점
  };

  // URLSearchParams polyfill
  (function (w) {
    w.URLSearchParams = w.URLSearchParams || function (searchString) {
        var self = this;
        self.searchString = searchString;
        self.get = function (name) {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(self.searchString);
            if (results == null) {
                return null;
            }
            else {
                return decodeURI(results[1]) || 0;
            }
        };
    }
  })(window);

  this._init(params);
  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerAgentsearch.prototype = {

  /**
   * @function
   * @desc 현재 탭이 지하철역 일 경우 선택된 노선 및 역 화면표시 기능
   * @param  {String} params
   */
  _init: function (params) {
    var hash = window.location.hash;
    this._prevTab = hash;
    if (!Tw.FormatHelper.isEmpty(hash) && window.location.hash !== '#name') {
      setTimeout($.proxy(function () {
        this.$container.find('a[href="' + window.location.hash + '"]').eq(0).trigger('click');

        // query에 지역명, 노선명  있을 경우 해당 값들 설정
        if (hash === '#tube' && window.location.href.indexOf('area') !== -1) {
          var urlParams = new window.URLSearchParams(window.location.search);
          var area = urlParams.get('area').split(':');
          var line = urlParams.get('line').split(':');
          var tubeName = urlParams.get('keyword').split(':');
          // Tw.Logger.info('[검색후 url 지하철 : ]', tubeName);
          this.$container.find('#fe-select-area').text(area[0]);
          this.$container.find('#fe-select-line').text(line[0]);
          this.$container.find('#fe-select-name').text(tubeName[0]);
          this._selectedTubeAreaCode = area[1];
          this._selectedTubeLineCode = line[1];
          this._selectedTubeNameCode = tubeName[1];
          // Tw.Logger.info('[검색후 url 지하철 역명 번호 : ]', this._selectedTubeNameCode);
          // alert(this._selectedTubeNameCode);
          $.proxy(this._getTubeNameList(),this);
        }
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

      delete params.searchText;
      delete params.searchAreaNm;
      delete params.searchLineNm;
      delete params.currentPage;
      $.extend(true, this._options, params);

      this._isSearched = true;
    }

    // endsWith polyfill
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
    this.$inputTube = this.$container.find('#fe-select-name');
    // this.$inputTube = this.$container.find('#fe-input-tube');
    this.$btnSearchName = this.$container.find('#fe-btn-search-name');
    this.$btnSearchAddr = this.$container.find('#fe-btn-search-addr');
    this.$btnSearchTube = this.$container.find('#fe-btn-search-tube');
    this.$btnOptions = this.$container.find('.fe-options');
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
    this.$container.on('click', '#fe-select-area', $.proxy(this._onTubeArea, this));
    this.$container.on('click', '#fe-select-line', $.proxy(this._onTubeLine, this));
    this.$container.on('click', '#fe-select-name', $.proxy(this._onTubeName, this));
    this.$container.on('click', 'a[target="_blank"]', $.proxy(this._onExternalLink, this));
  },

  /**
   * @function
   * @desc tab 변경에 땨른 화면 처리
   * @param  {Object} e - click event
   */
  _onTabChanged: function (e) {
    if (this._isSearched && this._prevTab !== $(e.currentTarget).attr('href')) {
      this.$inputName.val('');
      this.$inputAddr.val('');
      this.$inputTube.val('');
      this.$container.find('#fe-select-area').text('지역선택');
      this.$container.find('#fe-select-line').text('노선선택');
      this.$container.find('#fe-select-name').text('지하철 역명 선택');
      this._selectedTubeAreaCode = null;
      this._selectedTubeLineCode = null;
      this._selectedTubeNameCode = null;
      this.$divResult.addClass('none');
      this._prevTab = window.location.hash;
      this._isSearched = false;

      this.$btnSearchAddr.attr('disabled', 'disabled');
      this.$btnSearchName.attr('disabled', 'disabled');
      this.$btnSearchTube.attr('disabled', 'disabled');
    }
    location.replace(e.currentTarget.href);

    // 웹접근성, 선택된 tab 에 aria-selected 값 true
    this.$container.find('.fe-tab a').attr('aria-selected', 'false');
    $(e.currentTarget).attr('aria-selected', 'true');
  },

  /**
   * @function
   * @desc 검색어 입력에 따른 이벤트 처리(각각의 버튼 활성/비활성 처리)
   * @param  {Object} e - keyup event
   */
  _onInput: function (e) {
    var text = e.currentTarget.value.trim();
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
      case 'fe-select-name':
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

  /**
   * @function
   * @desc 옵션 선택한 경우 레이어 팝업으로 옵션화면 노출
   * @param  {Object} e - click event
   */
  _onOptionsClicked: function (e) {
    this._popupService.open({
        hbs: 'CS_02_01_01'
      },
      $.proxy(function ($root) {
        new Tw.CustomerAgentsearchSearchOptions(
          $root, this._options, $.proxy(this._onOptionsChanged, this));
      }, this),
      null,
      'options', e
    );
  },

  /**
   * @function
   * @desc 변경된 옵션에 따라 BFF로 요청할 data를 만들어줌
   * @param  {Object} options - 변경된 옵션 값
   */
  _onOptionsChanged: function (options) {
    if (!!options) {
      this._options = options;

      if (!!this._isSearched) {
        var $activeTab = this.$container.find('li[role="presentation"][aria-selected="true"]');
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
        }, true);
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

  /**
   * @function
   * @desc 지하철 탭에서 지역선택 시 actionsheet로 옵션 표기해줌
   */
  _onTubeArea: function () {
    var list = Tw.POPUP_TPL.CUSTOMER_AGENTSEARCH_TUBE_AREA;
    if (!Tw.FormatHelper.isEmpty(this._selectedTubeAreaCode)) { // 선택된 항목에 checked 추가
      list[0].list = _.map(list[0].list, $.proxy(function (item) {
        if (item['radio-attr'].indexOf('checked') !== -1 && !(item['radio-attr'].indexOf('id="' + this._selectedTubeAreaCode) !== -1)) {
          item['radio-attr'] = item['radio-attr'].replace('checked', '');
        } else if (item['radio-attr'].indexOf('id="' + this._selectedTubeAreaCode) !== -1) {
          item['radio-attr'] += ' checked';
        }
        return item;
      }, this));
    }

    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      data: list,
      btnfloating: { attr: 'type="button"', txt: Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(function ($root) {
      $root.on('click', '.btn-floating', $.proxy(function () {
        this._popupService.close();
      }, this));
      $root.on('click', 'input[type=radio]', $.proxy(function (e) {
        var selectedAreaName = $(e.currentTarget).data('area');
        this._selectedTubeAreaCode = $(e.currentTarget).attr('id');
        this.$container.find('#fe-select-area').text(selectedAreaName);
        this.$container.find('#fe-select-line').text('노선선택');
        this._selectedTubeLineCode = null;
        this.$container.find('#fe-select-name').text('지하철 역명 선택');
        this._selectedTubeNameCode = null;
        this._popupService.close();
      }, this));
    }, this));
  },

  /**
   * @function
   * @desc 지하철 탭에서 노선 선택 시 actionsheet 로 선택 가능한 노선 표시
   */
  _onTubeLine: function () {
    if (!this._selectedTubeAreaCode) {
      this._popupService.openAlert('지역을 선택해 주세요.');
      return;
    }

    var list = Tw.POPUP_TPL.CUSTOMER_AGENTSEARCH_TUBE_LINE[this._selectedTubeAreaCode];
    if (!Tw.FormatHelper.isEmpty(this._selectedTubeLineCode)) { // 선택된 항목에 checked 추가
      list[0].list = _.map(list[0].list, $.proxy(function (item) {
          if (item['radio-attr'].indexOf('checked') !== -1 && !(item['radio-attr'].indexOf('id="' + this._selectedTubeLineCode) !== -1)) {
            item['radio-attr'] = item['radio-attr'].replace('checked', '');
          } else if (item['radio-attr'].indexOf('id="' + this._selectedTubeLineCode) !== -1) {
          item['radio-attr'] += ' checked';
        }
        return item;
      }, this));
    }

    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      data: list,
      btnfloating: { attr: 'type="button"', txt: Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(function ($root) {
      $root.on('click', '.btn-floating', $.proxy(function () {
        this._popupService.close();
      }, this));
      $root.on('click', 'input[type=radio]', $.proxy(function (e) {
        this.tubeNameList = []; // 지하철 역명 저장되는 배열
        var selectedLine = $(e.currentTarget).data('line');
        this.$container.find('#fe-select-line').text(selectedLine);
        this._selectedTubeLineCode = $(e.currentTarget).attr('id');
        this.$container.find('#fe-select-name').text('지하철 역명 선택');
        this._selectedTubeNameCode = null;
        $.proxy(this._getTubeNameList(), this ); // 노선 선택하면 API 호출하여 지하철 역명 리스트 생성
        this._popupService.close();
        // Tw.Logger.info('[라인 선택 후 지역 값 텍스트, 인코딩 전 : ]', this.$container.find('#fe-select-area').text().trim());
        // Tw.Logger.info('[라인 선택 후 호선값 텍스트, 인코딩 전 : ]', this.$container.find('#fe-select-line').text().trim());


      }, this));
    }, this));
  },

    /**
   * @function
   * @desc 지하철 탭에서 노선 선택 시 actionsheet 로 선택 가능한 노선 표시
   */
  _getTubeNameList: function () {

    // Tw.Logger.info('_getTubeNameList 함수에 들어왔는지 확인');
    // Tw.Logger.info('[리스트 만들기전 지역 값은? : ]', this._selectedTubeAreaCode);
    // Tw.Logger.info('[리스트 만들기전 호선값은 ? : ]', this._selectedTubeLineCode);
    // 지역 및 노선 값
    var tubeName = {
      // 'fe-select-area' : this.$container.find('#fe-select-area').text().trim(),
      'fe-select-area' : encodeURIComponent(this.$container.find('#fe-select-area').text().trim()),
      // 'fe-select-line' : this.$container.find('#fe-select-line').text().trim()
      'fe-select-line' : encodeURIComponent(this.$container.find('#fe-select-line').text().trim())
      // feSelectArea : this._selectedTubeAreaCode,
      // feSelectLine : this._selectedTubeLineCode
    };

    // Tw.Logger.info('[리스트 만들기전 파라미터 객체 값은 ? : ]', tubeName);

    // 지하철 목록 검색(역명))
    this._apiService.request(Tw.API_CMD.BFF_08_0078, tubeName)
    .done($.proxy(function (res) {
      // Tw.Logger.info('[res 값은 ? : ]', res);
      if (res.code === Tw.API_CODE.CODE_00) {
        // if(res.result === '0'){  0일때를 고려할지 생각중
          // this._popupService.close();
          // this._callback(); 혹시 다른거 처리하려면..
        // }
        var result = res.result;
        // Tw.Logger.info('[Subway Name API result]', result);

        var tubeNameformatList = [];
        for (var i = 0; i < result.length; i++) {
          var nameListObj = {
            'label-attr': 'id="' + ((i < 10) ? '0' + i : i) + '"',
            'radio-attr': 'id="'+ ((i < 10) ? '0' + i : i) + '" name="r2" data-name="' + result[i].subwStnNm + '"',
            'txt': result[i].subwStnNm
          };

          tubeNameformatList.push(nameListObj);
        }
        
        this.tubeNameList.push({ 'list': tubeNameformatList });

        // Tw.Logger.info('[tubeNameList list 생성 되었는지]', this.tubeNameList);

      }
      // Tw.Error(res.code, res.msg).pop();  // 에러 팝업을 띄울지 지울지 고민중
    }, this))
    .fail(function (err) {  // Fail에 대란 처리를 지울지 
      // Tw.Logger.info('[API 조회 실패?] ]');
      Tw.Error(err.code, err.msg).pop();
    });


  },


    /**
   * @function
   * @desc 지하철 탭에서 역명 선택 시 actionsheet 로 선택 가능한 역명 표시
   */
  _onTubeName: function () {
    if (!this._selectedTubeAreaCode || !this._selectedTubeLineCode) {
      this._popupService.openAlert('지역 및 노선을 선택해 주세요.');
      return;
    }

    // Tw.Logger.info('[현재 지하철 노선도]', this._selectedTubeNameCode);
    var list = this.tubeNameList;

    // Tw.Logger.info('[현재 지하철 노선도 list[0].list]', list[0].list);
    if (!Tw.FormatHelper.isEmpty(this._selectedTubeNameCode)) { // 선택된 항목에 checked 추가
      list[0].list = _.map(list[0].list, $.proxy(function (item) {
        if (item['radio-attr'].indexOf('checked') !== -1 && !(item['radio-attr'].indexOf('id="' + this._selectedTubeNameCode) !== -1)) {
          item['radio-attr'] = item['radio-attr'].replace('checked', '');
        } else if (item['radio-attr'].indexOf('id="' + this._selectedTubeNameCode) !== -1) {
          item['radio-attr'] += ' checked';
        }
        return item;
      }, this));
    }

    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      data: list,
      btnfloating: { attr: 'type="button"', txt: Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(function ($root) {
      $root.on('click', '.btn-floating', $.proxy(function () {
        this._popupService.close();
      }, this));
      $root.on('click', 'input[type=radio]', $.proxy(function (e) {
        var selectedName = $(e.currentTarget).data('name');
        this.$container.find('#fe-select-name').text(selectedName);
        this._selectedTubeNameCode = $(e.currentTarget).attr('id');
        // Tw.Logger.info('[선택된 지하철 이름]', this._selectedTubeNameCode);
        this.$btnSearchTube.removeAttr('disabled');
        this._popupService.close();
      }, this));
    }, this));
  },


  /**
   * @function
   * @desc 검색 버튼 클릭 시 검색결과 요청
   * @param  {Object} e - click event
   */
  _onSearchRequested: function (e, isOptions) {
    if (e && e.currentTarget.id.indexOf('tube') !== -1) {
      if (!this._selectedTubeAreaCode || !this._selectedTubeLineCode) {
        this._popupService.openAlert('지역/노선을 선택해 주세요.');
        return;
      }
    }
    // query param으로 필요한 정보를 보내면 검색관련 작업은 server rendering으로 이루어짐
    if(isOptions){  // 옵션 필터링으로 검색 시 
      this._historyService.replaceURL(this._getSearchUrl(e, false, null, true )); // 옵션 필터링으로 검색 시 
    } else {
      this._historyService.replaceURL(this._getSearchUrl(e, true));
    }
  },

  /**
   * @function
   * @desc 하단 page navigation 선택에 따른 처리
   * @param  {Object} e - click event
   */
  _onPaging: function (e) {
    var $target = $(e.currentTarget);
    if ($target.hasClass('active') || $target.hasClass('disabled')) {
      return;
    }

    var page = $target.data('page');
    if ($target.hasClass('fe-go-page')) {
      page = $target.text();
    }

    this._historyService.goLoad(this._getSearchUrl(null, false, page));
  },

  /**
   * @function
   * @desc 검색결과 server rendering 을 위한 query param 생성
   * @param  {Object} e - click event
   * @param  {Boolean} bySearchBtn - 검색 버튼을 통한 검색인지, pagination을 통한 검색인지
   * @param  {Number} page - bySearchBtn true 인 경우 targeting 할 page 번호
   */
  _getSearchUrl: function (e, bySearchBtn, page, isOptions) {  // bySearchBtn: true - 처음검색, false - page 검색
    var url = '/customer/agentsearch/search?type=';
    var hash = '#name';

    if (bySearchBtn) {  // 버튼 검색인 경우 - 기존 필터 적용 되지 않도록
      switch (e.currentTarget.id) {
        case 'fe-btn-search-name':
          url += 'name&keyword=' + this.$inputName.val();
          break;
        case 'fe-btn-search-addr':
          url += 'addr&keyword=' + this.$inputAddr.val();
          hash = '#addr';
          break;
        case 'fe-btn-search-tube':
          var area = this.$container.find('#fe-select-area').text().trim();
          var line = this.$container.find('#fe-select-line').text().trim();
          var tubeName = this.$container.find('#fe-select-name').text().trim();
          // url += 'tube&keyword=' + this.$inputTube.val() +
          url += 'tube&keyword=' + tubeName + ':' +  this._selectedTubeNameCode +
            '&area=' + area + ':' + this._selectedTubeAreaCode +
            '&line=' + line + ':' + this._selectedTubeLineCode;
          hash = '#tube';
          break;
        default:
          return;
      }
      url += '&storeType=' + 0;
      url += hash;
      return url;
    } else if (isOptions){  // 필터 검색인 경우
      switch (e.currentTarget.id) {
        case 'fe-btn-search-name':
          url += 'name&keyword=' + this.$inputName.val();
          break;
        case 'fe-btn-search-addr':
          url += 'addr&keyword=' + this.$inputAddr.val();
          hash = '#addr';
          break;
        case 'fe-btn-search-tube':
          var area = this.$container.find('#fe-select-area').text().trim();
          var line = this.$container.find('#fe-select-line').text().trim();
          var tubeName = this.$container.find('#fe-select-name').text().trim();
          url += 'tube&keyword=' + tubeName + ':' +  this._selectedTubeNameCode +
            '&area=' + area + ':' + this._selectedTubeAreaCode +
            '&line=' + line + ':' + this._selectedTubeLineCode;
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
          var areaTube = this.$container.find('#fe-select-area').text().trim();
          var lineTube = this.$container.find('#fe-select-line').text().trim();
          var tubeName = this.$container.find('#fe-select-name').text().trim();
          url += 'tube&keyword=' + tubeName + ':' +  this._selectedTubeNameCode +
            '&area=' + areaTube + ':' + this._selectedTubeAreaCode +
            '&line=' + lineTube + ':' + this._selectedTubeLineCode;
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

  /**
   * @function
   * @desc 지점 선택시 해당 지점 상세화면으로 이동
   * @param  {Object} e - click event
   */
  _onBranchDetail: function (e) {
    if (e.target.nodeName.toLowerCase() === 'a') {
      return;
    }

    var code = $(e.currentTarget).attr('value');

    this._historyService.goLoad('/customer/agentsearch/detail?code=' + code);
  },


  /**
   * @function
   * @desc 외부 링크 클릭 시 과금팝업 발생 후 동의 시 외부 브라우저로 이동
   * @param  {Object} e - click event
   */
  _onExternalLink: function (e) {
    var confirmed = false;
    Tw.CommonHelper.showDataCharge(
        function () {
          confirmed = true;
        },
        $.proxy(function () {
          if (confirmed) {
            var url = $(e.currentTarget).attr('href');
            Tw.CommonHelper.openUrlExternal(url);
          }
        }, this)
    );

    return false;
  },


/**
   * @function
   * @desc 필요한 경우 호출하여 과금 팝업 발생, 동의 시 콜백 실행
   * @param  {Function} onConfirm - 동의 시 실행할 callback
   */
  _showDataChargePopup: function (onConfirm) {
    this._popupService.openConfirm(
      Tw.POPUP_CONTENTS.NO_WIFI,
      null,
      $.proxy(function () {
        this._popupService.close();
        onConfirm();
      }, this)
    );
  },

  /**
   * @function
   * @desc 검색필드에 x버튼으로 입력 내용 삭제 시 필요한 처리
   * @param  {Object} e - click event
   */
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
