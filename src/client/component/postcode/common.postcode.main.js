/**
 * FileName: common.postcode.main.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.12
 */

Tw.CommonPostcodeMain = function (rootEl) {
  this.$container = rootEl;

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
      'post0001'
    );
  },
  _onMainSearch: function ($layer) {
    this.$layer = $layer;

    this._initVariables('tab1');
    this._bindEvent();
  },
  _goDetail: function () {
    if (this.$isNext) {
      new Tw.CommonPostcodeDetail(this.$container, {
        tabId: this._selectedTabId,
        id: this._addressId,
        text: this._addressText
      });
    }
  },
  _initVariables: function ($targetId) {
    this._selectedTabId = $targetId;
    this._page = 0;
    this._addressId = null;
    this._addressText = null;
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
    this.$layer.on('click', '.fe-search', $.proxy(this._search, this));
    this.$layer.on('click', '.fe-more-btn', $.proxy(this._getMoreList, this));
  },
  _changeTab: function (event) {
    var $targetId = $(event.currentTarget).attr('id');
    this._initVariables($targetId);
  },
  _search: function() {
    this.$resultBox.find('.fe-clone').remove();
    this.$resultBox.hide();
    this.$emptyBox.hide();
    this._page = 0;

    this._getList();
  },
  _getList: function () {
    var $searchValue = $.trim(this.$searchField.val());
    if (this._isValid($searchValue)) {
      var $apiName = this._getApiName();
      var $reqData = this._makeRequestData($searchValue);

      this._apiService.request($apiName, $reqData)
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    }
  },
  _getMoreList: function () {
    this._page++;
    this._getList();
  },
  _isValid: function ($searchValue) {
    return this._validation.checkMoreLength($searchValue, 2, Tw.ALERT_MSG_COMMON.ALERT_MORE_TWO);
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
  _success: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setContents(res.result);
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
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
      $cloneNode.attr('id', $content[i][$id]);
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
    this._addressId = $target.attr('id');
    this._addressText = $target.text();

    this._popupService.close();
  }
};