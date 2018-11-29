/**
 * FileName: myt-fare.bill.contents.history.js
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
 */
Tw.MyTFareBillContentsHitstory = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(rootEl);
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;
  this._urlHelper = Tw.UrlHelper;

  this._params = this._urlHelper.getQueryParams();

  this._cachedElement();
  this._init(data);
  this._bindEvent();
};

Tw.MyTFareBillContentsHitstory.prototype = {
  _init: function (data) {
    this.current = this._getLastPathname();

    this._initBillList(data);
    this.monthActionSheetListData = $.proxy(this._setMonthActionSheetData, this)(); //현재로부터 지난 6개월 구하기 
  },

  _cachedElement: function () {
    this.$domListWrapper = this.$container.find('#fe-list-wrapper'); 
    this.$listWrapper = this.$domListWrapper.find('.list-inner');
    this.$selectMonth = this.$container.find('#fe-month-selector');

    this.$template = {
      $listWrapper: Handlebars.compile($('#list-wrapper').html()),
      $list: Handlebars.compile($('#list-default').html()),
      $emptyList: Handlebars.compile($('#list-empty').html())
    };

    Handlebars.registerPartial('billList', $('#list-default').html());
  },

  _bindEvent: function () {
    this.$domListWrapper.find('.fe-detail-link').on('click', $.proxy(this._moveDetailPage,this));
    this.$selectMonth.on('click', $.proxy(this._typeActionSheetOpen, this));
  },

  _initBillList: function (data) {
    //리스트 갯수
    var totalDataCounter = this.data.billList.length; 
    var initedListTemplate;
    this.renderListData = {};

    //리스트 갯수 제한 
    this.listRenderPerPage = 20; //더보기 갯수
    this.listLastIndex = this.listRenderPerPage; 
    this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

    this.renderableListData = this.data.billList.slice(0, this.listRenderPerPage);
    
    this.renderListData.initialMoreData = this.listViewMoreHide;
    this.renderListData.restCount = totalDataCounter - this.listRenderPerPage;
    this.renderListData.billList = this.renderableListData; 
    
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
      if(month>= month_limit){ 
        year = this.data.curYear;
        month -= month_limit;
      }
      tempArr.push({
        value:month + Tw.PERIOD_UNIT.MONTH,
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
    //이동
    this._historyService.goLoad(this._historyService.pathname + "?year=" + year + "&month=" + month);
  },

  _closeMonthSelect: function () {
    this._popupService.close();
  },

  // 월 선택 end

  // 디테일 페이지
  _moveDetailPage: function (e) {
    Tw.UIService.setLocalStorage('detailData', JSON.stringify(this.data.billList[$(e.currentTarget).data('listId')]));
    console.log(this.data)
    this._historyService.goLoad(this._historyService.pathname+'/detail');
  },

  
 
  /*_setMicroPaymentContentsData: function (res) {
    this.historyData = JSON.parse(res);

    this.currentMonthData = (this.historyData[this.dateInfo.year] && this.historyData[this.dateInfo.year][this.dateInfo.month]) ?
        this.historyData[this.dateInfo.year][this.dateInfo.month] : [];

    this._setCurrentMonthDataIndex();
    this._renderMicroPayContentsList();
  },*/
  

  

  _setCurrentMonthDataIndex: function () {
    this.currentMonthData.map($.proxy(function (o, i) {
      o.listId = i;
    }, this));
  },

  _renderMicroPayContentsList: function () {

    this.$template.$domListWrapper.html('');

    this.boardListWithTemplate._init({result: this.currentMonthData}, this.$template.$domListWrapper, {
      list: this.$template.$list,
      wrapper: this.$template.$listWrapper,
      empty: this.$template.$emptyList
    }, {
      setIndex: function (option) {
        return option.fn(this);
      }
    }, {
      list: 'listElement',
      restButton: 'restCount'
    }, 20, '.bt-more button', '.list-inner', $.proxy(this._appendListCallBack, this));
  },

  _appendListCallBack: function () {
  },



  

  _autoPaymentBlockToggle: function (e) {
    var wrapper = $(e.target).parents('li');

    this.detailData = {
      idpg: wrapper.data('feIdpg'),
      tySvc: wrapper.data('feTysvc'),
      cpCode: wrapper.data('feCpcode'),
      state: 'C'
    };
    this._appendAutoPaymentBlockHandler(this._blockHistoryBlockToggleHandler);
  },

  _blockHistoryBlockToggleHandler: function (res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(res.code, res.msg).page();
    }

    Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TOAST.REVOCATION);
    window.setTimeout($.proxy(function () {
      this._historyService.reload();
    }, this), 2000);
  },

  _getLastPathname: function () {
    return _.last(this._historyService.pathname.split('/')) || this._historyService.pathname.split('/').splice(-2)[0];
  }
};