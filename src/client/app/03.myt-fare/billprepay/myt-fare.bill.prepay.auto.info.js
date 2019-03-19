/**
 * FileName: myt-fare.bill.prepay.auto.info.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.05
 * Annotation: 소액결제/콘텐츠이용료 자동 선결제 신청/변경/해지 내역 관리
 */

Tw.MyTFareBillPrepayAutoInfo = function (rootEl, title) {
  this.$container = rootEl;
  this.$title = title;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
  this._bindEvent();
};

Tw.MyTFareBillPrepayAutoInfo.prototype = {
  _init: function () {
    this._initVariables();
    this.$selectList.find('> li').each($.proxy(this._setEventEachData, this));
  },
  _initVariables: function () {
    this.$selectList = this.$container.find('.fe-history-list');
    this.$standardNode = this.$selectList.find('li:first');
    this.$moreBtn = this.$container.find('.fe-more-btn');

    this._standardAmount = this.$container.find('.fe-standard-amount').attr('id');

    this._page = 1;
    this._defaultCnt = Tw.DEFAULT_LIST_COUNT;
    this._totalCnt = this.$selectList.attr('data-cnt');
    this._totalPage = Math.ceil(this._totalCnt / this._defaultCnt);
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-auto-change', $.proxy(this._changeAutoPrepay, this));
    this.$container.on('click', '.fe-auto-cancel', $.proxy(this._cancelAutoPrepay, this));
    this.$container.on('click', '.fe-more-btn', $.proxy(this._setMoreData, this));
  },
  _changeAutoPrepay: function (e) {
    if (this._standardAmount > 0) {
      this._historyService.goLoad('/myt-fare/bill/' + this.$title + '/auto/change');
    } else {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.NOT_ALLOWED_AUTO_PREPAY, null, null, null, null, $(e.currentTarget));
    }
  },
  _cancelAutoPrepay: function (e) {
    var $target = $(e.currentTarget);
    this._popupService.openConfirmButton(Tw.AUTO_PAY_CANCEL.CONTENTS, Tw.AUTO_PAY_CANCEL.TITLE,
      $.proxy(this._cancel, this, $target), null, Tw.BUTTON_LABEL.CLOSE, Tw.AUTO_PAY_CANCEL.BTN_NAME, $target);
  },
  _cancel: function ($target) {
    var $api = this._getCancelApiName();

    this._apiService.request($api, {})
      .done($.proxy(this._cancelSuccess, this, $target))
      .fail($.proxy(this._cancelFail, this, $target));

    this._popupService.close();
  },
  _getCancelApiName: function () {
    var $apiName = '';
    if (this.$title === 'small') {
      $apiName = Tw.API_CMD.BFF_07_0077;
    } else {
      $apiName = Tw.API_CMD.BFF_07_0084;
    }
    return $apiName;
  },
  _cancelSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.goLoad('/myt-fare/bill/pay-complete?type=' + this.$title + '&sub=cancel');
    } else {
      this._cancelFail($target, res);
    }
  },
  _cancelFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  _setEventEachData: function (idx, target) {
    var $target = $(target);
    if (idx >= this._defaultCnt) {
      $target.addClass('none');
    }
  },
  _setMoreData: function (e) {
    if (this._page < this._totalPage) {
      this._page++;
      this._setAutoMoreData(e);
    }
  },
  _setAutoMoreData: function (e) {
    var $target = $(e.currentTarget);
    var $api = this._getHistoryApiName();

    this._apiService.request($api, { pageNo: this._page, listSize: this._defaultCnt })
      .done($.proxy(this._getSuccess, this, $target))
      .fail($.proxy(this._getFail, this, $target));
  },
  _getHistoryApiName: function () {
    var $apiName = '';
    if (this.$title === 'small') {
      $apiName = Tw.API_CMD.BFF_07_0075;
    } else {
      $apiName = Tw.API_CMD.BFF_07_0079;
    }
    return $apiName;
  },
  _getSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var $result = res.result;
      var $record = [];
      if (this.$title === 'small') {
        $record = $result.microPrepayReqRecord;
      } else {
        $record = $result.useContentsAutoPrepayRecord;
      }

      if (!Tw.FormatHelper.isEmpty($record)) {
        this._setData($record);
      }
    } else {
      this._getFail($target, res);
    }
  },
  _setData: function ($record) {
    var cardName = '';
    var cardNum = '';

    if (this.$title === 'small') {
      cardName = 'cardNm';
      cardNum = 'cardNumH';
    } else {
      cardName = 'prchsCardNm';
      cardNum = 'cardNum';
    }

    for (var i = 0; i < $record.length; i++) {
      var $liNode = this.$standardNode.clone();
      $liNode.find('.fe-type').text(Tw.PAYMENT_REQUEST_TYPE[$record[i].autoChrgReqClCd]);
      $liNode.find('.fe-date').text(Tw.DateHelper.getFullDateAndTime($record[i].operDtm));

      if ($record[i].autoChrgReqClDd === 'F') {
        $liNode.find('.fe-detail').remove();
      } else {
        $liNode.find('.fe-card-info').html($record[i][cardName] + '<br />' +
          $record[i][cardNum]);
        $liNode.find('.fe-auto-chrg-amt').text(Tw.FormatHelper.addComma($record[i].autoChrgAmt));
        $liNode.find('.fe-auto-chrg-strd-amt').text(Tw.FormatHelper.addComma($record[i].autoChrgStrdAmt));
      }
      this.$selectList.append($liNode);
    }
    this._setHiddenMoreBtn();
  },
  _getFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  _setHiddenMoreBtn: function () {
    if (this._page === this._totalPage) {
      this.$moreBtn.hide();
    }
  }
};