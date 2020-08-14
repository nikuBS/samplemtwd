/**
 * @file 지점/대리점 검색 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-16
 * @edit 2020-06-12 양정규 OP002-8862
 */
/**
 * @constructor
 * @param {Object} rootEl - 최상위 elem
 * @param {String} params - isAcceptAge(Y: 14세 이상, N)
 * @param {Object} svcInfo
 */
Tw.CustomerAgentsearch = function (rootEl, isAcceptAge, svcInfo) {
  this.$container = rootEl;
  this._isAcceptAge = isAcceptAge === 'Y';
  this._svcInfo = JSON.parse(svcInfo);
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._query = Tw.UrlHelper.getQueryParams();
  this.customerAgentsearchMap = undefined;
  this.customerAgentsearchFilter = undefined;
  this.customerAgentsearchComponent = new Tw.CustomerAgentsearchComponent(this._svcInfo);

  this._init();
};

Tw.LIST_TYPE = {
  MAP: 'MAP',
  LIST: 'LIST'
};

Tw.CustomerAgentsearch.prototype = {

  /**
   * @function
   * @desc endsWith polyfill
   */
  _makeEndsWith: function () {
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

  /**
   * @function
   * @desc 현재 해쉬의 탭을 선택해준다. (새로고침하는 경우 탭 선택이 풀려서 해줘야 함)
   */
  _selectTab: function () {
    this.$tabs.find('a[href="' + this._historyService.getHash() + '"]') // 현재 해쉬(#) 이름 의 a tag
      .attr('aria-selected', true)  // 선택 되도록 selected
      .parent().attr('aria-selected', true) // 부모(li) 도 선택되도록 selected
      .siblings().attr('aria-selected', false)  // 나머지 친구 노드들은 false
      .find('a').attr('aria-selected', false); // 해당 친구 노드들의 a tag 들도 false
  },

  /**
   * @function
   * @desc 지하철 탭의 셀렉트 박스들. 3개중 1개라도 선택이 안되어 있다면 "검색" 버튼 비 활성화.
   */
  _onSearchButtonDisabled: function () {
    var r = _.some(this.$btnsSelect, function (o) {
      return Tw.FormatHelper.isEmpty($(o).attr('id'));
    });
    $('#fe-btn-search-tube').attr('disabled', !!r);
  },

  /**
   * @function
   * @desc 초기 설정
   * @private
   */
  _init: function () {
    this._makeEndsWith();
    this._cacheElements();
    this._bindEvents();

    // 순서 중요!! _cacheElements() 함수 다음에 호출되어야 함!!
    this.customerAgentsearchComponent.registerHelper();
    this._selectTab();
    this._onSearchButtonDisabled();
    this.customerAgentsearchMap = new Tw.CustomerAgentsearchMap({ // 나와 가까운 지점 지도 생성
      customerAgentsearch: this
    });
    this.customerAgentsearchFilter = new Tw.CustomerAgentsearchFilter({
      customerAgentsearch: this
    });
  },

  /**
   * @function
   * @desc DOM caching
   */
  _cacheElements: function () {
    this.tubeNameList = []; // 지하철 역명 저장되는 배열
    this._searchedItemTemplate = Handlebars.compile($('#tpl_search_result_item').html());
    this.isKeywordSearch = false; // 맵 형식 조회인지 유무
    this._reqParam = undefined;

    this.$tabs = this.$container.find('.fe-tabs');  // 탭 부모 노드
    this.$btnsSelect = this.$container.find('.fe-subway button'); // 탭(지하철) > 셀렉트 박스들
    // 탭(지하철) > 셀렉트 박스
    this.$btnSelectArea = this.$container.find('.fe-select-area'); // 지역 선택
    this.$btnSelectLine = this.$container.find('.fe-select-line'); // 노선 선택
    this.$btnSelectName = this.$container.find('.fe-select-name'); // 역명 선택

    this.$keyword = this.$container.find('.fe-keyword'); // 검색 필드
    this.$search = this.$container.find('.fe-search'); // 검색 버튼
    this.$noData = this.$container.find('.fe-nodata'); // 검색 결과 없을때 영역
    this.$mapListArea = this.$container.find('.fe-map-list-area'); // 지도형식(지도+리스트) 영역
    this.$mapArea = this.$container.find('#fe-map-area'); // 지도 영역
    this.$resultListByMap = this.$mapListArea.find('.fe-result-list'); // 지점/대리점 리스트(지도+리스트)
    this.$normalListArea = this.$container.find('.fe-normal-list-area');  // 기본 리스트 형식 영역
    this.$resultListByList = this.$normalListArea.find('.fe-result-list'); // 지점/ 대리점 리스트(리스트)
    this.$btnMore = this.$normalListArea.find('.fe-btn-more'); // 더보기 버튼
    this.$resultCount = this.$container.find('#fe-result-count'); // 검색한 매장 리스트 갯수
    this.$loading = this.$container.find('.fe-loading');  // 로딩
    this.$toggleButton = this.$container.find('.fe-toggle-button');  // 리스트 보기/지도 보기 토글버튼
    this.$listTitle = this.$container.find('.fe-list-title');  // 'T shop' 매장 리스트 출력시 노출되는 타이틀
    this.$locationAlert = this.$container.find('.fe-location-alert');  // 위치정보 미동의 시 보이는 알럿 영역
    this.$filterArea = this.$container.find('.fe-filter-area');  // 필터 영역
    this.$listArea = this.$container.find('.fe-list-area');  // 리스트 바인딩 될 영역
    this.$noShop = this.$container.find('.fe-no-shop');  // 반경 거리 이내에 매장 없을 때 보이는 영역
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvents: function () {
    this.$keyword.on('keydown', $.proxy(this._getSearch, this)); // 검색어 input 엔터 시 검색
    this.$search.on('click', $.proxy(this._getSearch, this)); // 검색 버튼 클릭

    this.$tabs.on('click', 'li', $.proxy(this._onReset, this)); // 탭 클릭
    this.$btnsSelect.on('click', $.proxy(this._onTube, this));  // 지하철 탭의 셀렉트 박스들 클릭시 액션시트 띄움
    // 상세 페이지 이동
    this.$container.on('click', '.fe-branch-detail', $.proxy(this.customerAgentsearchComponent.onBranchDetail, this.customerAgentsearchComponent));
    // 티샵 예약하기 외부 URL 이동
    this.$container.on('click', '.fe-booking', $.proxy(this.customerAgentsearchComponent.goBooking, this.customerAgentsearchComponent));
    // this.$container.on('click', '.fe-booking', $.proxy(this._goBooking, this));  // 티샵 예약하기 외부 URL 이동
    this.$container.on('click', '[data-go-url]', $.proxy(this.customerAgentsearchComponent.goLoad, this.customerAgentsearchComponent)); // 페이지 이동
    this.$container.on('click', 'a[target="_blank"]', $.proxy(this._onExternalLink, this));
    this._createObserver();
  },

  layout: function (options) {
    options = $.extend({
      res: {
        totalCount: 0,
        regionInfoList: []
      },
      isDeleteAppend: true
    },options);

    var none = 'none';
    var map = 'MAP', list = 'LIST';
    var $locationAlert = this.$locationAlert,
      $filterArea = this.$filterArea,
      $noData = this.$noData,
      $loading = this.$loading,
      $mapListArea = this.$mapListArea,
      $listArea = this.$listArea,
      $noShop = this.$noShop,
      $toggleButton = this.$toggleButton,
      $listTitle = this.$listTitle,
      $normalListArea = this.$normalListArea;
    // 모두 숨김
    var selectors = [$locationAlert, $filterArea, $noData, $loading, $mapListArea, $listArea, $noShop, $normalListArea, $listTitle, $toggleButton];
    selectors.forEach(function (selector){
      selector.addClass(none);
    });

    var showArea = function (selectors1) {
      selectors1.forEach(function (selector){
        selector.removeClass(none);
      });
    };
    var setMoreView = function (list, renderType) {
      var renderList = renderType === map ? this.renderMapTypeList : this.renderNormalTypeList;
      this._moreViewSvc.init({
        list: list,
        btnMore: this.$container.find('.fe-btn-more'),
        callBack: $.proxy(renderList, this),
        isOnMoreView: true
      });
    }.bind(this);

    var listRender = function (options, renderType) {
      var _list = options.res.regionInfoList;
      if (Tw.FormatHelper.isEmpty(_list)){
        return;
      }
      if (options.isDeleteAppend) {
        this.$resultListByMap.empty();
        this.$resultListByList.empty();
      }
      // 지도 타입인 경우만 body 태그에 o2o-body 클래스를 추가한다. 하단 매장 영역 고정을 위해.
      $('body').toggleClass('o2o-body', renderType === map);
      if (renderType === map || options.isAllList) {
        setMoreView(_list, renderType);
        return;
      }
      var renderList = renderType === map ? this.renderMapTypeList : this.renderNormalTypeList;
      renderList.call(this, {
        list: _list,
        isDeleteAppend: options.isDeleteAppend
      });
    }.bind(this);

    switch (options.type) {
      // P.9: 위치동의 > 지도형식 (카운트영역, 지도, 리스트)
      case 1:
        this.resultContents(options.res.totalCount);
        showArea([$filterArea, $mapListArea, $toggleButton, $listArea]);
        listRender(options, map);
        break;
      // P.10: 위치 미동의 (위치정보 이용동의 배너(만 14세 이상인경우만 노출), 티샵예약가능 매장들)
      case 2:
        if (this._isAcceptAge && !this.customerAgentsearchComponent.hasStorage()) {
          showArea([$locationAlert]);
        }
        showArea([$normalListArea]);
        listRender(options, list);
        break;
      // P.11: 위치 동의 > 필터 > 로딩중 (로딩중)
      case 3:
        showArea([$loading]);
        break;
      /*
        P.12: 위치 동의 > 필터 > 매장 0건일때 > 3km안에는 없지만 전체매장 중에는 있을때
        P.16: 키워드 검색 > 검색결과 없을때
        (카운트영역, 에러배너영역, 리스트 영역)
        */
      case 4:
        this.resultContents(options.res.totalCount, options.error);
        showArea([$filterArea, $noData, $normalListArea]);
        listRender(options, list);
        break;
      // P.12: 위치 동의 > 필터 > 매장 0건일때 > 전체매장(800km 이내)에도 없을때 (카운트영역, 에러배너영역)
      case 5:
        this.resultContents(0, options.error);
        showArea([$filterArea, $noData]);
        break;
      // P.13: 위치 동의 > 500m, 1km내에 매장 없을때 (카운트영역, 지도영역, 리스트 형식 에러 영역)
      case 6:
        this.resultContents(0, options.error);
        showArea([$filterArea, $mapListArea, $toggleButton, $noShop]);
        break;
      // P.15: 키워드 검색 (카운트 영역(리스트/지도 버튼 미노출), 리스트 영역)
      case 7:
        showArea([$filterArea, $normalListArea]);
        this.resultContents(options.res.totalCount);
        listRender(options, list);
        break;
      //  P.13: 위치 동의 > 3km안에 매장 없을때 (SB 에는 카운터 영역 있지만 조회 데이터가 없기 때문에 비노출이 맞는거 같음)
      // (에러배너영역, 리스트 영역)
      case 8:
        showArea([$noData, $normalListArea]);
        this.resultContents(0, options.error);
        listRender(options, list);
        break;
    }

  },

  /**
   * @function
   * @desc 지점/대리점 검색
   * @param{event} e
   */
  _getSearch: function (e) {
    var $target = $(e.currentTarget);
    var param = {
      storeType: this.getStoreTypeByQuery(),
      currentPage: 1
    };
    var saveParam = {};
    var isSendOk = false;
    // 지하철 탭이 아닌경우(매장명/주소 탭)
    if (this._getType() !== 'tube') {
      var isInput = $target[0].tagName === 'INPUT';
      var keyword = '';
      if (isInput) {
        if (!Tw.InputHelper.isEnter(e)) {
          return;
        }
        keyword = $target.val();
      } else {
        keyword = $target.prev().find('.fe-keyword').val();
      }
      keyword = String(keyword).trim();
      if (keyword === '') {
        return;
      }
      saveParam.searchText = encodeURIComponent(keyword);
      isSendOk = true;
    } else {
      $.extend(saveParam, {
        searchAreaNm: encodeURIComponent(this.$btnSelectArea.text().trim()),
        searchLineNm: encodeURIComponent(this.$btnSelectLine.text().trim()),
        searchText: encodeURIComponent(this.$btnSelectName.text().trim())
      });
      isSendOk = true;
    }
    // 전송 요청 일때
    if (isSendOk) {
      // 보내기전 리스트 클리어
      // this.$resultListByList.empty();
      this._reqParam = saveParam;
      this.customerAgentsearchFilter.clearItems();
      this._getSearchRequest($.extend(param, saveParam));  // 지점/대리점 조회 요청
    }
  },

  /**
   * @function
   * @param{number?} i 탭(지하철) 셀렉트 박스 의 인덱스 순서
   * @desc 파라미터 i 보다 나중 select 들을 초기화 해준다.
   */
  _resetTubeSelect: function (i) {
    // 탭(지하철) 셀렉트 박스 초기화
    _.each(this.$btnsSelect, function (o, idx) {
      if (i === undefined || i < idx) {
        var $obj = $(o);
        $obj.attr('id', '').data('list', '').text($obj.attr('title'));
      }
    });
  },

  /**
   * @function
   * @desc 탭 변경 일때 새로고침
   */
  _onReset: function () {
    // 즉시 리로딩 하면 hash 값 변경되기 전에 로딩되어 약간의 시간을 줌.
    setTimeout(function (){
      this._historyService.reload();
    }.bind(this), 50);

    /*this.$keyword.val(''); // 검색어 클리어
    // 탭(지하철) 셀렉트 박스 초기화
    this._resetTubeSelect();
    this.$resultListByList.empty(); // 리스트 클리어
    this.$resultCount.text('0'); // 검색 갯수 초기화*/
  },

  /**
   * @function
   * @param{Event} e
   * @desc 지하철 탭에서 selectbox 선택 시 actionsheet로 옵션 표기해줌
   */
  _onTube: function (e) {
    var $target = $(e.currentTarget);
    // 셀렉트박스 유형별 list
    var list = {
      area: Tw.POPUP_TPL.CUSTOMER_AGENTSEARCH_TUBE_AREA,  // 지역
      line: Tw.POPUP_TPL.CUSTOMER_AGENTSEARCH_TUBE_LINE[this.$btnSelectArea.attr('id')] // 노선
    };
    list = list[$target.data('type')] || $target.data('list');  // 지역 및 노선이 아니라면, "지하철 역명"

    // type 이 area(지역선택) 이 아닌경우, 상위 셀렉트 박스를 선택하지 않았을 경우 알럿 노출
    if (Tw.FormatHelper.isEmpty(list)) {
      return this._popupService.openAlert($target.data('error-msg'));
    }

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: list,
        btnfloating: {'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
      }, $.proxy(this._selectPopupCallback, this, $target),
      null,
      null,
      $target);
  },

  /**
   * @function
   * @desc Observer 생성. 옵저버로 엘리먼트의 "속성"을 등록 해 놓으면, 속성이 변경될 때마다 해당 옵저버가 실행된다.
   */
  _createObserver: function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var observer = new MutationObserver($.proxy(this._startObserver, this));
    this.$btnsSelect.each(function (n, e) {
      observer.observe(e, {
        attributes: true, // 속성 감지 true 설정
        attributeFilter: ['id'] // 속성중 "id" 가 변경이 되면 옵저버 수행
      });
    });
  },

  /**
   * @function
   * @param mutations
   * @desc 등록된 옵저버의 속성값이 변경될 시 로직 수행.(버튼 활성화 여부:_onSearchButtonDisabled())
   */
  _startObserver: function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'attributes') {
        this._onSearchButtonDisabled();
      }
    }.bind(this));
  },

  /**
   * @function
   * @desc actionsheet event binding
   * @param{jQuery} $target - 클릭한 버튼 객체
   * @param{jQuery} $layer - actionsheet 객체
   */
  _selectPopupCallback: function ($target, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성
    var id = $target.attr('id');
    // 선택한 셀렉트 박스 체크
    if (!Tw.FormatHelper.isEmpty(id)) {
      $layer.find('input#' + id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
  },

  /**
   * @function
   * @desc 선택한 값 셋팅
   * @param $target
   * @param{Event} event
   */
  _setSelectedValue: function ($target, event) {
    this._resetTubeSelect(this.$btnsSelect.index($target));

    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.parents('label').text());

    // 탭(지하철) > "노선 선택" 인 경우
    if ($target.hasClass('fe-select-line')) {
      this._getTubeNameList();
    }
    this._popupService.close();
  },

  /**
   * @function
   * @desc 지하철 탭에서 노선 선택 시 BFF 호출하여 수신한 노선정보를 "역명" 버튼 data 속성에 저장
   */
  _getTubeNameList: function () {
    var tubeName = {
      'fe-select-area': encodeURIComponent(this.$btnSelectArea.text().trim()),
      'fe-select-line': encodeURIComponent(this.$btnSelectLine.text().trim())
    };

    // 지하철 목록 검색(역명))
    this.customerAgentsearchComponent.request(Tw.API_CMD.BFF_08_0078, tubeName)
      .done($.proxy(function (res) {
          this.$btnSelectName.data('list', [{
            'list': _.map(res.result, function (o, idx) {
              var id = Tw.FormatHelper.leadingZeros(idx, 2);
              return {
                'label-attr': 'id="' + id + '"',
                'radio-attr': 'id="' + id + '" name="r2"',
                'txt': o.subwStnNm
              };
            })
          }]);
        }, this)
      );
  },

  /**
   * @function
   * @desc 현재 해쉬 이름 리턴 ('name', 'addr', 'tube')
   */
  _getType: function () {
    return this._historyService.getHash().replace('#', '') || 'name';
  },

  /**
   * @function
   * @returns {number}
   * @desc 매장유형 리턴. 0:전체, 1:지점, 2: 대리점
   */
  getStoreTypeByQuery : function () {
    var type = {
      branch: 1,  // 지점
      agent : 2 // 대리점
    };
    return type[this._query.storeType] || 0; // 없으면 전체:0
  },

  /**
   * @function
   * @desc 지점/대리점 조회 요청
   * @param{JSON} param
   */
  _getSearchRequest: function (param) {
    param = $.extend( {
      currentPage: 1
    }, param);
    // "더보기" 버튼 data 속성 "param" 비어 있으면 더보기 이벤트 바인딩
    if (Tw.FormatHelper.isEmpty(this.$btnMore.data('param'))) {
      this.$btnMore.off('click').on('click', $.proxy(this._onMoreView, this));
    }
    // "더보기" 에서 사용 하기 위해 요청 전에 파라미터를 저장 해 놓는다.
    this.$btnMore.data('param', param);
    var getApiName = {
      'name': Tw.API_CMD.BFF_08_0004,
      'addr': Tw.API_CMD.BFF_08_0005,
      'tube': Tw.API_CMD.BFF_08_0006
    };
    var apiName = getApiName[this._getType() || 'name'];
    this.customerAgentsearchComponent.request(apiName, param).done(function (resp) {
      this.$keyword.blur(); // 인풋 포커스 아웃을 해줘야 단말기의 "키보드" 가 아래로 내려감.
      this.isKeywordSearch = true;
      if (Tw.FormatHelper.isEmpty(resp.result.regionInfoList)) {
        this.searchTShop(function (res){
          this.layout({
            type: 4,
            error: 'error2',
            res: res.result,
            isDeleteAppend: res.isDeleteAppend
          });
        }.bind(this));
        return;
      }
      this.layout({
        type: 7,
        res: resp.result,
        isDeleteAppend: param.currentPage <= 1
      });
      this._showHideMoreBtn(resp);
    }.bind(this));
  },

  _moreView: function (param) {
    // "더보기" 버튼 data 속성 "param" 비어 있으면 더보기 이벤트 바인딩
    if (Tw.FormatHelper.isEmpty(this.$btnMore.data('param'))) {
      this.$btnMore.off('click').on('click', $.proxy(this._onMoreView, this));
    }
    // "더보기" 에서 사용 하기 위해 요청 전에 파라미터를 저장 해 놓는다.
    this.$btnMore.data('param', param);
  },

  filterSearchRequest: function (param) {
    this._getSearchRequest($.extend(param, this._reqParam));
  },

  _showHideMoreBtn: function (resp) {
    if (resp.result.lastPageType === 'N') {
      this.$btnMore.removeClass('none');
    } else {
      this.$btnMore.addClass('none').data('param', '');
    }
  },

  /**
   * @function
   * @param res
   * @desc 지도형식(지도+리스트)
   */
  renderMapTypeList: function (res) {
    if (Tw.FormatHelper.isEmpty(res)) {
      return;
    }
    this.renderList({
      listType: Tw.LIST_TYPE.MAP,
      list: res.list
    });
  },

  renderList: function (options) {
    if (!options || Tw.FormatHelper.isEmpty(options.list) || !options.listType) {
      return;
    }

    this.customerAgentsearchComponent.ableTasks(options.list);
    var $resultList = options.listType === Tw.LIST_TYPE.MAP ? this.$resultListByMap : this.$resultListByList;
    $resultList.append(this._searchedItemTemplate({
      list: options.list
    }));
  },

  /**
   * @function
   * @param res
   * @desc 리스트 형식
   */
  renderNormalTypeList: function (res) {
    if (Tw.FormatHelper.isEmpty(res)) {
      return;
    }
    this.renderList({
      listType: Tw.LIST_TYPE.LIST,
      list: res.list
    });
  },

  /**
   * @function
   * @param{Event} e
   * @desc 더보기
   */
  _onMoreView: function (e) {
    var param = $(e.currentTarget).data('param');
    param.currentPage++;
    this._getSearchRequest(param);
  },

  resultContents: function (cnt, err) {
    if (!Tw.FormatHelper.isEmpty(cnt)) {
      this.$resultCount.text(cnt);
    }
    if (err) {
      var $contents = this.$noData.find('.fe-err-msg');
      $contents.html($contents.data(err));
    }
  },

  searchTShop: function (callback) {
    var self = this;
    var onMoreView = function (e) {
      var param = $(e.currentTarget).data('param');
      param.currentPage++;
      self.customerAgentsearchComponent.request(Tw.API_CMD.BFF_08_0004, param).done(function (res){
        self._showHideMoreBtn(res);
        if (callback){
          res.isDeleteAppend = false;
          callback(res);
        }
      });
    };

    // "더보기" 버튼 data 속성 "param" 비어 있으면 더보기 이벤트 바인딩
    if (Tw.FormatHelper.isEmpty(this.$btnMore.data('param'))) {
      this.$btnMore.off('click').on('click', onMoreView);
    }

    var param = {
      storeType: '0',
      // todo JK : param.tSharpYn 값이 없어서 임시로 param.test 사용.
      tSharpYn: 'Y',
      // test: 'Y',
      // searchText : encodeURIComponent('강남'), // 티샵 예약가능 매장이 없어서. 임시로 을지로 조회로 대체
      currentPage: 1
    };
    // "더보기" 에서 사용 하기 위해 요청 전에 파라미터를 저장 해 놓는다.
    this.$btnMore.data('param', param);
    this.customerAgentsearchComponent.request(Tw.API_CMD.BFF_08_0004, param).done(function (res){
      this._showHideMoreBtn(res);
      if (callback){
        res.isDeleteAppend = true;
        callback(res);
      }
      this.$listTitle.removeClass('none');
    }.bind(this));
  },

  /**
   * @function
   * @desc 외부 링크 클릭 시 과금팝업 발생 후 동의 시 외부 브라우저로 이동
   * @param  {Object} e - click event
   */
  _onExternalLink: function (e) {
    if(Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.showDataCharge(
        $.proxy(function () {
          var url = $(e.currentTarget).attr('href');
          Tw.CommonHelper.openUrlExternal(url);
        }, this)
      );

    } else {
      var url = $(e.currentTarget).attr('href');
      Tw.CommonHelper.openUrlExternal(url);
    }
    return false;
  }
};

