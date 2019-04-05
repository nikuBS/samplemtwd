/**
 * @file myt-fare.info.bill-tax.js
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018. 9. 17
 */
Tw.MyTFareInfoBillTax = function (rootEl, data) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);  

  this.data = JSON.parse(data);

  this._cachedElement();
  
  this._init();
  this._bindEvent();
};

Tw.MyTFareInfoBillTax.prototype = {
  _init: function () {
    this.rootPathName = this._historyService.pathname;
    var initedListTemplate;
    var totalDataCounter = this.data.items.length;
    this.renderListData = {};

    if (!totalDataCounter) {
      initedListTemplate = this.$template.$emptyList();
    } else {
      this.listRenderPerPage = 20;

      this.listLastIndex = this.listRenderPerPage;
      this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

      this.renderableListData = this.data.items.slice(0, this.listRenderPerPage);
      this.renderListData.initialMoreData = this.listViewMoreHide;
      this.renderListData.restCount = totalDataCounter - this.listRenderPerPage;
      initedListTemplate = this.$template.$listTaxWrapper({
        limitMonth:this.data.limitMonth,
        listViewMoreHide:this.listViewMoreHide,
        renderableListData:this.renderableListData
      });
    }

    this.$template.$domTaxListWrapper.append(initedListTemplate);

    this.$listWrapper = this.$container.find('#fe-tax-list-wrapper');
    this.$btnListViewMorewrapper = this.$listWrapper.find('.bt-more');
    this.$btnListViewMorewrapper.on('click', 'button', $.proxy(this._updateTaxList, this)); // 더보기버튼
    this.$appendListTarget = this.$listWrapper.find('.fe-list-inner');
    this.$listWrapper.on('click', '.fe-btn-reprint button', $.proxy(this._reRequestHandler, this));
  },
  _updateTaxList: function (e) {
    this._updateTaxListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.items.length ? 'none' : ''});
    this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var $domAppendTarget  = this.$appendListTarget;

    this.renderableListData.map($.proxy(function (o) {
      var renderedHTML;
      
      $domAppendTarget = $('.fe-list-inner div.myfare-result-wrap:last-child');

      renderedHTML = this.$template.$templateTaxItem({renderableListData: [o]});

      $domAppendTarget.after(renderedHTML);

    }, this));
  },

  _updateTaxListData: function () {
    this.listNextIndex = this.listLastIndex + this.listRenderPerPage;
    this.renderableListData = this.data.items.slice(this.listLastIndex, this.listNextIndex);
    this.renderListData.restCount = this.data.items.length - this.listNextIndex;

    this.listLastIndex = this.listNextIndex >= this.data.items.length ?
        this.data.items.length : this.listNextIndex;
  },

  _reRequestHandler: function (e) {
    var target = $(e.currentTarget);
    var targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName;
    
    this.isFax  = target.attr('class').search('fax') >= 0;
    this.targetData = this.data.items[target.data('listId')];
    

    if (this.isFax) {      
      this._historyService.goLoad(targetURL + '/send-fax?date=' + target.data('listDate'));
    } else {
      this._historyService.goLoad(targetURL + '/send-email?date=' + target.data('listDate'));
    }
  },

  _cachedElement: function () {
    this.$template = {
      $domTaxListWrapper: this.$container.find('#fe-tax-list-wrapper'),

      $templateTaxItem: Handlebars.compile($('#fe-template-tax-items').html()),
      $listTaxWrapper: Handlebars.compile($('#fe-template-tax-list').html()),


      $emptyList: Handlebars.compile($('#list-empty').html())
    };
    Handlebars.registerPartial('taxList', $('#fe-template-tax-items').html());

  },
  _bindEvent: function () {

  },
  _updateViewMoreBtnRestCounter: function (e) {
    e.text(e.text().replace(/\((.+?)\)/, '(' + this.renderListData.restCount + ')'));
  }
};