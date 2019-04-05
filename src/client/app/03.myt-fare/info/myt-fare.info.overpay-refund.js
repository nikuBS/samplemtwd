/**
 * @file myt-fare.overpay-refund.js
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018. 9. 17
 */
Tw.MyTFareInfoOverpayRefund = function (rootEl, data) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService(rootEl);

  this.data = data ? JSON.parse(data) : '';

  this._init();
};

Tw.MyTFareInfoOverpayRefund.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();

    this._initRefundList();
  },
  _bindEvent: function () {

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
        prev.push({items: [cur], date:cur.listDt, yearHeader:cur.yearHeader});
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
    this.$appendListTarget.on('click', '.inner', $.proxy(this._listViewDetailHandler, this));
  },

  _listViewDetailHandler: function (e) {
    var detailData = this.data[$(e.currentTarget).data('listId')];

    detailData.isPersonalBiz = this.data.isPersonalBiz;

    // Tw.CommonHelper.setLocalStorage('detailData', JSON.stringify(detailData));
    this._historyService.goLoad(this._historyService.pathname + '/detail?listId='+detailData.listId);
  },

  _updatePaymentList: function (e) {
    this._updatePaymentListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.length ? 'none' : ''});
    this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var $domAppendTarget  = this.$appendListTarget;

    this.renderableListData.map($.proxy(function (o) {
      var renderedHTML = this.$template.$templateItemDay({records:[{items:[o], date:o.listDt, yearHeader:o.yearHeader}]});

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
  }

  
};