/**
 * FileName: myt-fare.bill.small.history.js
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
 */
Tw.MyTFareBillSmallHistory = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(rootEl);
  this._popupService = Tw.Popup;

  this._params = Tw.UrlHelper.getQueryParams();

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareBillSmallHistory.prototype = {
  _init: function () {
    this.current = this._getLastPathname();

    this._initBillList();
    this.monthActionSheetListData = $.proxy(this._setMonthActionSheetData, this)(); //현재로부터 지난 6개월 구하기 
  },

  _cachedElement: function () {
    this.$domListWrapper = this.$container.find('#fe-list-wrapper'); 
    this.$listWrapper = this.$domListWrapper.find('.list-inner');
    this.$selectMonth = this.$container.find('#fe-month-selector');

    this.$template = {
      $btnMoreWrapper: Handlebars.compile($('#btn-more-wrapper').html()),
      $list: Handlebars.compile($('#list-default').html()),
      $emptyList: Handlebars.compile($('#list-empty').html())
    };

    Handlebars.registerPartial('billList', $('#list-default').html());
  },

  _bindEvent: function () {
    // 링크 이동
    this.$domListWrapper.find('.fe-detail-link').on('click', $.proxy(this._moveDetailPage,this));
    // 월 선택 
    this.$selectMonth.on('click', $.proxy(this._typeActionSheetOpen, this));
    // 더 보기
    this.$domListWrapper.on('click', '.bt-more', $.proxy(this._updateBillList, this));
  },

  _initBillList: function () {
    //리스트 갯수
    var totalDataCounter = this.data.billList.length; 
    var BtnMoreList;
    var initedListTemplate;
    this.renderListData = {};

    if(!totalDataCounter){
      this.$domListWrapper.append(this.$template.$emptyList());
      return ;
    }

    //리스트 갯수 제한 
    this.listRenderPerPage = 20; //더보기 갯수
    this.listLastIndex = this.listRenderPerPage; 
    this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

    this.renderableListData = this.data.billList.slice(0, this.listRenderPerPage);
    
    this.renderListData.initialMoreData = this.listViewMoreHide;
    this.renderListData.restCount = totalDataCounter - this.listRenderPerPage;
    this.renderListData.billList = this.renderableListData; 
    
    BtnMoreList = this.$template.$btnMoreWrapper(this.renderListData);
    this.$listWrapper.after(BtnMoreList);
    initedListTemplate = this.$template.$list(this.renderListData);
    this.$listWrapper.append(initedListTemplate);
  },

  // 월 선택
  _typeActionSheetOpen: function () {
    /*Tw.POPUP_TITLE.SELECT, ,
      */
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',// hbs의 파일명
      layer: true,
      title: Tw.POPUP_TITLE.SELECT,
      data: this.monthActionSheetListData
    }, $.proxy(this._openMonthSelectHandler, this), $.proxy(this._closeMonthSelect, this));
  },

  // 셀렉트 콤보박스
  _setMonthActionSheetData: function () {
    var tempArr = [],
      year = this.data.beforeYear, 
      month = this.data.beforeMonth, 
      month_limit = 12; 
    
    // 6개월 리스트 만들기
    for(var i = 1; i<=6; i++){
      month = parseFloat(this.data.beforeMonth)+i;
      if(month> month_limit){ 
        year = this.data.curYear;
        month -= month_limit;
      }
      tempArr.push({
        value:year + Tw.PERIOD_UNIT.YEAR + ' ' + month + Tw.PERIOD_UNIT.MONTH,
        attr: 'data-year = \''+ year + '\' data-month=\''+ month + '\'',
        option:(this.data.selectedYear === year && this.data.selectedMonth === month.toString()) ? "checked" : ""
      })
    }
    return [{
      list: tempArr.reverse()
    }];
  },

  // 선택 시트
  _openMonthSelectHandler: function (root) {
    root.find('.chk-link-list button').on('click', $.proxy(this._updateMicroPayContentsList, this));
  },

  _updateMicroPayContentsList: function (e) {
    var year = $(e.currentTarget).data('year') || this.data.curYear;
    var month = $(e.currentTarget).data('month') || this.data.curMonth; 
    //선택표기
    $(e.currentTarget).addClass('checked').parent().siblings().find('button').removeClass('checked');
    $(e.currentTarget).find('input[type=radio]').prop('checked', true);
    this.$selectMonth.text(month + '월');
    //이동
    this._popupService.closeAllAndGo(this._historyService.pathname + "?year=" + year + "&month=" + month);
  },

  _closeMonthSelect: function () {
    this._popupService.close();
  },

  // 월 선택 end

  // 디테일 페이지
  _moveDetailPage: function (e) {
    this._historyService.goLoad(this._historyService.pathname+'/detail?fromDt=' + 
                                this.data.searchFromDt + '&toDt=' + 
                                this.data.searchToDt + '&listId=' + 
                                $(e.currentTarget).data('listId')
                              );
  },  

  // 더 보기
  _updateBillList: function() {
    var $virtualDom = $('<div />');
    var $domAppendTarget = this.$domListWrapper.find('.cont-use-detail ul.list-inner');
    
    this._updateBillListDate();
    this.$domListWrapper.find('.bt-more').css({display: this.listLastIndex >= this.data.billList.length ? 'none':''});

    this.renderableListData.map($.proxy(function(o) {
      var renderedHTML;  
      renderedHTML = this.$template.$list({billList:[o]});

      $virtualDom.append(renderedHTML);
    }, this));
    $virtualDom.find('.fe-detail-link').on('click', $.proxy(this._moveDetailPage,this));
    $domAppendTarget.append($virtualDom.children().unwrap());
  },

  _updateBillListDate: function() {
    this.listNextIndex = this.listLastIndex + this.listRenderPerPage;
    this.renderableListData = this.data.billList.slice(this.listLastIndex, this.listNextIndex);
    this.renderListData.restCount = this.data.billList.length - this.listNextIndex;

    this.listLastIndex = this.listNextIndex >= this.data.billList.length ?
        this.data.billList.length : this.listNextIndex;
  },
  // 더 보기 end

  _getLastPathname: function () {
    return _.last(this._historyService.pathname.split('/')) || this._historyService.pathname.split('/').splice(-2)[0];
  }
};