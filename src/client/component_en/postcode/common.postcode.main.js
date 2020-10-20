/**
 * @file common.postcode.main.js
 * @author Jayoon Kong
 * @since 2018.11.12
 * @desc 우편번호 조회 공통 컴포넌트, 풀팝업으로 되어 있음 (1/3)
 */

/**
 * @namespace
 * @desc 우편번호 1페이지 namespace
 * @param rootEl - 우편번호 호출한 부모페이지
 * @param $target - 우편번호 풀팝업 객체
 * @param callback - 우편번호 검색 완료 후 처리할 callback function
 */
Tw.CommonPostcodeMain = function (rootEl, $target, callback) {
  this.$container = rootEl;
  this.$target = $target;
  this.$callback = callback;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;

  this._init();
};

Tw.CommonPostcodeMain.prototype = {
  /**
   * @function
   * @desc 우편번호 호출이 되면 1페이지 팝업 load
   */
  _init: function () {
    this._popupService.open({
      hbs: 'CO_UT_05_04_01'
    },
      $.proxy(this._onMainSearch, this), // open callback
      null, // close callback
      'post0001',
      this.$target
    );
  },
  /**
   * @function
   * @desc 초기화 및 이벤트 바인딩
   * @param $layer - 팝업 객체
   */
  _onMainSearch: function ($layer) {
    this.$layer = $layer; // 현재 레이어

    this._initVariables('tab1'); // 도로명탭 변수 초기화
    this._bindEvent(); // 이벤트 바인딩
  },
  /**
   * @function
   * @desc 변수 초기화
   * @param $targetId
   */
  _initVariables: function ($targetId) {
    this._selectedTabId = $targetId;
    this._page = 0;
    this.$addressObject = {};
    this.$selectedTab = this.$layer.find('#' + $targetId + '-tab');
    this.$searchField = this.$selectedTab.find('.fe-input');
    this.$emptyBox = this.$selectedTab.find('.fe-empty-box');
    this.$resultBox = this.$selectedTab.find('.fe-result-box');
    this.$originalNode = this.$selectedTab.find('.fe-original');
    this.$moreBtn = this.$selectedTab.find('.fe-more-btn');
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$layer.on('click', '.fe-tab-selector > li', $.proxy(this._changeTab, this)); // 도로명 <-> 지번 tab change
    this.$layer.on('keyup', 'input[type="text"]', $.proxy(this._checkIsEnter, this)); // 키패드 '이동' 버튼 클릭에 대한 이벤트
    this.$layer.on('click', '.fe-search', $.proxy(this._search, this)); // 검색
    this.$layer.on('click', '.fe-more-btn', $.proxy(this._getMoreList, this)); // 20건 이상일 경우 하단 더 보기 버튼 동작
  },
  /**
   * @function
   * @desc change tab (도로명/지번)
   * @param event
   */
  _changeTab: function (event) {
    var $target = $(event.currentTarget);
    var $targetId = $target.attr('id');
    $target.find('a').attr('aria-selected', 'true');
    $target.siblings().find('a').attr('aria-selected', 'false');

    this._initVariables($targetId); // 변수 재초기화
  },
  /**
   * @function
   * @desc '이동' 및 엔터키 눌렀을 때 검색
   * @param event
   */
  _checkIsEnter: function (event) {
    if (Tw.InputHelper.isEnter(event)) {
      this._search(event);
    }
  },
  /**
   * @function
   * @desc search
   * @param e
   */
  _search: function(e) {
    this.$resultBox.find('.fe-clone').remove();
    this.$resultBox.hide();
    this.$emptyBox.hide();
    this._page = 0;

    this._getList(e); // 결과 리스트
  },
  /**
   * @function
   * @desc get list API 호출
   * @param e
   */
  _getList: function (e) {
    var $target = $(e.currentTarget);
    if (this._isValid()) { // 검색조건 2글자 이상 입력되면
      var $apiName = this._getApiName();
      var $reqData = this._makeRequestData($.trim(this.$searchField.val()));

      // 주소 찾기
      this._apiService.request($apiName, $reqData)
        .done($.proxy(this._success, this, $target))
        .fail($.proxy(this._fail, this, $target));
    }
  },
  /**
   * @function
   * @desc get more list (더보기 클릭 시)
   * @param e
   */
  _getMoreList: function (e) {
    this._page++;
    this._getList(e);
  },
  /**
   * @function
   * @desc 검색조건 2글자 체크
   * @returns {boolean|*}
   */
  _isValid: function () {
    return this._validation.showAndHideErrorMsg(this.$searchField, this._validation.checkMoreLength(this.$searchField, 2)); // 2글자 이상 입력해 주세요
  },
  /**
   * @function
   * @desc return API name
   * @returns {Tw.API_CMD.BFF_01_0008|{path, method}}
   */
  _getApiName: function () {
    var $api = Tw.API_CMD.BFF_01_0008; // 도로명 API
    if (this._selectedTabId === 'tab2') {
      $api = Tw.API_CMD.BFF_01_0010; // 지번 API
    }
    return $api;
  },
  /**
   * @function
   * @desc API 요청 파라미터 생성
   * @param $searchValue
   * @returns {{searchValue: string, page: number, size: number}}
   */
  _makeRequestData: function ($searchValue) { // 요청 파라미터 셋팅
    return {
      searchValue: encodeURI($searchValue),
      page: this._page,
      size: Tw.DEFAULT_LIST_COUNT
    };
  },
  /**
   * @function
   * @desc API 응답 처리
   * @param $target
   * @param res
   */
  _success: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setContents(res.result); // 내용 셋팅
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc API error 처리
   * @param $target
   * @param err
   */
  _fail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target); // 에러 공통 팝업
  },
  /**
   * @function
   * @desc result 처리
   * @param $result
   */
  _setContents: function ($result) {
    var $content = $result.content;
    var $resultLength = $content.length;
    var $isResult = $resultLength > 0;

    if ($isResult) {
      this.$resultBox.show();
      this.$emptyBox.hide();

      this._setList($result, $content, $resultLength);
    } else {
      this.$resultBox.hide();
      this.$emptyBox.show();
    }
  },
  /**
   * @function
   * @desc 결과 list 생성
   * @param $result
   * @param $content
   * @param $resultLength
   */
  _setList: function ($result, $content, $resultLength) {
    this._setMoreBtn($result); // 20건 이상일 경우 더보기 버튼 셋팅

    var $id = '';
    if (this._selectedTabId === 'tab1') {
      $id = 'stNmCd'; // 도로명 주소일 경우의 코드
    } else {
      $id = 'dongCd'; // 지번주소일 경우의 코드
    }

    for (var i = 0; i < $resultLength; i++) {
      var $cloneNode = this.$originalNode.clone(); // html에 있는 숨겨진 node 복사
      $cloneNode.addClass('fe-clone');
      $cloneNode.removeClass('none');

      var $btn = $cloneNode.find('button');
      var $text = $content[i].jusoMain;
      if (this._selectedTabId === 'tab1') {
        if (!Tw.FormatHelper.isEmpty($content[i].upMyunDongNm)) {
          $text += ' (' + $content[i].upMyunDongNm + ')'; // 동이름 셋팅 (도로명)
        }
      } else {
        if (!Tw.FormatHelper.isEmpty($content[i].rdongNm)) {
          $text += ' (' + $content[i].rdongNm + ')'; // 동이름 셋팅 (지번)
        }
      }
      $cloneNode.attr({'id': $content[i][$id], 'data-origin': $content[i].jusoMain});
      $btn.text($text);

      $cloneNode.on('click', $.proxy(this._goNextPage, this));
      this.$resultBox.find('ul').append($cloneNode); // 복사한 노드를 loop를 돌며 붙여넣기
    }
  },
  /**
   * @function
   * @desc 20개 이상 조회 시 더보기 버튼 생성
   * @param $result
   */
  _setMoreBtn: function ($result) {
    var _totalElements = $result.totalElements; // 전체 결과 갯수
    var _remainLength = _totalElements - ((this._page + 1) * Tw.DEFAULT_LIST_COUNT); // 전체갯수 - (페이지 * 20), 0페이지부터 시작

    this.$selectedTab.find('.fe-total').text(_totalElements);

    if (_remainLength > 0) { // 잔여갯수가 있을 경우 더보기 버튼 노출
      this.$moreBtn.show();
      this.$moreBtn.find('.fe-more-length').text(_remainLength);
    } else {
      this.$moreBtn.hide();
    }
  },
  /**
   * @function
   * @desc 다음 페이지로 이동
   * @param event
   */
  _goNextPage: function (event) {
    var $target = $(event.currentTarget);

    this.$addressObject = {
      tabId: this._selectedTabId,
      id: $target.attr('id'),
      text: $target.text(),
      originText: $target.attr('data-origin')
    }; // 다음 팝업에서 필요한 object

    new Tw.CommonPostcodeDetail(this.$container, this.$target, this.$addressObject, this.$callback); // 2페이지 팝업 load
  }
};