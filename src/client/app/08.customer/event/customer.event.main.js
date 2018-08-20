/**
 * FileName: customer.event.main.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.17
 */

Tw.CustomerEventMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  // this._history.init('hash');

  this._init();
  this._bindEvent();
};

Tw.CustomerEventMain.prototype = {
  _init: function () {
    this._initVariables();
  },
  _initVariables: function () {
    this.$selectedTabId = 'tab1';
    this.$selector = this.$container.find('#tab1-tab');
    this.$contentList = this.$selector.find('.fe-content-list');
    this.$standardNode = this.$contentList.find('li.fe-first');
    this.$moreBtn = this.$selector.find('.fe-more-btn');
    this._defaultCnt = Tw.DEFAULT_LIST_COUNT;
    this._apiName = Tw.API_CMD.BFF_09_0001;
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
    this.$container.on('click', '.fe-tab-menu li', $.proxy(this._onChangeTab, this));
    this.$selector.on('click', '.fe-more-btn', $.proxy(this._setMoreData, this));
  },
  _onChangeTab: function (event) {
    this.$selectedTabId = $(event.currentTarget).attr('id');
    this.$selector = this.$container.find('#' + this.$selectedTabId + '-tab');
    this.$contentList = this.$selector.find('.fe-content-list');
    this.$standardNode = this.$contentList.find('li.fe-first');
    this.$moreBtn = this.$selector.find('.fe-more-btn');

    this._getApiName();
    this._setList();
  },
  _getApiName: function () {
    if (this.$selectedTabId === 'tab1') {
      this._apiName = Tw.API_CMD.BFF_09_0001;
    } else if (this.$selectedTabId === 'tab2') {
      this._apiName = Tw.API_CMD.BFF_09_0003;
    } else {
      this._apiName = Tw.API_CMD.BFF_09_0004;
    }
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

      if (this._selectedTabId === 'tab1') {
        $liNode.find('.fe-event-img img').attr({
          'src': $content[i].filePath,
          'alt': $content[i].prCtt
        });
      } else if (this._selectedTabId === 'tab3') {
        $liNode.find('.fe-event-win-date').text(Tw.DateHelper.getShortDateNoDot($content[i].winDt));
      }
      this.$selectList.append($liNode);
    }
    var $pageObj = this._getPageObj();
    this._setHiddenMoreBtn($pageObj);
  },
  _getPageObj: function () {
    var obj = {};
    if (this._selectedTabId === 'tab1') {
      obj.page = this._ingPage;
      obj.totalPage = this._ingTotalPage;
      obj.totalCnt = this._ingTotalCnt;
    } else if (this._selectedTabId === 'tab2') {
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
  }
};

