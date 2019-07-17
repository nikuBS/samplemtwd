/**
 * @file 행복커뮤니티 센터
 * @author 양정규
 * @since 2019-07-04
 */

/**
 * @class
 * @param  {Object} rootEl - 최상위 elem
 * @param  {String} params - query params
 */
Tw.CustomerAgentHappycom = function (rootEl, params) {

  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._options = {};
  this._newOptions = {};

  if (Tw.FormatHelper.isEmpty(this._historyService.getHash())){
    location.hash = '#easy';
  }
  this._hash = '';
  this._init();
  this._cacheElements(params);
  this._bindEvents();
  this.$inputSearch.trigger('keyup');
};

Tw.CustomerAgentHappycom.prototype = {

  /**
   * @function
   * @param params
   * @desc 최초 실행
   */
  _init: function(){
    this._initTab();

    // 탭 변경 시 설정부분
    window.onhashchange = $.proxy(function (e) {
      this._resetSearch(e);
    }, this);
  },

  /**
   * @function
   * @desc 현재 선택된 탭으로 설정해준다.
   */
  _initTab: function() {
    this._hash = this._historyService.getHash();
    // 변경 된 탭의 엘리먼트로 세팅한다.
    var _container = this.$container.find('#'+ this.$container.find('[href="'+this._hash+'"]').parent().attr('aria-controls'));
    this._cacheElementsTab(_container);

    // 변경 된 탭 선택 해준다.
    this.$container.find('li[role="tab"]').attr('aria-selected', false).find('[href="' + this._hash + '"]').parent().attr('aria-selected', true);

    // 버튼명 변경(스마트폰 교실 예약하기, 코딩교실 예약하기)
    var _url = 'http://www.sktacademy.co.kr/mobileclass/reserve/Reserve_W.asp'; // 스마트폰 교실 예약하기
    if (this._hash === '#easy') {
      this._reserveBtn.text(Tw.HAPPYCOM_STR.SMART_PHONE_BTN);
      this._reserveBtn.data('external',  _url);
    } else if (this._hash === '#exciting') {
      this._reserveBtn.text(Tw.HAPPYCOM_STR.CODING_BTN);
      this._reserveBtn.data('external',  _url+'?EDU_GU=3');
    }
  },

  /**
   * @function
   * @param container
   * @desc 변수 선언
   */
  _cacheElements: function (params) {
    // 검색 유형 정의
    this._searchType = {
      LOCATION:'LOCATION',  // 지역 검색
      SEARCH:'SEARCH',      // 검색 버튼
      FILTER:'FILTER'       // 필터 검색
    };

    this.selectedLocationCode = params.locationOrder;
    this._page = 1;

    delete params.searchText;
    delete params.locationOrder;
    delete params.currentPage;
    $.extend(true, this._options, params);  // 필터 검색 파라미터 세팅
  },

  /**
   * @function
   * @param container 현재 탭 엘리먼트
   * @desc 변수 선언
   */
  _cacheElementsTab: function (container) {
    this.$inputSearch = container.find('.fe-input-search'); /* 검색 인풋 박스 */
    this.$btnSearch = container.find('.fe-btn-search'); /* 검색 버튼 */
    this.$btnLocation = container.find('.fe-location-category'); /* 지역선택 */
    this._list = container.find('.fe-result-list'); // 결과 리스트
    this._btnMore = container.find('.fe-btn-more'); // 더보기 버튼
    this._reserveBtn = container.find('.fe-reserve'); // 예약하기 버튼
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvents: function () {
    this.$container.on('keyup', 'input', $.proxy(this._onInput, this));
    this.$container.on('click', '.cancel', $.proxy(this._onInput, this)); /* 글자를 하나씩 지우는게 아니라 삭제버튼으로 지웠을때도 검색버튼 비활성화 처리 */
    this.$container.on('click', '.fe-btn-search', $.proxy(this._onSearchRequested, this));  /* 검색 버튼 눌렀을때의 처리 */
    this.$container.on('click', '.fe-branch-detail', $.proxy(this._onBranchDetail, this));  /* 매장 리스트 중 하나를 클릭 했을때의 처리 */
    this.$container.on('click', '.fe-location-category', $.proxy(this._onLocationCategory, this));  /* 지역 선택 액션시트 팝업 */
    this.$container.find('.fe-select-filter').click(_.debounce($.proxy(this._openFilterPopup, this), 300));  /* 필터링 부분 이벤트 바인딩 */
    this.$container.on('click', '.fe-btn-more', _.debounce($.proxy(this._onMoreView, this)));  /* 더보기 클릭 */
    this.$container.on('click', '[data-external]', $.proxy(this._onClickCharge, this));  /* 외부 URL 새창(과금팝업 노출 후) */
  },


  /**
   * @function
   * @desc 사용자가 필터 클릭 시
   * @param {Event} e 클릭 이벤트 객체
   */
  _openFilterPopup: function() {
    this._popupService.open(
      {
        hbs: 'CS_17_01_L01',
        layer: true
      },
      $.proxy(this._handleOpenSelectFilterPopup, this)
    );

  },  // end of _openFilterPopup


 /**
   * @function
   * @desc 필터 변경 팝업 오픈 시 팝업에 이벤트 바인딩
   * @param {$object} $layer 팝업 레이어 jquery 객체
   * @private
   */
  _handleOpenSelectFilterPopup: function($layer) {
    // 파라미터의 선택된 필터값을 새로운 옵션값에 설정해준다.(팝업에서 필터 선택 시 기존값과 비교하기 위함이다.)
    $.extend(true, this._newOptions, this._options);

    // 파라미터의 필터값들을 체크 해준다.
    for (var key in this._options) {
      $layer.find('input[type="checkbox"][value=' + key + ']').click();
    }

    // 이벤트 바인딩
    $layer.on('click', '.bt-red1', $.proxy(this._handleSelectFilters, this, $layer));
    $layer.on('click', '.resetbtn', $.proxy(this._handleResetFilters, this, $layer));
    $layer.on('click', 'input[type="checkbox"]', $.proxy(this._onCategoryChanged, this));
  },


  /**
   * @function
   * @desc 필터 팝업에서 적용하기 버튼 클릭 시 필터 적용
   * @param {$object} $layer 필터 변경 팝업 레이어 jquery 객체
   */
  _handleSelectFilters: function() {

    if (_.isEqual(this._options, this._newOptions)) {
      this._popupService.close();
      return;
    }

    this._options = this._newOptions;

    this._historyService.goLoad(this._getSearchUrl(this._searchType.FILTER));
  },


  /**
   * @function
   * @desc 필터 선택 초기화 버튼 클릭 시 선택된 필터 지움
   * @param {$object} $layer 필터 변경 팝업 레이어 jquery 객체
   */
  _handleResetFilters: function($layer) {
    var selectedFilters = $layer.find('li[aria-checked="true"]');
    selectedFilters.attr('aria-checked', false).removeClass('checked');
    selectedFilters.find('input').removeAttr('checked');

    this._newOptions = {};
  },

  /**
   * @function
   * @desc TpremiumStore, 스마트폰 기초 과정등 옵션 값 변경 시 처리
   * @param  {Object} e - click event
   */
  _onCategoryChanged: function (e) {
    if (!!$(e.currentTarget).attr('checked')) {
      this._newOptions[e.currentTarget.value] = 'Y';
    } else {
      delete this._newOptions[e.currentTarget.value];
    }
  },


  /**
   * @function
   * @desc 검색어 입력에 따른 이벤트 처리(검색 버튼 활성/비활성 처리)
   * @param  {Object} e - keyup event
   */
  _onInput: function (e) {
    var text = e.currentTarget.value.trim();
    var enable = Tw.FormatHelper.isEmpty(text) ? false : true;

    if (enable) {
      this.$btnSearch.removeAttr('disabled');
    } else {
      this.$btnSearch.attr('disabled', 'disabled');
    }   
  },


  /**
   * @function
   * @desc 지역선택 시 actionsheet로 옵션 표기해줌
   */
  _onLocationCategory: function () {
    var list = Tw.POPUP_TPL.CUSTOMER_AGENTSEARCH_LOCATION;

    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      data: list,
      btnfloating: { attr: 'type="button"', txt: Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(function ($root) {
      /* 팝업 오픈 시 이전에 선택된 지역 체크 */
      $root.find('input#' + this.selectedLocationCode).attr('checked', true);
      
      $root.on('click', '.btn-floating', $.proxy(function () {
        this._popupService.close();
      }, this));
      $root.on('click', 'input[type=radio]', $.proxy(function (e) {
        this.$btnLocation.text($(e.currentTarget).data('location')); /* templete.type.js에서 사용자 정의 속성 */
        this.selectedLocationCode = $(e.currentTarget).attr('id');

        this._historyService.goLoad(this._getSearchUrl(this._searchType.LOCATION));
      }, this));
    }, this));
  },


  /**
   * @function
   * @desc 검색 버튼 클릭 시 검색결과 요청
   * @param  {Object} e - click event
   */
  _onSearchRequested: function () {
    /* url 조합해서 조회 - 페이지 리로딩 */
    this._historyService.replaceURL(this._getSearchUrl(this._searchType.SEARCH));
  },

  /**
   * @function
   * @desc 검색결과 server rendering 을 위한 query param 생성
   * @param  {Object} e - click event
   * @param  {Boolean} bySearchBtn - 검색 버튼을 통한 검색인지, pagination을 통한 검색인지
   * @param  {Number} page - bySearchBtn true 인 경우 targeting 할 page 번호
   */
  _getSearchUrl: function (searchType) {
    var url = '/customer/agentsearch/happycom?keyword=' + (searchType === this._searchType.LOCATION ? '':this.$inputSearch.val());
    var locationOrderName = this.$btnLocation.text().trim();
    url += '&locationOrder=' + (this.selectedLocationCode ? this.selectedLocationCode : '1') + '&locationOrderName=' + locationOrderName;

    if (searchType === this._searchType.FILTER) {
      var _options = '';
      for(var key in this._options){
        if(_options !== ''){
          _options += '::';
        }
        _options += key;
      }
      if (_options !== ''){
        url += '&options=' + _options;
      }
    }
    url += this._hash;
    return url;
  },

  /**
   * @function
   * @desc 지점 선택시 해당 지점 상세화면으로 이동
   * @param  {Object} e - click event
   */
  _onBranchDetail: function (e) {
    if (e.target.nodeName.toLowerCase() === 'a') { /* 지점 선택이지만 전화 걸기 부분이라서 아무런 동작 하지 않음 */
      return;
    }

    var code = $(e.currentTarget).attr('value');
    /* expzone 요청 플래그 */
    this._historyService.goLoad('/customer/agentsearch/detail?code=' + code + '&isHappy=' + true);  /* expzone에서 요청 플래그 */
  },

  /**
   * @function
   * @desc 탭 변경
   */
  _resetSearch: function (e){
    // 필터 검색 등 다른 팝업에서 해쉬 변경일 때는 무시하며, 현재 3개 탭 변경일 때만 리다이렉트 시킨다.
    var _oldHash = e.oldURL.substring(e.oldURL.indexOf('#')+1);
    if (['easy','exciting','gallery'].indexOf(_oldHash) === -1) {
      return;
    }
    // 탭 변경시 검색조건(필터 포함) 초기화 하여 디폴트(서울 지역) 으로 조회 되도록 리다이렉트
    this._historyService.replaceURL('/customer/agentsearch/happycom' + this._historyService.getHash());
    // 해쉬 체인지 인경우 _initTab 를 다시 해줘야 정상동작한다.
    this._initTab();

    // 로직 변경으로 아래 내용은 사용안하지만.. 혹시 몰라서 둠.
    /*this._hash = this._historyService.getHash();
    // 변경 된 탭의 엘리먼트로 세팅한다.
    var _container = this.$container.find('#'+ this.$container.find('[href="'+this._hash+'"]').parent().attr('aria-controls'));
    this._cacheElementsTab(_container);

    // 지역검색 초기화
    var _data = Tw.POPUP_TPL.CUSTOMER_AGENTSEARCH_LOCATION[0].list[0];
    this.$btnLocation.text(_data.txt);
    this.selectedLocationCode = 1;

    this.$inputSearch.val('').trigger('keyup'); // 검색값 초기화

    // 필터값 초기화
    this.$container.find('.fe-select-filter').removeClass('date-in').find('span').text(Tw.COMMON_STRING.ALL); // 필터값 초기화
    this._options = {};

    // 검색 결과 값 초기화
    this.$container.find('.fe-no-contents').removeClass('none');
    this._list.empty();
    this._btnMore.addClass('none');
    this.$container.find('.fe-total-count').text(0);

    this._page = 1; // 페이지 카운트 초기화

    // 버튼명 변경(스마트폰 교실 예약하기, 코딩교실 예약하기)
    var _url = 'http://www.sktacademy.co.kr/mobileclass/reserve/Reserve_W.asp'; // 스마트폰 교실 예약하기
    if (this._hash === '#easy') {
      this._reserveBtn.text(Tw.HAPPYCOM_STR.SMART_PHONE_BTN);
      this._reserveBtn.data('external',  _url);
    } else if (this._hash === '#exciting') {
      this._reserveBtn.text(Tw.HAPPYCOM_STR.CODING_BTN);
      this._reserveBtn.data('external',  _url+'?EDU_GU=3');
    }*/
  },

  /**
   * @function
   * @desc 더보기
   */
  _onMoreView: function () {
    // 파라미터 생성
    var params = {
      searchText: encodeURIComponent(this.$inputSearch.val()),
      currentPage: this._page++,
      locationOrder: this.selectedLocationCode
    };

    $.extend(params, this._options);

    // [행복커뮤니티 센터 찾기] API 호출
    this._apiService
      .request(Tw.API_CMD.BFF_08_0079, params)
      .done($.proxy(this._successRegionHappyList, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @param resp
   * @desc 더보기 _onMoreView 호출 성공 콜백
   */
  _successRegionHappyList: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      this._onFail(resp);
      return;
    }

    this._renderList(resp);
  },

  /**
   * @function
   * @desc 상품 리스트 렌더
   * @param {String} category
   * @param {JSON} res
   */
  _renderList: function (res) {
    var source = $('#tpl_search_result_item').html();
    var template = Handlebars.compile(source);
    var output = template({
      list: res.result.regionInfoList
    });
    this._list.append(output);

    if (res.result.lastPageType === 'N') {
      this._btnMore.removeClass('none');
    } else {
      this._btnMore.addClass('none');
    }
  },

  /**
   * @function
   * @desc 과금 팝업 오픈 후 외부 브라우저 랜딩 처리
   * @param $event 이베트 객체
   * @return {void}
   * @private
   */
  _onClickCharge: function ($event) {
    var url = $($event.currentTarget).data('external');

    if (Tw.FormatHelper.isEmpty(url)) {
      return;
    }

    // app 이 아니면 알러트 제외
    if (!Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.openUrlExternal(url);
    } else {
      Tw.CommonHelper.showDataCharge($.proxy(function(){
        Tw.CommonHelper.openUrlExternal(url);
      },this));
    }
  },

  /**
   * @function
   * @desc API Fail
   * @param {JSON} err
   */
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};
