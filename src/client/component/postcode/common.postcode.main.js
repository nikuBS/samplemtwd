/**
 * FileName: common.postcode.main.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.12
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
  _init: function () {
    this._popupService.open({
      hbs: 'CO_UT_05_04_01'
    },
      $.proxy(this._onMainSearch, this),
      $.proxy(this._goDetail, this),
      'post0001',
      this.$target
    );
  },
  _onMainSearch: function ($layer) {
    this.$layer = $layer;

    this._initVariables('tab1');
    this._bindEvent();
  },
  _goDetail: function () {
    if (this.$isNext) {
      new Tw.CommonPostcodeDetail(this.$container, this.$target, this.$addressObject, this.$callback);
    }
  },
  _initVariables: function ($targetId) {
    this._selectedTabId = $targetId;
    this._page = 0;
    this.$addressObject = {};
    this.$isNext = false;
    this.$selectedTab = this.$layer.find('#' + $targetId + '-tab');
    this.$searchField = this.$selectedTab.find('.fe-input');
    this.$emptyBox = this.$selectedTab.find('.fe-empty-box');
    this.$resultBox = this.$selectedTab.find('.fe-result-box');
    this.$originalNode = this.$selectedTab.find('.fe-original');
    this.$moreBtn = this.$selectedTab.find('.fe-more-btn');
  },
  _bindEvent: function () {
    this.$layer.on('click', '.fe-tab-selector > li', $.proxy(this._changeTab, this));
    this.$layer.on('keyup', 'input[type="text"]', $.proxy(this._checkIsEnter, this));
    this.$layer.on('click', '.fe-search', $.proxy(this._search, this));
    this.$layer.on('click', '.fe-more-btn', $.proxy(this._getMoreList, this));
  },
  _changeTab: function (event) {
    var $targetId = $(event.currentTarget).attr('id');
    this._initVariables($targetId);
  },
  _checkIsEnter: function (event) {
    if (Tw.InputHelper.isEnter(event)) {
      this._search(event);
    }
  },
  _search: function(e) {
    this.$resultBox.find('.fe-clone').remove();
    this.$resultBox.hide();
    this.$emptyBox.hide();
    this._page = 0;

    this._getList(e);
  },
  _getList: function (e) {
    var $target = $(e.currentTarget);
    if (this._isValid()) {
      var $apiName = this._getApiName();
      var $reqData = this._makeRequestData($.trim(this.$searchField.val()));

      this._apiService.request($apiName, $reqData)
        .done($.proxy(this._success, this, $target))
        .fail($.proxy(this._fail, this, $target));
    }
  },
  _getMoreList: function (e) {
    this._page++;
    this._getList(e);
  },
  _isValid: function () {
    return this._validation.showAndHideErrorMsg(this.$searchField, this._validation.checkMoreLength(this.$searchField, 2));
  },
  _getApiName: function () {
    var $api = Tw.API_CMD.BFF_01_0008;
    if (this._selectedTabId === 'tab2') {
      $api = Tw.API_CMD.BFF_01_0010;
    }
    return $api;
  },
  _makeRequestData: function ($searchValue) {
    return {
      searchValue: encodeURI($searchValue),
      page: this._page,
      size: Tw.DEFAULT_LIST_COUNT
    };
  },
  _success: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setContents(res.result);
    } else {
      this._fail($target, res);
    }
  },
  _fail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
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
  _setList: function ($result, $content, $resultLength) {
    this._setMoreBtn($result);

    var $id = '';
    if (this._selectedTabId === 'tab1') {
      $id = 'stNmCd';
    } else {
      $id = 'dongCd';
    }

    for (var i = 0; i < $resultLength; i++) {
      var $cloneNode = this.$originalNode.clone();
      $cloneNode.addClass('fe-clone');
      $cloneNode.removeClass('none');

      var $btn = $cloneNode.find('button');
      var $text = $content[i].jusoMain;
      if (this._selectedTabId === 'tab1') {
        if (!Tw.FormatHelper.isEmpty($content[i].upMyunDongNm)) {
          $text += ' (' + $content[i].upMyunDongNm + ')';
        }
      } else {
        if (!Tw.FormatHelper.isEmpty($content[i].rdongNm)) {
          $text += ' (' + $content[i].rdongNm + ')';
        }
      }
      $cloneNode.attr({'id': $content[i][$id], 'data-origin': $content[i].jusoMain});
      $btn.text($text);

      $cloneNode.on('click', $.proxy(this._goNextPage, this));
      this.$resultBox.find('ul').append($cloneNode);
    }
  },
  _setMoreBtn: function ($result) {
    var _totalElements = $result.totalElements;
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

    this.$isNext = true;
    this.$addressObject = {
      tabId: this._selectedTabId,
      id: $target.attr('id'),
      text: $target.text(),
      originText: $target.attr('data-origin')
    };

    this._popupService.close();
  }
};