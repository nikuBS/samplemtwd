/**
 * FileName: tevent.common.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.21
 */

Tw.TeventCommon = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.TeventCommon.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },
  _initVariables: function () {
    this.$eventSelector = this.$container.find('.fe-select-event');
    this.$contentList = this.$container.find('.fe-content-list');
    this.$standardNode = this.$contentList.find('li.fe-first:first');
    this.$moreBtn = this.$container .find('.fe-more-btn');

    this._uri = 'ing';
    this._isClicked = false;
    this._page = 0;
    this._totalPage = this.$contentList.attr('data-page');
    this._totalCnt = this.$contentList.attr('data-cnt');
  },
  _bindEvent: function () {
    this.$eventSelector.on('click', $.proxy(this._openEventPop, this));
    this.$contentList.on('click', 'li', $.proxy(this._getDetailEvent, this));
    this.$moreBtn.on('click', $.proxy(this._setMoreData, this));
  },
  _openEventPop: function () {
    this._popupService.open({
        hbs: 'actionsheet_select_a_type',// hbs의 파일명
        layer: true,
        title: Tw.POPUP_TITLE.EVENT,
        data: Tw.POPUP_TPL.TEVENT_LIST
      },
      $.proxy(this._onOpenPopup, this),
      $.proxy(this._goLoad, this),
      'select');
  },
  _onOpenPopup: function ($layer) {
    $layer.on('click', '.event-type', $.proxy(this._setUrl, this));
  },
  _goLoad: function () {
    if (this._isClicked) {
      this._historyService.goLoad('/tevent/' + this._uri);
    }
  },
  _setUrl: function (event) {
    this._uri = $(event.currentTarget).attr('id');
    this._isClicked = true;

    this._popupService.close();
  },
  _setMoreData: function () {
    if (this._page < this._totalPage) {
      this._page++;
      this._requestForList();
    }
  },
  _requestForList: function () {
    this._apiService.request(this._apiName, { svcDvcClCd: 'M', page: this._page, size: Tw.DEFAULT_LIST_COUNT })
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
    Tw.Error(err.code, err.msg).pop();
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

      var $dayNode = $liNode.find('.fe-dday-wrap');
      var $dday = Tw.DateHelper.getNewRemainDate($content[i].prEndDt) - 1;
      if ($dday <= 7) {
        $dayNode.find('.fe-dday').text($dday);
        $dayNode.show();
      } else {
        $dayNode.hide();
      }

      var $typeNode = $liNode.find('.fe-event-type');
      if ($content[i].prTypCd === 'E') {
        $typeNode.find('.fe-type').text(Tw.EVENT_TYPE[$content[i].prTypCd]);
        $typeNode.show();
      } else {
        $typeNode.hide();
      }

      if (this._uri === 'ing') {
        $liNode.find('.fe-event-img img').attr({
          'src': $content[i].filePath,
          'alt': $content[i].prCtt
        });
      } else if (this._uri === 'win') {
        $liNode.find('.fe-event-win-date').text(Tw.DateHelper.getShortDateNoDot($content[i].winDt));
      }
      $liNode.on('click', $.proxy(this._getDetailEvent, this, $liNode.attr('id')));
      this.$contentList.append($liNode);
    }
    this._setHiddenMoreBtn();
  },
  _showMoreData: function (idx, target) {
    var $target = $(target);
    if ($target.hasClass('none')) {
      if (idx < this._page * Tw.DEFAULT_LIST_COUNT) {
        $target.removeClass('none');
      }
    }
    this._setHiddenMoreBtn();
  },
  _setHiddenMoreBtn: function () {
    if (this._page === this._totalPage) {
      this.$moreBtn.hide();
    } else {
      this.$moreBtn.find('.fe-more-length').text('(' + (this._totalCnt - (this._page * Tw.DEFAULT_LIST_COUNT)) + ')');
      this.$moreBtn.show();
    }
  },
  _getDetailEvent: function (id) {
    if (typeof(id) !== 'string') {
      var event = id;
      id = $(event.currentTarget).attr('id');
    }
    this._historyService.goLoad('/tevent/detail/' + id);
  }
};

