/**
 * FileName: myt-fare.info.bill.history.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018. 9. 17
 */
Tw.MyTFareInfoBillCash = function (rootEl, data) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this.data = JSON.parse(data);

  this._cachedElement();
  this._init();
  this._bindEvent();
  

};

Tw.MyTFareInfoBillCash.prototype = {
  
  _init: function () {
    var initedListTemplate;
    var totalDataCounter = this.data.list.length;
    this.renderListData = {};

    if (!totalDataCounter) {
      initedListTemplate = this.$template.$emptyList();
    } else {
      this.listRenderPerPage = 20; // 한번에 노출할 리스트갯수

      this.listLastIndex = this.listRenderPerPage;
      this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

      this.renderableListData = this.data.list.slice(0, this.listRenderPerPage);

      // this.renderListData = this.data.noticeInfo;
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
      
      initedListTemplate = this.$template.$listCashWrapper(this.renderListData);
    }

    this.$template.$domCashListWrapper.append(initedListTemplate);

    this.$listWrapper = this.$container.find('#fe-cash-list-wrapper');
    this.$btnListViewMorewrapper = this.$listWrapper.find('.bt-more');
    this.$btnListViewMorewrapper.on('click', 'button', $.proxy(this._updateCashList, this));
    this.$appendListTarget = this.$listWrapper.find('.fe-list-inner');
  },

  _cachedElement: function () {
    this.$template = {
      $domCashListWrapper: this.$container.find('#fe-cash-list-wrapper'),

      $templateCashItem: Handlebars.compile($('#fe-template-cash-items').html()),
      $templateCashItemDay: Handlebars.compile($('#fe-template-cash-day').html()),
      $templateCashYear: Handlebars.compile($('#fe-template-cash-year').html()),
      $listCashWrapper: Handlebars.compile($('#list-template-cash-wrapper').html()),

      $emptyList: Handlebars.compile($('#list-empty').html())
    };
    
    Handlebars.registerPartial('chargeItems', $('#fe-template-cash-items').html());
    Handlebars.registerPartial('list', $('#fe-template-cash-day').html());
    Handlebars.registerPartial('year', $('#fe-template-cash-year').html());

  },
  _bindEvent: function () {

  },
  _updateCashList: function (e) {
    this._updateCashListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.list.length ? 'none' : ''});
    this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var insertCompareData = this.data.list[this.listLastIndex - this.listRenderPerPage - 1],
        $domAppendTarget  = this.$appendListTarget;

    this.renderableListData.map($.proxy(function (o) {
      var renderedHTML;
      if (insertCompareData.listDt === o.listDt) {
        $domAppendTarget = $('.fe-list-inner li:last-child');
        renderedHTML = this.$template.$templateCashItem({items: [o], date: o.listDt});
      } else {
        insertCompareData = o;
        $domAppendTarget = this.$appendListTarget;
        renderedHTML = this.$template.$templateCashItemDay({
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
  _updateCashListData: function () {
    this.listNextIndex = this.listLastIndex + this.listRenderPerPage;
    this.renderableListData = this.data.list.slice(this.listLastIndex, this.listNextIndex);
    this.renderListData.restCount = this.data.list.length - this.listNextIndex;

    this.listLastIndex = this.listNextIndex >= this.data.list.length ?
        this.data.list.length : this.listNextIndex;
  },
  _updateViewMoreBtnRestCounter: function (e) {
    e.text(e.text().replace(/\((.+?)\)/, '(' + this.renderListData.restCount + ')'));
  }
};