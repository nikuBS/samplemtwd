/**
 * @file common.postcode.detail.js
 * @author Jayoon Kong
 * @since 2018.11.12
 * @desc 우편번호 조회 컴포넌트, 풀팝업으로 되어 있음 (2/3)
 */

/**
 * @namespace
 * @desc 우편번호 2페이지 namespace
 * @param $container - 우편번호 호출한 부모페이지
 * @param $target - 우편번호 풀팝업 객체
 * @param $addressObject - 1페이지에서 넘어온 데이터
 * @param $callback - 우편번호 검색 완료 후 처리할 callback function
 */
Tw.CommonPostcodeDetail = function ($container, $target, $addressObject, $callback) {
  this.$container = $container;
  this.$target = $target;
  this.$callback = $callback;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._inputHelper = Tw.InputHelper;
  this._validation = Tw.ValidationHelper;

  this._init($addressObject);
};

Tw.CommonPostcodeDetail.prototype = {
  /**
   * @function
   * @desc 1페이지에서 다음 버튼 클릭 시 팝업 load
   * @param $addressObject
   */
  _init: function ($addressObject) {
    this._popupService.open({
      hbs: 'CO_UT_05_04_02'
    },
      $.proxy(this._onDetailSearchEvent, this, $addressObject),
      null,
      'post0002',
      this.$target
    );
  },
  /**
   * @function
   * @desc search event binding
   * @param $addressObject - 1페이지에서 넘어온 데이터
   * @param $layer - 우편번호 2페이지 객체
   */
  _onDetailSearchEvent: function ($addressObject, $layer) {
    this.$layer = $layer;

    this._setInitTab($addressObject);
    this._initVariables($addressObject.tabId);
    this._initData($addressObject);
    this._bindEvent();
  },
  /**
   * @function
   * @desc tab 처리
   * @param $addressObject - 1페이지에서 넘어온 데이터
   */
  _setInitTab: function ($addressObject) {
    var $selectedTarget = this.$layer.find('#' + $addressObject.tabId); // 첫 번째 팝업에서 선택된 정보 (도로명 or 지번)
    $selectedTarget.attr({ 'aria-selected': 'true', 'aria-hidden': 'false' }); // 웹접근성
    $selectedTarget.siblings().addClass('none').attr({ 'aria-selected': 'false', 'aria-hidden': 'true' }); // 웹접근성
  },
  /**
   * @function
   * @desc 변수 초기화
   * @param $targetId
   */
  _initVariables: function ($targetId) {
    this._selectedTabId = $targetId;
    this._page = 0;
    this.$selectedAddressObject = {};
    this.$selectedTab = this.$layer.find('#' + $targetId + '-tab');
    this.$selectedAddress = this.$selectedTab.find('.fe-selected-address');
    this.$searchNumberField = this.$selectedTab.find('.fe-input-number');
    this.$searchNameField = this.$selectedTab.find('.fe-input-name');
    this.$emptyBox = this.$selectedTab.find('.fe-empty-box');
    this.$resultBox = this.$selectedTab.find('.fe-result-box');
    this.$originalNode = this.$selectedTab.find('.fe-original');
    this.$moreBtn = this.$selectedTab.find('.fe-more-btn');
    this._postType = this.$selectedTab.attr('data-type');
  },
  /**
   * @function
   * @desc 1페이지에서 조회된 데이터 셋팅
   * @param $addressObject - 1페이지에서 넘어온 데이터
   */
  _initData: function ($addressObject) {
    this.$selectedAddress.attr({'id': $addressObject.id, 'data-origin': $addressObject.originText})
      .text($addressObject.text);
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$layer.on('keyup', '.fe-input-number', $.proxy(this._checkNumber, this));
    this.$layer.on('keyup', 'input[type="text"]', $.proxy(this._checkIsEnter, this));
    this.$layer.on('click', '.fe-search', $.proxy(this._search, this, null));
    this.$layer.on('click', '.fe-more-btn', $.proxy(this._getMoreList, this));
    this.$layer.on('click', '.fe-close-all', $.proxy(this._close, this));
  },
  /**
   * @function
   * @desc input event
   * @param event
   */
  _checkNumber: function (event) {
    this._inputHelper.inputNumberAndDashOnly(event.currentTarget); // 숫자와 -만 입력 가능
    this._checkIsEnter(event); // 키패드 이동 및 엔터 클릭 시 이벤트
  },
  /**
   * @function
   * @desc 키패드 이동 및 엔터 클릭 시 검색
   * @param event
   */
  _checkIsEnter: function (event) {
    if (Tw.InputHelper.isEnter(event)) {
      var $target = $(event.currentTarget);
      this._search($target.siblings('.fe-search'));
    }
  },
  /**
   * @function
   * @desc 검색
   * @param $target
   * @param event
   */
  _search: function($target, event) {
    this.$resultBox.find('.fe-clone').remove();
    this.$resultBox.hide();
    this.$emptyBox.hide();
    this.$searchTarget = $target || $(event.currentTarget);
    this._page = 0;

    var $searchField = this.$searchTarget.siblings('.fe-input');
    if (this._isValid($searchField)) {
      this._getList();
    }
  },
  /**
   * @function
   * @desc 2자리 이상 입력 여부 체크
   * @param $target
   * @returns {boolean|*}
   */
  _isValid: function ($target) {
    return this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 2));
  },
  /**
   * @function
   * @desc 우편번호 검색 API 호출
   */
  _getList: function () {
    var $searchValue = this._getSearchValue();
    var $reqData = this._makeRequestData($searchValue);

    this._apiService.request(Tw.API_CMD.BFF_01_0011, $reqData)
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));
  },
  /**
   * @function
   * @desc 검색조건 셋팅
   * @returns {string}
   */
  _getSearchValue: function () {
    var $searchValue = '';
    if (this.$searchTarget.hasClass('fe-search-number')) {
      $searchValue = $.trim(this.$searchNumberField.val());
    } else {
      $searchValue = $.trim(this.$searchNameField.val());
    }
    return $searchValue;
  },
  /**
   * @function
   * @desc 더보기
   */
  _getMoreList: function () {
    this._page++;
    this._getList();
  },
  /**
   * @function
   * @desc 우편번호 조회 all close
   */
  _close: function () {
    this._popupService.closeAll();
  },
  /**
   * @function
   * @desc 요청 파라미터 생성
   * @param $searchValue
   * @returns {{postType: *, page: number, size: number}}
   */
  _makeRequestData: function ($searchValue) {
    var reqData = {
      postType: this._postType,
      page: this._page,
      size: Tw.DEFAULT_LIST_COUNT
    };
    if (this._selectedTabId === 'tab1') {
      reqData.stNmCd = this.$selectedAddress.attr('id');
      if (this.$searchTarget.hasClass('fe-search-number')) { // 번지로 검색
        if ($searchValue.indexOf('-') !== -1) { // 번지가 **-** 형태일 경우 '-'로 나누기
          reqData.bldMainNum = $searchValue.split('-')[0]; // 본번지
          reqData.bldSubNum = $searchValue.split('-')[1]; // 부번지
        } else {
          reqData.bldMainNum = $searchValue;
        }
      } else {
        reqData.bldNm = encodeURI($searchValue); // 건물명으로 검색
      }
    } else {
      if (this.$searchTarget.hasClass('fe-search-number')) {
        reqData.searchKey = 'KEY';
        reqData.mainHouseNumCtt = $searchValue;
        reqData.subHouseNumCtt = '';
      } else {
        reqData.searchKey = 'BiLDING';
        reqData.bldNm = encodeURI($searchValue);
      }
      reqData.ldongCd = this.$selectedAddress.attr('id');
    }
    return reqData;
  },
  /**
   * @function
   * @desc API 조회 응답 처리
   * @param res
   */
  _success: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setContents(res.result);
    } else {
      this._fail(res);
    }
  },
  /**
   * @function
   * @desc API error 처리
   * @param err
   */
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop(null, this.$searchTarget);
  },
  /**
   * @function
   * @desc set result contents
   * @param $result
   */
  _setContents: function ($result) {
    var $content = $result.bldgAddress.content;
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
   * @desc 검색결과 list 생성
   * @param $result
   * @param $content
   * @param $resultLength
   */
  _setList: function ($result, $content, $resultLength) {
    this._setMoreBtn($result);

    for (var i = 0; i < $resultLength; i++) {
      var $cloneNode = this.$originalNode.clone();
      $cloneNode.addClass('fe-clone');
      $cloneNode.removeClass('none');

      $cloneNode.attr('data-bld-cd', $content[i].bldCd);

      var bldNm = $content[i].bldNm;
      if ($content[i].bldNm.indexOf('N/A') !== -1) { // 결과가 N/A로 내려올 경우 텍스트 변경 (건물명 없음)
        bldNm = '(' + Tw.POSTCODE_MESSAGE.NONE + ')';
      }

      var number = '';
      if (this.$selectedTab.attr('id') === 'tab1-tab') { // 도로명일 경우
        number = $content[i].bldTotNum;
      } else { // 지번일 경우
        number = $content[i].totHouse_numCtt;
      }
      $cloneNode.find('.fe-building').text(bldNm);
      $cloneNode.find('.fe-number').text(number);
      $cloneNode.find('.fe-zip').text($content[i].zip);

      $cloneNode.on('click', $.proxy(this._goNextPage, this));
      this.$resultBox.find('ul').append($cloneNode);
    }
  },
  /**
   * @function
   * @desc 결과 갯수에 따라 더보기 버튼 생성
   * @param $result
   */
  _setMoreBtn: function ($result) {
    var _totalElements = $result.bldgAddress.totalElements;
    var _remainLength = _totalElements - ((this._page + 1) * Tw.DEFAULT_LIST_COUNT);

    this.$selectedTab.find('.fe-total').text(_totalElements);

    if (_remainLength > 0) {
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

    this.$selectedAddressObject = {
      'tabId': this._selectedTabId,
      'originText': $.trim(this.$selectedAddress.attr('data-origin')),
      'main': $.trim(this.$selectedAddress.text()),
      'number': $.trim($target.find('.fe-number').text()),
      'building': $.trim($target.find('.fe-building').text()),
      'zip': $.trim($target.find('.fe-zip').text()),
      'ldongCd': this.$selectedAddress.attr('id'),
      'bldCd': $target.attr('data-bld-cd')
    };

    new Tw.CommonPostcodeLast(this.$container, this.$target, this.$selectedAddressObject, this.$callback); // 마지막 페이지 팝업 load
  }
};