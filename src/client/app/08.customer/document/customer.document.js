/**
 * @file customer.document.js
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.10.16
 */

Tw.CustomerDocument = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(this.$container);

  this._init();
  this._bindEvent();
};

Tw.CustomerDocument.prototype = {
  _init: function () {
    this._paramList = ['ctgClId', 'svcClId', 'opClId', 'custClId', 'visitrClId'];
    this.$selectList = this.$container.find('.select-list');
    this.$docInfo = this.$container.find('.required-doc-param');
    this.$docResult = this.$container.find('.required-doc-result');

    var defaultTab = 'tab1';
    if (Tw.UrlHelper.getQueryParams().type === 'etc') {
      defaultTab = 'tab2';
    }

    this._initVariables(defaultTab);
    this._showAndHide();
  },
  _bindEvent: function () {
    this.$tabLinker = this.$container.find('.tab-linker');
    this.$tabLinker.on('click', 'li', $.proxy(this._onTabChange, this));
    this.$container.on('click', '.disabled', $.proxy(this._offClickEvent, this));
  },
  _onTabChange: function (event) {
    // tab change event
    var $target = $(event.currentTarget);
    $target.find('a').attr('aria-selected', 'true');
    $target.siblings().find('a').attr('aria-selected', 'false');

    this._initVariables($target.attr('id'));
    this._initList();
  },
  _offClickEvent: function (event) {
    // 하위 요소 선택 시 상위 메뉴 click off
    var $target = $(event.currentTarget);
    $target.removeClass('on');
  },
  _initList: function () {
    var $target = this.$selector.find('.acco-list:first');
    $target.addClass('on').siblings().removeClass('on');
    $target.find('.question').show();
    $target.find('.result-txt').empty().hide();
    $target.find('.checked').removeClass('checked');

    this._resetChildren($target, 1);
  },
  _initVariables: function ($id) {
    this._selectedTabId = $id;
    this.$selector = this.$container.find('#' + this._selectedTabId + '-tab');
    this.$firstNode = this.$selector.find('.fe-standard-node');
    this.$selectList = this.$selector.find('.select-list:first');
    this.nextIndex = 1;
    this._reqData = {
      sysCd: this.$selector.data('value')
    };
    this._setChangeEvent(this.$selectList);
  },
  _showAndHide: function () {
    this.$docInfo.show();
    this.$docResult.hide();
  },
  _setTitle: function ($parentTarget, $target) {
    // 각 영역의 타이틀을 동적으로 셋팅
    var $titleNode = $parentTarget.find('.acco-title');
    $titleNode.find('.question').hide();
    $titleNode.find('.result-txt').text($target.attr('title')).show();
    $titleNode.attr('id', $target.attr('id'));
  },
  _resetChildren: function ($parentTarget, index) {
    // 상위 선택 요소에 따라 하위 영역 데이터 변경
    $parentTarget.siblings().each($.proxy(this._resetEachSelector, this, index));

    this._resetOption(index);
    this._resetReqData(index);
    this._showAndHide();
  },
  _resetEachSelector: function (index, idx, target) {
    var $target = $(target);
    if ($target.data('index') > index) {
      $target.addClass('off');
      $target.find('button').addClass('none-event');
      $target.find('.select-list').empty();
      $target.find('.question').show();
      $target.find('.result-txt').empty().hide();

      this._initDisabled($target);
    }
  },
  _resetOption: function (index) {
    if (index < this.nextIndex) {
      this.nextIndex = 1; // 3번에 데이터가 없는 경우 4번을 바로 호출해야 하는 경우가 있음
    }
  },
  _resetReqData: function (index) {
    for (var i = index; i < this._paramList.length; i++) {
      this._makeRequestData(i, '');
    }
  },
  _initDisabled: function ($target) {
    if ($target.hasClass('disabled')) {
      $target.find('.question').css('color', 'black');
      $target.removeClass('disabled');
    }
  },
  _setData: function ($parentTarget, $nextTarget, $currentTarget, isEmpty) {
    this._closeList($parentTarget);

    var idx = $parentTarget.data('index');
    var id = this.$selector.find('.acco-list[data-index="' + idx + '"] .acco-title').attr('id');

    // 바로 아래 영역에 데이터가 없을 경우 그 다음으로 넘김
    if (isEmpty) {
      id = 'NONE';
    }
    idx = idx - 1;

    if (!isNaN(idx)) {
      this._makeRequestData(idx, id);
      this._apiService.request(Tw.API_CMD.BFF_08_0054, this._reqData)
        .done($.proxy(this._getSuccess, this, $nextTarget, $currentTarget))
        .fail($.proxy(this._getFail, this, $currentTarget));
    }
  },
  _makeRequestData: function (idx, id) {
    // API 호출 시 카테고리 영역만 변경 - 미리 초기화된 array에서 값을 가져와서 요청 파라미터 생성
    if (this._paramList[idx] !== undefined) {
      this._reqData[this._paramList[idx]] = id;
    }
  },
  _getSuccess: function ($target, $currentTarget, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setNextList($target, res.result);
    } else {
      this._getFail($currentTarget, res);
    }
  },
  _getFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  _setNextList: function ($target, result) {
    for(var key in result) {
      var list = result[key];
      if (Tw.FormatHelper.isEmpty(list)) {
        this._setCallOption($target);
      } else {
        if (key === 'reqDocList') {
          this._setDocumentList(list);
        } else {
          this._setListData($target, list);
        }
      }
    }
  },
  _setCallOption: function ($target) {
    this._setTargetDisabled($target);
    this.nextIndex = 1;
    this._setData($target, $target.next(), $target, true);
  },
  _setTargetDisabled: function ($target) {
    $target.addClass('off');
    $target.find('button').addClass('none-event');
  },
  _setListData: function ($target, list) {
    for (var i = 0; i < list.length; i++) {
      var $liNode = this.$firstNode.clone();
      $liNode.find('input').attr({
        'id': list[i].ncssDocGuidClId,
        'title': list[i].ncssDocGuidClNm,
        'name': 'radio' + $target.data('index')
      });
      $liNode.find('input').after(list[i].ncssDocGuidClNm);
      $liNode.removeClass('fe-standard-node none');
      $target.find('.select-list').append($liNode);
    }
    this._setChangeEvent($target.find('.select-list'));
    this._openList($target);
  },
  _setDocumentList: function (list) {
    this.$docResult.find('.fe-doc-result').empty();
    for (var i = 0; i < list.length; i++) {
      this.$docResult.find('.fe-doc-result').append(list[i].ncssDocCtt);
    }
    this.$docResult.show();
    this.$docInfo.hide();
  },
  _setChangeEvent: function ($target) {
    $target.off('click');
    $target.on('click', 'li', $.proxy(this._onRadioButtonClick, this));
  },
  _onRadioButtonClick: function (event) {
    var $currentTarget = $(event.currentTarget);
    var $target = $currentTarget.find('input');
    var $parentTarget = $target.parents('.acco-list');
    var idx = $parentTarget.data('index');
    var $nextTarget = $parentTarget.next();

    $currentTarget.addClass('checked').attr('aria-checked', 'true');
    $currentTarget.siblings().removeClass('checked').attr('aria-checked', 'false');

    this._setTitle($parentTarget, $target); // 타이틀 셋팅
    this._resetChildren($parentTarget, idx); // 상위 요소 변경 시 하위 영역 리셋
    this._setData($parentTarget, $nextTarget, $currentTarget); // 데이터 셋팅
  },
  _closeList: function ($target) {
    $target.removeClass('on');
  },
  _openList: function ($target) {
    $target.removeClass('off').addClass('on');
    $target.find('button').removeClass('none-event');
  }
};