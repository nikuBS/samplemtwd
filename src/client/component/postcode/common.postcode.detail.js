/**
 * FileName: common.postcode.detail.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.12
 * Description: 우편번호 조회 컴포넌트, 풀팝업으로 되어 있음 (2/3)
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
  _init: function ($addressObject) {
    // 1페이지에서 다음 버튼 클릭 시 팝업 load
    this._popupService.open({
      hbs: 'CO_UT_05_04_02'
    },
      $.proxy(this._onDetailSearchEvent, this, $addressObject),
      null,
      'post0002',
      this.$target
    );
  },
  _onDetailSearchEvent: function ($addressObject, $layer) {
    this.$layer = $layer;

    this._setInitTab($addressObject);
    this._initVariables($addressObject.tabId);
    this._initData($addressObject);
    this._bindEvent();
  },
  _setInitTab: function ($addressObject) {
    var $selectedTarget = this.$layer.find('#' + $addressObject.tabId); // 첫 번째 팝업에서 선택된 정보 (도로명 or 지번)
    $selectedTarget.attr('aria-selected', 'true'); // 웹접근성

    // 지번주소인 경우 margin 조절
    if ($addressObject.tabId === 'tab2') {
      $selectedTarget.css('marginLeft', '0');
    }
    $selectedTarget.siblings().attr('aria-selected', 'false'); // 웹접근성
    $selectedTarget.siblings().find('a').addClass('disabled').addClass('none'); // 선택되지 않은 탭 hidden 처리
  },
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
  _initData: function ($addressObject) {
    this.$selectedAddress.attr({'id': $addressObject.id, 'data-origin': $addressObject.originText})
      .text($addressObject.text); // 첫 번째 팝업에서 조회된 정보 셋팅
  },
  _bindEvent: function () {
    this.$layer.on('keyup', '.fe-input-number', $.proxy(this._checkNumber, this));
    this.$layer.on('keyup', 'input[type="text"]', $.proxy(this._checkIsEnter, this));
    this.$layer.on('click', '.fe-search', $.proxy(this._search, this, null));
    this.$layer.on('click', '.fe-more-btn', $.proxy(this._getMoreList, this));
    this.$layer.on('click', '.fe-close-all', $.proxy(this._close, this));
  },
  _checkNumber: function (event) {
    this._inputHelper.inputNumberAndDashOnly(event.currentTarget); // 숫자와 -만 입력 가능
    this._checkIsEnter(event); // 키패드 이동 및 엔터 클릭 시 이벤트
  },
  _checkIsEnter: function (event) {
    if (Tw.InputHelper.isEnter(event)) {
      var $target = $(event.currentTarget);
      this._search($target.siblings('.fe-search'));
    }
  },
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
  _isValid: function ($target) {
    return this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 2));
  },
  _getList: function () {
    var $searchValue = this._getSearchValue();
    var $reqData = this._makeRequestData($searchValue);

    this._apiService.request(Tw.API_CMD.BFF_01_0011, $reqData)
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));
  },
  _getSearchValue: function () {
    var $searchValue = '';
    if (this.$searchTarget.hasClass('fe-search-number')) {
      $searchValue = $.trim(this.$searchNumberField.val());
    } else {
      $searchValue = $.trim(this.$searchNameField.val());
    }
    return $searchValue;
  },
  _getMoreList: function () {
    this._page++;
    this._getList();
  },
  _close: function () {
    this._popupService.closeAll();
  },
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
  _success: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setContents(res.result);
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop(null, this.$searchTarget);
  },
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
      if (this.$selectedTab.attr('id') === 'tab1-tab') {
        number = $content[i].bldTotNum;
      } else {
        number = $content[i].totHouse_numCtt;
      }
      $cloneNode.find('.fe-building').text(bldNm);
      $cloneNode.find('.fe-number').text(number);
      $cloneNode.find('.fe-zip').text($content[i].zip);

      $cloneNode.on('click', $.proxy(this._goNextPage, this));
      this.$resultBox.find('ul').append($cloneNode);
    }
  },
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