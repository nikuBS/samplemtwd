/**
 * FileName: myt-fare.bill.contents.history.js
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 9. 17
 */
Tw.MyTFareBillContentsHitstory = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  console.log(this.data)
  
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(rootEl);
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;
  this._urlHelper = Tw.UrlHelper;

  this._params = this._urlHelper.getQueryParams();

  this._cachedElement();
  this._bindEvent();
  this._init(data);
};

Tw.MyTFareBillContentsHitstory.prototype = {
  _init: function (data) {
    this.current = this._getLastPathname();

    this._initBillList(data);
  },

  _cachedElement: function () {
    this.$domListWrapper = this.$container.find('#fe-list-wrapper'); 
    this.$listWrapper = this.$domListWrapper.find('.list-inner');

    this.$template = {
      $listWrapper: Handlebars.compile($('#list-wrapper').html()),
      $list: Handlebars.compile($('#list-default').html()),
      $emptyList: Handlebars.compile($('#list-empty').html())
    };

    Handlebars.registerPartial('billList', $('#list-default').html());
    /*this.$autopaymentSwitcher = this.$container.find('.switch-wrap .btn-switch input');
    this.$microPayMonthSelector = this.$container.find('#fe-month-selector');*/
  },

  _bindEvent: function () {
    /*if (this.$autopaymentSwitcher) {
      this.$autopaymentSwitcher.on('change', $.proxy(this._autoPaymentBlockToggle, this));
    }*/
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
    
    console.log(this.renderListData)
    initedListTemplate = this.$template.$list(this.renderListData);
    this.$listWrapper.append(initedListTemplate);
    /*var date = new Date();
    this.monthTermValue = JSON.parse(data).termSelectValue;

    this.boardListWithTemplate = new Tw.MyTFareHistoryCommonBoard(this.$container);

    this.dateInfo = {
      year: this._dateHelper.getShortDateWithFormat(date, 'YYYY'),
      month: this._dateHelper.getCurrentMonth(date)
    };

    this.monthActionSheetListData = $.proxy(this._setMonthActionSheetData, this)();

    this.$microPayMonthSelector.on('click', $.proxy(this._typeActionSheetOpen, this, Tw.POPUP_TITLE.SELECT, this.monthActionSheetListData,
        $.proxy(this._openMonthSelectHandler, this), $.proxy(this._closeMonthSelect, this)));

    this.$container.on('click', '.list-inner li a', $.proxy(this._moveDetailPage, this));

    this.$template = {
      $domListWrapper: this.$container.find('#fe-list-wrapper'),
      $list: this.$container.find('#list-default'),
      $listWrapper: this.$container.find('#list-wrapper'),
      $emptyList: this.$container.find('#list-empty')
    };*/
  },

  _moveDetailPage: function (e) {
    Tw.UIService.setLocalStorage('myTFareHistoryDetailData', JSON.stringify(this.currentMonthData[$(e.currentTarget).data('listId')]));
  },

 
  /*_setMicroPaymentContentsData: function (res) {
    this.historyData = JSON.parse(res);

    this.currentMonthData = (this.historyData[this.dateInfo.year] && this.historyData[this.dateInfo.year][this.dateInfo.month]) ?
        this.historyData[this.dateInfo.year][this.dateInfo.month] : [];

    this._setCurrentMonthDataIndex();
    this._renderMicroPayContentsList();
  },*/
  _openMonthSelectHandler: function (root) {
    this.$monthSelectActionsheetButtons = root.find('.chk-link-list button');
    $(this.$monthSelectActionsheetButtons[this.dateInfo.currentIndex || 0]).addClass('checked');
    this.monthActionSheetListData[0].list[this.dateInfo.currentIndex || 0].option = 'checked';
    this.$monthSelectActionsheetButtons.on('click', $.proxy(this._updateMicroPayContentsList, this));
  },

  _closeMonthSelect: function () {
  },

  _updateMicroPayContentsList: function (e) {
    this.monthActionSheetListData[0].list[this.dateInfo.currentIndex || 0].option = '';
    this.dateInfo.currentIndex = $(e.currentTarget).data('index');
    this.dateInfo.currentYear = $(e.currentTarget).data('year');
    this.dateInfo.currentMonth = $(e.currentTarget).data('month');
    this.$monthSelectActionsheetButtons.removeClass('checked');
    this._popupService.close();
    this.$microPayMonthSelector.text($(e.target).text());

    this.currentMonthData = (this.historyData[this.dateInfo.currentYear] && this.historyData[this.dateInfo.currentYear][this.dateInfo.currentMonth]) ?
        this.historyData[this.dateInfo.currentYear][this.dateInfo.currentMonth] : [];

    this._setCurrentMonthDataIndex();

    this._renderMicroPayContentsList();
  },

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



  
  _setMonthActionSheetData: function () {
    var tempArr = [];
    var yearText = ''
    console.log(this.dateInfo, this.monthTermValue);
    for (var i = this.monthTermValue, month = this.dateInfo.month; i > 0; i--) {
      if (month === 0) {
        month = 12;
        yearText = (this.dateInfo.year - 1) + Tw.PERIOD_UNIT.YEAR + ' ';
      }
      if (month-- <= 0) {
        tempArr.push({
          value: yearText + Math.abs(month) + Tw.PERIOD_UNIT.MONTH,
          attr: 'data-index=\'' + Math.abs(i - this.monthTermValue) + '\' data-year=\'' + (this.dateInfo.year - 1) + '\'' + ' data-month=\'' + Math.abs(month) + '\''
        });
      } else {
        tempArr.push({
          value: yearText + (month + 1) + Tw.PERIOD_UNIT.MONTH,
          attr: 'data-index=\'' + Math.abs(i - this.monthTermValue) + '\' data-year=\'' + this.dateInfo.year + '\'' + ' data-month=\'' + (month + 1) + '\''
        });
      }
    }
    return [{
      list: tempArr
    }];
  },

  _typeActionSheetOpen: function (title, data, openCallback, closeCallback) {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',// hbs의 파일명
      layer: true,
      title: title,
      data: data
    }, openCallback, closeCallback);
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
