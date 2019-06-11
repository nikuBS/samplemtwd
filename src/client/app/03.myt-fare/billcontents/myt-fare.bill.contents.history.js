/**
 * @file [콘텐츠결제-결제내역-리스트] 관련 처리
 * @author Lee kirim
 * @since 2018-11-29
 */

 /**
 * @class 
 * @desc 결제내역 리스트를 위한 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - myt-fare.bill.contents.history.controlloer.ts 로 부터 전달되어 온 내역 정보
 */
Tw.MyTFareBillContentsHitstory = function (rootEl, data) {
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

/**
 * @desc 처음 진입 시 인증하기 버튼만 노출 
 * 인증하기 버튼 클릭시 인증작업이 호출되고 완료 시 해당 API 반환값을 받는다
 * 모든 데이터를 가지고 있다가 선택하는 년월에 따라 데이터 리스트를 보여주고
 * 상세보기를 클릭하면 팝업 형태로 해당 데이터를 제공함
 */
Tw.MyTFareBillContentsHitstory.prototype = {
  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 동작에 필요한 내부 변수를 정의 한다.
   * - limitLength 한번에 노출되는 갯수 20
   * - monthActionSheetListData 셀렉트박스 선택시 (월 선택) 노출시킬 리스트 
   * - totalList 모든 리스트 _setMonthList 함수를 호출 해 모든 리스트를 저장할 객체 형태 만듬 이 함수에서 monthActionSheetListData도 저장함
   * - list 렌더링 대상 리스트
   * - totalCnt 현재 선택된 리스트 갯수
   * - selectedYear 선택된 년도 초기값 확인(파라미터 값 또는 현재 년도)
   * - selectedMonth 선택된 월 초기값 확인(파라미터 값 또는 현재 월)
   * - _getQueryFromTo 를 호출하고 extend로 this.fromDt, this.toDt를 설정한다.
   * @return {void}
   */
  _init: function () {
    this.limitLength = Tw.DEFAULT_LIST_COUNT; // 한번에 노출될 리스트 갯수
    this.monthActionSheetListData = null; //현재로부터 지난 6개월 구하기 (액션시트 선택)
    /**
     * @prop
     * 형태 Array<{YYYYMM: []}> 조회할 월을 선택하면 해당 YYYYMM 키값으로 리스트를 찾아 렌더링 한다
     */
    this.totalList = this._setMonthList(this.data.beforeYear, this.data.beforeMonth, 6, 'key');
    this.list = [];
    this.totalCnt = 0; 

    this.selectedYear = this._params.year || this.data.curYear;
    this.selectedMonth = this._params.month || this.data.curMonth;
    $.extend(this, this._getQueryFromTo(this.data.beforeYear, this.data.beforeMonth, this.data.curYear, this.data.curMonth)); // get fromDt, toDt,
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - myt-fare.bill.contents.history.html 참고
   */
  _cachedElement: function () {
    this.$btnShowList = this.$container.find('.fe-show-list'); // 조회하기 버튼
    this.$tempListWrap = Handlebars.compile($('#fe-list-wrap').html());
    this.$tempList = Handlebars.compile($('#list-default').html());
    Handlebars.registerPartial('list', $('#list-default').html());
    Handlebars.registerPartial('empty', $('#list-empty').html()); // 내역 없을 시 
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    // 인증하기 클릭 이벤트
    this.$btnShowList.on('click', $.proxy(this._certShowLists, this));
  },

  /**
   * @desc 인증업무 버튼 클릭으로 인증 시작
   */
  _certShowLists: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0205,{
      fromDt: this.fromDt,
      toDt: this.toDt
    }).done($.proxy(this._callbackShowLists, this))
    .fail($.proxy(this._onError, this, this.$btnShowList));
  },

  /**
   * @desc 인증 성공으로 데이터가 내려왔을 때 처리
   * @param {JSON} res 
   */
  _callbackShowLists: function (res) {
    if ( res.code !== Tw.API_CODE.CODE_00 ) {
      return this._onError(this.$btnShowList, res);
    }

    $.extend(this.totalList, this._devData(this._convData(res)));
    
    this._showWholeList();
    
  },
  
  /**
   * @method
   * @desc 리스트 렌더링 함수 호출 / 인증업무 완료 후 리스트 표기시, 월선택으로 리스트 교체시
   */
  _showWholeList: function () {
    // 결과 노출
    this._showLists(this.totalList[this._getStrYearMonth(this.selectedYear, this.selectedMonth)]);

    // 이벤트 바인드
    this._afterShowListEvent();

    // 더보기 버튼 여부
    this._showMoreBtn();
  },

  /**
   * @desc 리스트 렌더링 후 엘리먼트 설정, 이벤트 바인드 
   * 더보기로 리스트가 추가될 때도 호출됨
   */
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

    // 상세보기 이벤트 
    this.$container.find('.fe-yet-evented').removeClass('fe-yet-evented').on('click', '.fe-detail-link', $.proxy(this._moveDetailPage,this));
  },

  /**
   * @function
   * @desc 응답값으로 부터 결과 가공
   * 기존 응답값에 필요한 결과 데이터를 추가해 반환한다
   * 결과배열을 역정렬해서 반환함(최근내역이 뒤로 가서 조회되어 FE에서 수정해 표기)
   * @param {JSON} res 
   * @returns {Array<object>}
   */
  _convData: function (res) {
    if (res && res.result && 
        res.result.useConAmtDetailList !== undefined && 
        Array.isArray(res.result.useConAmtDetailList)
      ) {
        return _.map(res.result.useConAmtDetailList.reverse(), function(o, index) {
          return $.extend(o, {
            listId: index,
            useServiceNm: o.useServiceNm || o.payFlag, 
            FullDate: Tw.DateHelper.getFullDateAnd24Time(o.payTime),
            useAmt: Tw.FormatHelper.addComma(o.useCharge), // 이용금액
            dedAmt: Tw.FormatHelper.addComma(o.deductionCharge) // 공제금액
          });
        });
    } else {
      return [];
    }
  },

  /**
   * @function
   * @desc 주어진 파라미터로 문자열형태로 반환
   * @param {number} year 년도
   * @param {number} month 월
   * @return {string} YYYYMM 
   */
  _getStrYearMonth: function (year, month) {
    return year + (month.toString().length < 2 ? '0' : '') + month;
  },

  /**
   * @function
   * @desc convData 결과값으로 온 데이터를 YYYYMM: [] 형태로 반환 -> this.totalList 에 확장
   * @param {Array<object>} arr 
   * @returns {Object<{YYYYMM:Array<object>}>}
   */
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

  /**
   * @desc this.totalList 에서 YYYYMM 키값으로 선택된 배열을 리스트로 렌더링
   * this.list 에 전달된 리스트를 concat 하고 list를 splice로 삭제하며 렌더링함
   * @param {object[]} list 
   * @return {function}
   */
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

  /**
   * @method
   * @desc 더보기 버튼 클릭 이벤트 실행 리스트 렌더링 해서 붙임
   * 상세보기 클릭 이벤트 바인드
   * 더보기 여부 결정
   */
  _showMoreList: function () {
    this.$container.find('.fe-lists').append(this.$tempList({
      list: this.list.splice(0, this.limitLength)
    }));

    // 이벤트 바인드
    this._afterShowListEvent();

    // 더보기 여부
    this._showMoreBtn();
  },

  /**
   * @method
   * @desc 더보기 버튼 노출 여부 결정
   * this.list 남은 리스트 갯수가 있으면 더보기 버튼을 노출함
   */
  _showMoreBtn: function () {
    if (this.list.length) {
      this.$moreBtn.removeClass('none').attr('aria-hidden', false);
    } else {
      this.$moreBtn.addClass('none').attr('aria-hidden', true);
    }
  },

  /**
   * @desc 월 선택 셀렉트 박스를 노출함
   * @param {event} e 
   */
  _showSelectMonth: function (e) {
    /**
     * @function 
     * @param {Object} {hbs: hbs 의 파일명, layer: 레이어 여부, title: 액션시트 제목, data: 데이터 리스트, btnfloating: {txt: 닫기버튼 문구, attr: 닫기버튼 attribute, class: 닫기버튼 클래스}}
     * @param {function} function_open_call_back 액션시트 연 후 호출 할 function
     * @param {function} function_close_call_back 액션시트 닫힌 후 호출할 function
     * @param {string} 액션시트 열 때 지정할 해쉬값, 기본값 popup{n}
     * @param {Object} $target 액션시트 닫힐 때 포커스 될 엘리먼트 여기에서는 카테고리 선택 버튼
     * @desc 라디오 선택 콤보박스 형태
     */
    return this._popupService.open({
      hbs: 'actionsheet01',// hbs의 파일명
      layer: true,
      title: Tw.POPUP_TITLE.SELECT,
      data: this._setMonthActionSheetData(),
      btnfloating: { 'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, 
      $.proxy(this._openMonthSelectHandler, this), // 액션시트 열린 후 콜백 
      null, 
      null, // 해쉬네임
      $(e.currentTarget) // 팝업 닫힌 후 포커스 이동될 버튼 객체
    );
  },

  /**
   * @function
   * @member
   * @desc 월 선택 액션시트 열린 후 callback function
   * - 선택된 월 라디오 버튼에 checked 처리
   * - 각 리스트에 클릭 이벤트 바인드 -> 라디오 버튼 체인지 이벤트를 발생 시킴
   * @param {Object} $sheet 월 선택 액션시트 wraper 엘리먼트
   * @returns {void}
   */
  _openMonthSelectHandler: function ($sheet) {
    // 해당 년 월 선택
    var year = parseFloat(this.selectedYear), month = parseFloat(this.selectedMonth);

    // 선택된 목록에 체크표기
    $sheet.find('li').filter(function(){
        var $input = $(this).find('input');
        return parseFloat($input.data('year')) === year && parseFloat($input.data('month')) === month;
      })
      .attr('aria-selected', true).find('input').prop('checked', true)
      .end().siblings().attr('aria-selected', false);

    // 클릭 이벤트 바인드
    $sheet.find('li').on('click', $.proxy(this._updateContentsPayList, this));
  },

  /**
   * @function
   * @member
   * @desc 선택된 년/월로 수정 후 리스트 렌더링 함수 호출
   * @param {event} e 
   * @returns {void}
   */
  _updateContentsPayList: function (e) {
    var year = $(e.currentTarget).find('input').data('year') || this.data.curYear;
    var month = $(e.currentTarget).find('input').data('month') || this.data.curMonth; 
    //선택표기
    $(e.currentTarget).attr('aria-selected', true).siblings().attr('aria-selected', false);
    $(e.currentTarget).find('input[type=radio]').prop('checked', true);
    // 선택 text
    this.$selectMonth.text(month + Tw.PERIOD_UNIT.MONTH);

    // popup close
    this._popupService.close();

    // 월 교체
    this.selectedYear = year;
    this.selectedMonth = month;
    this.$moreBtn = null;
    this.$selectMonth = null;

    this._showWholeList();

  },

  /**
   * @desc 상세보기 이벤트 
   * @param {event} e 
   */
  _moveDetailPage: function (e) {
    var $target = $(e.currentTarget);
    var thisData = this._getDetailData($target.data('listDate'), $target.data('listId'));
    this._popupService.open(
      $.extend({
          hbs: 'MF_07_01_01',
          layer: true
        }, 
        thisData
      ),
      $.proxy(this._detailPageCallback, this),
      null, null,
      $target
    );
  },

  /**
   * @desc listDate 키값을 기준으로 listId 를 찾아 반환
   * @param {date>number} listDate 
   * @param {number} listId 
   * @returns {object}
   */
  _getDetailData: function(listDate, listId) {    
    var curList = this.totalList[listDate.toString().substr(0,6)];
    var result;
    if (!Tw.FormatHelper.isEmpty(curList)) {
      result = _.reduce(curList, function(prev, o){
        if (o.listId === listId) {
          return o;
        } else {
          return prev;
        }
      }, {});
    } else {
      result = {}
    }
    return result;
  },

  /**
   * @desc 상세보기 팝업에서 이벤트 바인드 
   * @param {object} thisData 
   * @param {Element} $template 
   */
  _detailPageCallback: function ($template) {
    // 외부 링크 클릭시 이벤트
    $template.on('click', '.fe-link-external', $.proxy(this._openConfirmUrl, this));
  },

  /**
   * @function
   * @desc 외부링크 클릭시 데이터 과금 안내 확인 팝업 호출(앱일 경우)
   * @param {event} e 
   */
  _openConfirmUrl: function (e) {
    e.preventDefault();
    e.stopPropagation();

    var url = $(e.currentTarget).attr('href');

    if (Tw.BrowserHelper.isApp()) {
      return Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, url));
    } else {
      return this._openExternalUrl(url);
    }
  },

  /**
   * @function
   * @desc 지정된 URL 로 이동
   * @param {string} url 이동할 경로
   */
  _openExternalUrl: function (url) {
    Tw.CommonHelper.openUrlExternal(url);
  },

  /**
   * @desc 월 선택 액션시트에 사용될 데이터 반환
   * @return {array}
   */
  _setMonthActionSheetData: function () {
    return this.monthActionSheetListData || this._setMonthList(this.data.beforeYear, this.data.beforeMonth, 6); // 캐싱된것 or 함수 실행
  },

  /**
   * @desc this.monthActionSheetListData 를 만듬
   * type 값이 key 값이면 반환 조회된 리스트를 월별로 저장할 수 있는 객체 형태를 만듬
   * @param {number} beforeYear 년도
   * @param {number} beforeMonth 월
   * @param {number} months 개월 수
   * @param {string} type 옵션값
   */
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
        txt: year + Tw.PERIOD_UNIT.YEAR + ' ' + month + Tw.PERIOD_UNIT.MONTH,
        'radio-attr': 'data-index="' + (i - 1) + '"' + 
                      'data-year = \''+ year + '\' data-month=\''+ month + '\'' 
      });
      keyArr.push(this._getStrYearMonth(year, month));
    }

    this.monthActionSheetListData = [{
      list: tempArr.reverse()
    }];

    /**
     * @returns {Array<{YYYYMM: []}>} 
     */
    if (type === 'key') {
      return _.reduce(keyArr, function(prev, key_name){
        prev[key_name] = [];
        return prev;
      }, {});
    }
  },

  /**
   * @method
   * @desc 주어진 파라미터로 API 조회시 필요한 형태 문자열을 저장한 객체를 반환
   * prev_year/prev_month -> fromDt 
   * year, month -> toDt
   * @param {number} prev_year 
   * @param {number} prev_month 
   * @param {number} year 
   * @param {number} month 
   * @return {Object<{fromDt: YYYYMM01, toDt: YYYYMM31}>}
   */
  _getQueryFromTo: function(prev_year, prev_month, year, month) {
    var firstDate = prev_year + (prev_month.toString().length < 2 ? '0' : '') + prev_month + '01';
    var firstEndDate = year + (month.toString().length < 2 ? '0' : '') + month + '01';
    return {
      fromDt: firstDate,
      toDt: Tw.DateHelper.getEndOfMonth(firstEndDate, 'YYYYMMDD', 'YYYYMMDD')
    }
  },

  /**
   * @desc API 호출 반환값이 에러일경우 에러 팝업 노출되도록 처리
   * @param {Element} $target 팝업닫은후 포커스 이동될 DOM 객체 
   * @param {JSON} res 반환값
   */
  _onError: function ($target, res) {
    /**
     * @param {function} 팝업 닫힌 후 실행될 callback function
     * @param {element} 팝업 닫힌 후 포커스 이동할 DOM 객체 (웹접근성 반영)
     */
    Tw.Error(res.code, res.msg).pop(null, $target);
  },

};
