/**
 * @file tevent.common.js
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.11.21
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

    this._uri = window.location.pathname.split('/')[2];
    this._isClicked = false;
    this._page = 0;
    this._totalPage = this.$contentList.attr('data-page') - 1;
    this._totalCnt = this.$contentList.attr('data-cnt');
  },
  _bindEvent: function () {
    this.$eventSelector.on('click', $.proxy(this._openEventPop, this));
    this.$contentList.on('click', 'li', $.proxy(this._getDetailEvent, this));
    this.$moreBtn.on('click', $.proxy(this._setMoreData, this));
  },
  _openEventPop: function (e) {
    // 이벤트 리스트 변경
    this._popupService.open({
        url: '/hbs/',
        hbs: 'actionsheet01',
        layer: true,
        data: Tw.POPUP_TPL.TEVENT_LIST,
        btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
      },
      $.proxy(this._onOpenPopup, this),
      $.proxy(this._goLoad, this),
      'select',
      $(e.currentTarget));
  },
  _onOpenPopup: function ($layer) {
    $layer.find('input#' + this._uri).attr('checked', 'checked');
    $layer.on('change', '.ac-list', $.proxy(this._setUrl, this));
  },
  _goLoad: function () {
    if (this._isClicked) {
      this._historyService.goLoad('/tevent/' + this._uri);
    }
  },
  _setUrl: function (event) {
    this._uri = $(event.target).attr('id');
    this._isClicked = true;

    this._popupService.close();
  },
  _setMoreData: function (e) {
    // 더보기
    var $target = $(e.currentTarget);
    if (this._page < this._totalPage) {
      this._page++;
      this._requestForList($target);
    }
  },
  _requestForList: function ($target) {
    var $apiName = this._getApiName();
    var $reqData = this._makeRequestData();

    this._apiService.request($apiName, $reqData)
      .done($.proxy(this._getSuccess, this, $target))
      .fail($.proxy(this._getFail, this, $target));
  },
  _getApiName: function () {
    var $apiName = '';
    if (this._uri === 'ing') {
      $apiName = Tw.API_CMD.BFF_09_0001; // 진행중 리스트
    } else if (this._uri === 'last') {
      $apiName = Tw.API_CMD.BFF_09_0003; // 지난이벤트
    } else {
      $apiName = Tw.API_CMD.BFF_09_0004; // 당첨자발표
    }
    return $apiName;
  },
  _makeRequestData: function () {
    return {
      svcDvcClCd: 'M',
      mtwdExpYn: 'Y',
      page: this._page,
      size: Tw.DEFAULT_LIST_COUNT
    };
  },
  _getSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setData(res.result.content);
    } else {
      this._getFail($target, res);
    }
  },
  _getFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
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
        $typeNode.text(Tw.EVENT_TYPE[$content[i].prTypCd]);
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
      this.$moreBtn.show();
    }
  },
  _getDetailEvent: function (id) {
    if (typeof(id) !== 'string') {
      var event = id;
      id = $(event.currentTarget).attr('id');
    }

    var url = '/tevent';
    if (this._uri === 'win') {
      url = url + '/win/detail?id=';
    } else {
      url = url + '/detail?id=';
    }
    this._historyService.goLoad(url + id);
  }
};