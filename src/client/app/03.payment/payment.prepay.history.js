/**
 * FileName: payment.prepay.history.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.25
 */

Tw.PaymentPrepayHistory = function (rootEl, title, type) {
  this.$container = rootEl;
  this.$title = title;
  this.$type = type;
  this.$window = $(window);
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._init();
  this._bindEvent();
};

Tw.PaymentPrepayHistory.prototype = {
  _init: function () {
    this._initVariables();
    this.$selectList.find('li').each($.proxy(this._setEventEachData, this));
  },
  _initVariables: function () {
    this.$selectList = this.$container.find('.fe-select-list');
    this.$standardNode = this.$selectList.find('li:first');
    this.$moreBtn = this.$container.find('.fe-more-btn');

    this._page = 1;
    this._defaultCnt = Tw.DEFAULT_LIST_COUNT;
    this._totalCnt = this.$selectList.attr('data-cnt');
    this._totalPage = Math.ceil(this._totalCnt / this._defaultCnt);
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-more-btn', $.proxy(this._setMoreData, this));
  },
  _setEventEachData: function (idx, target) {
    var $target = $(target);
    if (idx >= this._defaultCnt) {
      $target.addClass('none');
    }
  },
  _setMoreData: function () {
    if (this._page < this._totalPage) {
      this._page++;

      if (this.$type === 'auto') {
        this._setAutoMoreData();
      } else {
        this.$selectList.find('li').each($.proxy(this._showMoreData, this));
      }
    }
  },
  _setAutoMoreData: function () {
    var $api = Tw.API_CMD.BFF_07_0075;
    if (this.$title === 'contents') {
      $api = Tw.API_CMD.BFF_07_0079;
    }
    this._apiService.request($api, { page: this._page, listSize: this._defaultCnt })
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._getFail, this));
  },
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var $result = res.result;
      var $record = [];
      if (this.$title === 'micro') {
        $record = $result.microPrepayRecord;
      } else {
        $record = $result.useContentsPrepayRecord;
      }

      if (!Tw.FormatHelper.isEmpty($record)) {
        for (var i = 0; i < $record.length; i++) {
          var $liNode = this.$standardNode.clone();
          $liNode.find('.fe-date').text($record[i].name + '<br />' + $record[i].date);
          $liNode.find('.fe-card-info').text($record[i].prchscardNm + '<br />' +
            $record[i].card_num);
          $liNode.find('.fe-auto-chrg-amt').text(Tw.FormatHelper.addComma($record[i].autoChrgAmt));
          $liNode.find('.fe-auto-chrg-strd-amt').text(Tw.FormatHelper.addComma($record[i].autoChrgStrdAmt));

          if ($record[i].autoChrgReqClDd === 'F') {
            $liNode.find('.fe-cancel-noti').removeClass('none');
          }
          this.$selectList.append($liNode);
        }
        this._setHiddenMoreBtn();
      }
    } else {
      this._getFail();
    }
  },
  _getFail: function (err) {
    this._popupService.openAlert(err.code + ' ' + err.msg);
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
  _setHiddenMoreBtn: function () {
    if (this._page === this._totalPage) {
      this.$moreBtn.hide();
    } else {
      this.$moreBtn.find('.fe-more-length').text('(' + (this._totalCnt - (this._page * this._defaultCnt)) + ')');
    }
  }
};