/**
 * FileName: myt-fare.overpay-refund.js
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018. 9. 17
 */
Tw.MyTFareOverpayRefund = function (rootEl, data) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService(rootEl);

  this.data = data ? JSON.parse(data) : '';

  this._init();
};

Tw.MyTFareOverpayRefund.prototype = {
  _init: function () {
    if (this.data.current !== 'detail') {
      this._cachedElement();
      this._bindEvent();

      this._initRefundList();
    } else {
      this._initDetail();
    }
  },
  _bindEvent: function () {

  },

  _initRefundList: function () {
    var initedListTemplate;
    var totalDataCounter = this.data.length;
    this.renderListData = {};

    if (!totalDataCounter) {
      initedListTemplate = this.$template.$emptyList();
    } else {
      this.listRenderPerPage = 20;

      this.listLastIndex = this.listRenderPerPage;
      this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

      this.renderableListData = this.data.slice(0, this.listRenderPerPage);

      this.renderListData.initialMoreData = this.listViewMoreHide;
      this.renderListData.restCount = totalDataCounter - this.listRenderPerPage;
      this.renderListData.records = this.renderableListData.reduce($.proxy(function (prev, cur) {
        if (prev.length) {
          if (prev.slice(-1)[0].date === cur.listDt) {
            prev.slice(-1)[0].items.push(cur);
          } else {
            prev.push({items: [cur], date: cur.listDt});
          }
        } else {
          prev.push({items: [cur], date: cur.listDt});
        }

        return prev;
      }, this), []);

      initedListTemplate = this.$template.$listWrapper(this.renderListData);
    }

    this.$template.$domListWrapper.append(initedListTemplate);
    this.$listWrapper = this.$container.find('#fe-refund-history-wrapper');
    this.$btnListViewMorewrapper = this.$container.find('#fe-refund-history-wrapper .bt-more');
    this.$btnListViewMorewrapper.on('click', 'button', $.proxy(this._updatePaymentList, this));
    this.$appendListTarget = this.$listWrapper.find('.fe-list-inner');
    this.$appendListTarget.on('click', 'button', $.proxy(this._listViewDetailHandler, this));
  },

  _listViewDetailHandler: function (e) {
    var detailData = this.data[$(e.currentTarget).data('listId')];

    detailData.isPersonalBiz = this.data.isPersonalBiz;

    Tw.UIService.setLocalStorage('detailData', JSON.stringify(detailData));
    this._historyService.goLoad(this._historyService.pathname + '/detail');
  },

  _updatePaymentList: function (e) {
    this._updatePaymentListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.length ? 'none' : ''});
    this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var insertCompareData = this.data[this.listLastIndex - this.listRenderPerPage - 1],
        $domAppendTarget  = this.$appendListTarget;

    this.renderableListData.map($.proxy(function (o) {
      var renderedHTML;
      if (insertCompareData.listDt === o.listDt) {
        $domAppendTarget = $('.fe-list-inner li:last-child');
        renderedHTML = this.$template.$templateItem({items: [o], date: o.listDt});
      } else {
        insertCompareData = o;
        $domAppendTarget = this.$appendListTarget;
        renderedHTML = this.$template.$templateItemDay({
          records: [{
            items: [o],
            date: o.listDt,
            yearHeader: o.yearHeader
          }]
        });
      }

      $domAppendTarget.append(renderedHTML);

    }, this));
  },

  _updatePaymentListData: function () {
    this.listNextIndex = this.listLastIndex + this.listRenderPerPage;
    this.renderableListData = this.data.slice(this.listLastIndex, this.listNextIndex);
    this.renderListData.restCount = this.data.length - this.listNextIndex;

    this.listLastIndex = this.listNextIndex >= this.data.length ?
        this.data.length : this.listNextIndex;
  },

  _updateViewMoreBtnRestCounter: function (e) {
    e.text(e.text().replace(/\((.+?)\)/, '(' + this.renderListData.restCount + ')'));
  },

  _cachedElement: function () {
    this.$template = {
      $domListWrapper: this.$container.find('#fe-refund-history-wrapper'),
      // $list: this.$container.find('#list-default'),

      $templateItem: Handlebars.compile($('#fe-template-list-items').html()),
      $templateItemDay: Handlebars.compile($('#fe-template-list-day').html()),
      $templateYear: Handlebars.compile($('#fe-template-list-year').html()),

      $listWrapper: Handlebars.compile($('#list-template-list-wrapper').html()),
      $emptyList: Handlebars.compile($('#list-empty').html())
    };
    Handlebars.registerPartial('chargeItems', $('#fe-template-list-items').html());
    Handlebars.registerPartial('list', $('#fe-template-list-day').html());
    Handlebars.registerPartial('year', $('#fe-template-list-year').html());
  },
  // detail 정보
  _initDetail: function () {
    this.$template = {
      $reqDate: $('#fe-detail-date'),
      $reqAmt: $('#fe-detail-req-amt'),
      $overAmt: $('#fe-detail-over-amt'),
      $bondAmt: $('#fe-detail-bond-amt'),
      $total: $('#fe-detail-total'),
      $statusIng: $('#fe-detail-ing'),
      $statusEtc: $('#fe-detail-etc'),
      $statusInnerText: $('.fe-detail-status'),
      $refundDoneAmt: $('#fe-detail-refund-total'),
      $refundResultWrapper: $('#fe-detail-overpay-refund-result'),
      $bankName: $('#fe-detail-bank-name'),
      $bankNumber: $('#fe-detail-bank-num'),
      $procDate: $('#fe-detail-proc-date')
    };

    this.detailData = JSON.parse(Tw.UIService.getLocalStorage('detailData'));

    this.$template.$refundResultWrapper.css({'display': this.detailData.rfndStat !== 'ING' ? '' : 'none'});
    this.$template.$statusIng.css({'display': this.detailData.rfndStat !== 'ING' ? 'none' : ''});
    this.$template.$statusEtc.css({'display': this.detailData.rfndStat !== 'ING' ? '' : 'none'});

    this.$template.$reqDate.text(this.detailData.dataDt);
    this.$template.$reqAmt.text(this.detailData.dataAmt);
    this.$template.$overAmt.text(this.detailData.dataOverAmt);
    this.$template.$bondAmt.text(this.detailData.dataBondAmt);
    this.$template.$total.text(this.detailData.dataAmt);

    this.$template.$refundDoneAmt.text(this.detailData.dataAmt);
    this.$template.$bankName.text(this.detailData.rfndBankNm);
    this.$template.$bankNumber.text(this.detailData.rfndBankNum);
    this.$template.$procDate.text(this.detailData.dataDt);

    this.$template.$statusInnerText.text(this.detailData.dataStatus);

    console.log(this.detailData, this.$template);

  }
};