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

  this._params = Tw.UrlHelper.getQueryParams();

  this._cachedElement();
  this._init(data);
  this._bindEvent();
};

Tw.MyTFareBillContentsHitstory.prototype = {
  _init: function (data) {
    this.limitLength = Tw.DEFAULT_LIST_COUNT; // 한번에 노출될 리스트 갯수 TODO: 20
    this.monthActionSheetListData = null; //현재로부터 지난 6개월 구하기 (액션시트 선택)
    this.totalList = this._setMonthList(this.data.beforeYear, this.data.beforeMonth, 6, 'key');
    this.list = [];
    this.totalCnt = 0; 

    this.selectedYear = this._params.year || this.data.curYear;
    this.selectedMonth = this._params.month || this.data.curMonth;
    $.extend(this, this._getQueryFromTo(this.data.beforeYear, this.data.beforeMonth, this.data.curYear, this.data.curMonth)); // get fromDt, toDt,
  },

  _cachedElement: function () {
    this.$btnShowList = this.$container.find('.fe-show-list'); // 조회하기 버튼
    this.$tempListWrap = Handlebars.compile($('#fe-list-wrap').html());
    this.$tempList = Handlebars.compile($('#list-default').html());
    Handlebars.registerPartial('list', $('#list-default').html());
    Handlebars.registerPartial('empty', $('#list-empty').html()); // 내역 없을 시 
  },

  _bindEvent: function () {
    // 인증하기 클릭 이벤트
    this.$btnShowList.on('click', $.proxy(this._certShowLists, this));
  },

  // 인증업무
  _certShowLists: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0205,{
      fromDt: this.fromDt,
      toDt: this.toDt
    }).done($.proxy(this._callbackShowLists, this))
    .fail($.proxy(this._onError, this, this.$btnShowList));
  },

  _callbackShowLists: function (res) {
    if ( res.code !== Tw.API_CODE.CODE_00 ) {
      return this._onError(this.$btnShowList, res);
      // res = this.bill_guide_BFF_05_0064; // TODO: delete
    }

    $.extend(this.totalList, this._devData(this._convData(res)));
    
    this._showWholeList();
    
  },
  
  _showWholeList: function () {
    // 결과 노출
    this._showLists(this.totalList[this._getStrYearMonth(this.selectedYear, this.selectedMonth)]);

    // 이벤트 바인드
    this._afterShowListEvent();

    // 더보기 버튼 여부
    this._showMoreBtn();
  },

  // 인증 후 엘리먼트, 이벤트 바인드
  _afterShowListEvent: function () {
    // 더보기 버튼, 더보기 클릭 이벤트 
    if (!this.$moreBtn) {
      this.$moreBtn = this.$container.find('.fe-more-btn'); // 더보기 버튼
      this.$moreBtn.on('click', $.proxy(this._showMoreList, this));
    }

    // 월선택 액션시트
    if (!this.$selectMonth) {
      this.$selectMonth = this.$container.find('.fe-month-selector'); 
      this.$selectMonth.on('click', $.proxy(this._showSelectMonth, this));
    }

    // 링크이동 
    this.$container.find('.fe-yet-evented').removeClass('fe-yet-evented').on('click', '.fe-detail-link', $.proxy(this._moveDetailPage,this));
  },

  // 결과 가공
  _convData: function (res) {
    if (res && res.result && 
        res.result.useConAmtDetailList !== undefined && 
        Array.isArray(res.result.useConAmtDetailList)
      ) {
        return _.map(res.result.useConAmtDetailList.reverse(), function(o, index) {
          return $.extend(o, {
            listId: index,
            useServiceNm: o.useServiceNm || o.payFlag, 
            FullDate: Tw.DateHelper.getFullDateAndTime(o.payTime),
            useAmt: Tw.FormatHelper.addComma(o.useCharge), // 이용금액
            dedAmt: Tw.FormatHelper.addComma(o.deductionCharge), // 공제금액
          })
        });
    } else {
      return [];
    }
  },

  _getStrYearMonth: function (year, month) {
    return year + (month.toString().length < 2 ? '0' : '') + month;
  },

  // convData -> 배열로 
  _devData: function (arr) {
    return _.reduce(arr, function(prev, o) {
      var key = o.payDt.substr(0, 6);
      if (Tw.FormatHelper.isEmpty(prev[key])) {
        prev[key] = [];
      }
      prev[key].push(o);
      return prev;
    }, {});
  },

  // 결과 노출
  _showLists: function (list) {
    this.list = [].concat(list);
    this.totalCnt = this.list.length;

    var $el = this.$btnShowList; 
    if(this.$container.find('.fe-list-wrap').length) {
      $el = this.$container.find('.fe-list-wrap');
    }

    return $el.after(this.$tempListWrap({
      list: this.list.splice(0, this.limitLength), 
      totalCnt: this.totalCnt,
      curMonth: this.selectedMonth + Tw.PERIOD_UNIT.MONTH
    })).off('click').remove();
  },

  // 더보기 클릭 리스트 노출
  _showMoreList: function () {
    this.$container.find('.fe-lists').append(this.$tempList({
      list: this.list.splice(0, this.limitLength)
    }));

    // 이벤트 바인드
    this._afterShowListEvent();

    // 더보기 여부
    this._showMoreBtn();
  },

  // 더보기 노출 여부
  _showMoreBtn: function () {
    if (this.list.length) {
      this.$moreBtn.removeClass('none').attr('aria-hidden', false);
    } else {
      this.$moreBtn.addClass('none').attr('aria-hidden', true);
    }
  },

  // 월 액션시트
  _showSelectMonth: function (e) {
    return this._popupService.open({
      hbs: 'actionsheet_select_a_type',// hbs의 파일명
      layer: true,
      title: Tw.POPUP_TITLE.SELECT,
      data: this._setMonthActionSheetData()
    }, 
      $.proxy(this._openMonthSelectHandler, this), // 액션시트 열린 후 콜백 
      null, 
      null, // 해쉬네임
      $(e.currentTarget) // 팝업 닫힌 후 포커스 이동될 버튼 객체
    );
  },

  // 선택 시트
  _openMonthSelectHandler: function ($sheet) {
    // 해당 년 월 선택
    var year = parseFloat(this.selectedYear), month = parseFloat(this.selectedMonth);
    $sheet.find('button').filter(function(){
      return parseFloat($(this).data('year')) === year && parseFloat($(this).data('month')) === month;
    }).find('input').prop('checked', true);

    // 클릭 이벤트 바인드
    $sheet.find('.chk-link-list button').on('click', $.proxy(this._updateContentsPayList, this));
  },

  _updateContentsPayList: function (e) {
    var year = $(e.currentTarget).data('year') || this.data.curYear;
    var month = $(e.currentTarget).data('month') || this.data.curMonth; 
    //선택표기
    $(e.currentTarget).addClass('checked').parent().siblings().find('button').removeClass('checked');
    $(e.currentTarget).find('input[type=radio]').prop('checked', true);
    // 선택 text
    this.$selectMonth.text(month + Tw.PERIOD_UNIT.MONTH);

    // popup close
    this._popupService.close();

    // 월 교체
    this.selectedYear = year;
    this.selectedMonth = month;
    // $.extend(this, this._getQueryFromTo(year, month));
    this.$moreBtn = null;
    this.$selectMonth = null;
    // this._certShowLists();

    this._showWholeList();

  },

  // 디테일 페이지
  _moveDetailPage: function (e) {
    this._historyService.goLoad(
      this._historyService.pathname+'/detail?fromDt=' + 
        this.fromDt + '&toDt=' + 
        this.toDt + '&listId=' + 
        $(e.currentTarget).data('listId')
    );
  },

  // 6월 데이터
  _setMonthActionSheetData: function () {
    return this.monthActionSheetListData || this._setMonthList(this.data.beforeYear, this.data.beforeMonth, 6); // 캐싱된것 or 함수 실행
  },

  _setMonthList: function (beforeYear, beforeMonth, months, type) {
    var tempArr = [],
    keyArr = [],
    year = beforeYear, 
    month = beforeMonth, 
    month_limit = 12; 
    
    // 6개월 리스트 만들기
    for(var i = 1; i <= months; i++){
      month = parseFloat(beforeMonth)+i;
      if(month> month_limit){ 
        year = (parseFloat(beforeYear) + 1).toString();
        month -= month_limit;
      }
      tempArr.push({
        value:year + Tw.PERIOD_UNIT.YEAR + ' ' + month + Tw.PERIOD_UNIT.MONTH,
        attr: 'data-year = \''+ year + '\' data-month=\''+ month + '\'',
        // option:(this.selectedYear === year && this.selectedMonth === month.toString()) ? 'checked' : ''
      });
      keyArr.push(this._getStrYearMonth(year, month));
    }

    this.monthActionSheetListData = [{
      list: tempArr.reverse()
    }];

    if (type === 'key') {
      return _.reduce(keyArr, function(prev, key_name){
        prev[key_name] = [];
        return prev;
      }, {});
    }
  },

  // get From To
  _getQueryFromTo: function(prev_year, prev_month, year, month) {
    var firstDate = prev_year + (prev_month.toString().length < 2 ? '0' : '') + prev_month + '01';
    var firstEndDate = year + (month.toString().length < 2 ? '0' : '') + month + '01';
    return {
      fromDt: firstDate,
      toDt: Tw.DateHelper.getEndOfMonth(firstEndDate, 'YYYYMMDD', 'YYYYMMDD')
    }
  },

  // 에러케이스
  _onError: function ($target, res) {
    Tw.Error(res.code, res.msg).pop(null, $target);
  },

  // mock // TODO: delete
  bill_guide_BFF_05_0064: {
    "code": "00",
    "msg": "success",
    "result": {
      "fromDt": "20180716",
      "toDt": "20180723",
      "invDtTotalAmtCharge": "0",
      "useConAmtDetailList": [{
        "payDt": "20180423",
        "payTime": "201804231312125",
        "payFlag": "구글플레이콘텐츠*",
        "useServiceNm": "구글플레이콘텐츠",
        "useServiceCompany": "구글페이 080-234-0051",
        "useCharge": "2200",
        "deductionCharge": "2200"
      }, {
        "payDt": "20180423",
        "payTime": "201804231312125",
        "payFlag": "구글플레이콘텐츠*",
        "useServiceNm": "구글플레이콘텐츠",
        "useServiceCompany": "구글페이 080-234-0051",
        "useCharge": "2200",
        "deductionCharge": "2200"
      }],
      "useConAmtMonthList": {
        "invDt": "201802",
        "totUsed": "0",
        "totDeduc": "0",
        "totInvamt": "0"
      }
    }
  }

};