/**
 * FileName: customer.event.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.17
 */

Tw.CustomerEvent = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(this.$container);

  this._init();
  this._bindEvent();
};

Tw.CustomerEvent.prototype = {
  _init: function () {
    this._initVariables();

    var $hash = window.location.hash;
    if ($hash === '') {
      this._history.goHash('#main');
    } else {
      this._hashInit($hash.replace('#', ''));
    }
  },
  _initVariables: function () {
    this.$tabLinker = this.$container.find('.fe-tab-menu');
    this._selectedTabId = 'main';
    this.$selector = this.$container.find('#' + this._selectedTabId + '-tab');
    this.$contentList = this.$selector.find('.fe-content-list');
    this.$standardNode = this.$contentList.find('li.fe-first:first');
    this.$moreBtn = this.$selector.find('.fe-more-btn');
    this._defaultCnt = Tw.DEFAULT_LIST_COUNT;
    this._ingPage = 0;
    this._oldPage = 0;
    this._winPage = 0;
    this._ingTotalPage = this.$contentList.data('page');
    this._oldTotalPage = 0;
    this._winTotalPage = 0;
    this._ingTotalCnt = this.$contentList.data('cnt');
    this._oldTotalCnt = 0;
    this._winTotalCnt = 0;
  },
  _bindEvent: function () {
    this.$tabLinker.on('click', 'li', $.proxy(this._onTabChange, this));
    this.$contentList.on('click', 'li', $.proxy(this._getDetailEvent, this));
  },
  _onTabChange: function (event) {
    var $target = $(event.currentTarget);
    this._hashInit($target.attr('id'));

    this._history.goHash('#' + this._selectedTabId);
  },
  _hashInit: function (id) {
    this._selectedTabId = id;
    this.$selector = this.$container.find('#' + this._selectedTabId + '-tab');
    this.$contentList = this.$selector.find('.fe-content-list');
    this.$standardNode = this.$contentList.find('li.fe-first:first');
    this.$moreBtn = this.$selector.find('.fe-more-btn');

    this._setAriaSelected(id);
    this._bindChangedEvent();
    this._getApiName();
    this._setList();
  },
  _setAriaSelected: function (id) {
    var $target = this.$container.find('#' + id);
    $target.attr('aria-selected', 'true');
    $target.siblings().attr('aria-selected', 'false');
  },
  _getApiName: function () {
    if (this._selectedTabId === 'main') {
      this._apiName = Tw.API_CMD.BFF_09_0001;
    } else if (this._selectedTabId === 'old') {
      this._apiName = Tw.API_CMD.BFF_09_0003;
    } else {
      this._apiName = Tw.API_CMD.BFF_09_0004;
    }
  },
  _bindChangedEvent: function () {
    this.$contentList.on('click', 'li', $.proxy(this._getDetailEvent, this));
    this.$selector.on('click', '.fe-more-btn', $.proxy(this._setMoreData, this));
  },
  _setList: function () {
    if (!this.$standardNode.hasClass('fe-done')) {
      this._requestForList();
    }
  },
  _setMoreData: function () {
    if (this._page < this._totalPage) {
      this._page++;
      this._requestForList();
    }
  },
  _requestForList: function () {
    this._apiService.request(this._apiName, { svcDvcClCd: 'M', page: this._oldPage, size: this._defaultCnt })
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._getFail, this));
  },
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setData(res.result.content);
    } else {
      this._getFail(res);
    }
  },
  _getFail: function (err) {
    this._popupService.openAlert(err.code + ' ' + err.msg);
  },
  _setData: function ($content) {
    if (!this.$standardNode.hasClass('fe-done')) {
      this.$standardNode.addClass('fe-done');
    }

    for (var i = 0; i < $content.length; i++) {
      var $liNode = this.$standardNode.clone();
      $liNode.removeClass('none');
      $liNode.attr('id', $content[i].prNum);
      $liNode.find('.fe-event-title').text($content[i].prNm);
      $liNode.find('.fe-event-day').text(Tw.DateHelper.getShortDateNoDot($content[i].prStaDt) + ' ~ ' +
        Tw.DateHelper.getShortDateNoDot($content[i].prEndDt)
      );
      $liNode.find('.fe-dday').text(Tw.DateHelper.getNewRemainDate($content[i].prEndDt) - 1);

      var $typeNode = $liNode.find('.fe-event-type');
      if ($content[i].prTypCd === 'E') {
        $typeNode.text(Tw.EVENT_TYPE[$content[i].prTypCd]);
        $typeNode.show();
      } else {
        $typeNode.hide();
      }

      if (this._selectedTabId === 'main') {
        $liNode.find('.fe-event-img img').attr({
          'src': $content[i].filePath,
          'alt': $content[i].prCtt
        });
      } else if (this._selectedTabId === 'win') {
        $liNode.find('.fe-event-win-date').text(Tw.DateHelper.getShortDateNoDot($content[i].winDt));
      }
      $liNode.on('click', $.proxy(this._getDetailEvent, this, $liNode.attr('id')));
      this.$contentList.append($liNode);
    }
    var $pageObj = this._getPageObj();
    this._setHiddenMoreBtn($pageObj);
  },
  _getPageObj: function () {
    var obj = {};
    if (this._selectedTabId === 'main') {
      obj.page = this._ingPage;
      obj.totalPage = this._ingTotalPage;
      obj.totalCnt = this._ingTotalCnt;
    } else if (this._selectedTabId === 'old') {
      obj.page = this._oldPage;
      obj.totalPage = this._oldTotalPage;
      obj.totalCnt = this._oldTotalCnt;
    } else {
      obj.page = this._winPage;
      obj.totalPage = this._winTotalPage;
      obj.totalCnt = this._winTotalCnt;
    }
    return obj;
  },
  _showMoreData: function (idx, target) {
    var $target = $(target);
    if ($target.hasClass('none')) {
      if (idx < this._page * this._defaultCnt) {
        $target.removeClass('none');
      }
    }
    this._setHiddenMoreBtn();
  },
  _setHiddenMoreBtn: function ($pageObj) {
    if ($pageObj.page === $pageObj.totalPage) {
      this.$moreBtn.hide();
    } else {
      this.$moreBtn.find('.fe-more-length').text('(' + ($pageObj.totalCnt - ($pageObj.page * this._defaultCnt)) + ')');
      this.$moreBtn.show();
    }
  },
  _getDetailEvent: function (id) {
    if (typeof(id) !== 'string') {
      var event = id;
      id = $(event.currentTarget).attr('id');
    }
    var urlName = this._getDetailUrlName(id);
    this._history.goLoad(urlName);
  },
  _getDetailUrlName: function ($id) {
    var urlName = '/customer/event';
    if (this._selectedTabId === 'win') {
      urlName += '/detail/win';
    } else {
      urlName += '/detail';
    }
    urlName += '?prNum=' + $id;
    return urlName;
  }
};

