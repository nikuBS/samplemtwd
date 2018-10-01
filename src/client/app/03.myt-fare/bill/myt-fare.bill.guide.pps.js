/**
 * FileName: myt-fare.bill.guide.pps.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */
Tw.MyTFareBillGuidePps = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this.selDateObj = {
    curDt: null, // 현재 date
    defaultDt: null, // 기준 date
    startDt: null, // start date
    endDt: null, // end date
    startRangeNum: 6,
    endRangeNum: 3,
    selectList: null
  };

  this.bffListData = null; //원본 리스트 데이터
  this.detailListObj = {
    listData: null,
    curLen : 0, //현재 데이터 카운트
    startCount: 2, // 시작 데이터 카운트
    addCount: 2, // 추가 데이터 카운트
    viewData: [] // 잘라서 넣는 데이터
  };

  this._init();
};

Tw.MyTFareBillGuidePps.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
    this._dateInit();
  },
  _cachedElement: function () {
    this.$startDtBtn = $('[data-target="startDtBtn"]'); // 조회 기간 선택(시작)
    this.$endDtBtn = $('[data-target="endDtBtn"]'); // 조회 기간 선택(끝)

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="startDtBtn"]', $.proxy(this._startDtBtnEvt, this));
    this.$container.on('click', '[data-target="endDtBtn"]', $.proxy(this._endDtBtnEvt, this));
    this.$container.on('click', '[data-target="searchBtn"]', $.proxy(this._searchBtnEvt, this));

  },
  //--------------------------------------------------------------------------[EVENT]
  _startDtBtnEvt: function(event) {
    var listData = this.selDateObj.selectList;
    this._selectDatePopEvt(event, 'start', listData);

  },
  _endDtBtnEvt: function(event) {
    var listData = this.selDateObj.selectList;
    this._selectDatePopEvt(event, 'end', listData);
  },
  _selectDatePopEvt: function(event, state, listData) {
    var $target = $(event.currentTarget);
    var hbsName = 'actionsheet_select_a_type';
    var data = [{
      list: null
    }];
    var hashName = 'selectDatePopEvt';

    data[0].list = listData;

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: data,
        title: Tw.MYT_FARE_BILL_GUIDE.POP_TITLE_TYPE_0
      },
      $.proxy(this._selectDatePopEvtInit, this, $target, state),
      $.proxy(this._selectDatePopEvtClose, this, $target),
      hashName);

  },
  _selectDatePopEvtInit: function($target, state, $layer) {

    var selectVal = $target.attr('data-value').slice(0, 6);
    /*
    * 1. 이벤트 설정
    * 2. 현재 선택된 날짜 체크
     */
    $layer.on('click', '[data-target="selectBtn"]', $.proxy(this._setSelectedValue, this, $target, state));
    var $selectBtnTg = $layer.find('[data-value="' + selectVal + '"]');
    $selectBtnTg.addClass('checked');

  },
  _setSelectedValue: function ($target, state, event) {

    var $tg = $(event.currentTarget);
    var $parentTg = $tg.closest('.chk-link-list');
    var selectDateVal = '';

    /*
    * 1. 모든 checked 클래스 제거
    * 2. 선택한 버튼에 checked 추가
    * 3. 선택한 값을 input > value 에 적용
     */
    $parentTg.find('button').removeClass('checked');
    $tg.addClass('checked');

    selectDateVal = $tg.attr('data-value');
    console.info('selectDateVal', selectDateVal);

    var momentObj = moment(selectDateVal, 'YYYYMM');

    var dataVal;
    if ( state === 'start') {
      dataVal = momentObj.startOf('month').format('YYYYMM');
      this.selDateObj.startDt = dataVal;
    } else {
      dataVal = momentObj.endOf('month').format('YYYYMM');
      this.selDateObj.endDt = dataVal;
    }
    $target.attr( 'data-value', dataVal);
    $target.text( momentObj.format('YYYY.MM') );

    Tw.Logger.info(this.selDateObj);



  },
  _selectDatePopEvtClose: function($target, $layer) {
    Tw.Logger.info('[팝업 닫기 : actionsheet_select_a_type]');
    this._popupService.close();
  },

  _searchBtnEvt: function(event) {

    var momentStart = moment(this.selDateObj.startDt, 'YYYYMM');
    var momentEnd = moment(this.selDateObj.endDt, 'YYYYMM');

    var diffMontsVal = momentEnd.diff(momentStart, 'months'); // end - start = 비교

    if (diffMontsVal >= 0) {

      if (diffMontsVal <= this.selDateObj.endRangeNum) {
        // 유효성 완료, 조회 진행
        Tw.Logger.info('[유효성 완료, 조회 진행] ');
        console.info('[selDateObj] ', this.selDateObj);
        this._getHistoriesInfo();

      } else {
        // 검색 범위 초과
        Tw.Logger.info('[검색 범위 초과] ');
      }

    } else {
      // end 값이 큰 경우
      Tw.Logger.info('[end 값이 큰 경우] ');
    }
    Tw.Logger.info('[end - start = 비교] ', diffMontsVal);

  },


  //--------------------------------------------------------------------------[API]
  _getHistoriesInfo: function() {
    return this._apiService.request(Tw.API_CMD.BFF_05_0014, {
      startMM: this.selDateObj.startDt,
      endMM: this.selDateObj.endDt
    }).done($.proxy(this._getHistoriesInfoInit, this));
  },
  _getHistoriesInfoInit: function(res) {
    var thisMain = this;

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.Logger.info('[res] ', res);
    }
  },
  //--------------------------------------------------------------------------[SVC]
  _dateInit: function() {
    this.selDateObj.curDt = moment().format('YYYYMM'); // 현재
    this.selDateObj.defaultDt = moment().subtract('1', 'months').format('YYYYMM'); // 기준
    this.selDateObj.startDt = this.resData.commDataInfo.ppsStartDateVal; // start date
    this.selDateObj.endDt = this.resData.commDataInfo.ppsEndDateVal; // end date

    /*
    * 선택 데이터 리스트
     */
    this.selDateObj.selectList = [];
    for (var i=1, len=this.selDateObj.startRangeNum; i<=len; i++) {
      var val = moment().subtract(i, 'months').format('YYYY년 MM월');
      var defaultVal = moment().subtract(i, 'months').format('YYYYMM');

      var pushData = {
        value: val,
        option: '',
        attr:'data-value="' + defaultVal + '", data-target="selectBtn"'
      };

      this.selDateObj.selectList.push( pushData );
    }

    console.info('[selDateObj] ', this.selDateObj);


  },
  _setStartList: function( str ) {
    var defaultNum = Number(str);
    console.info('_getStartList :', defaultNum);

  },







  _svcHbDetailList: function( resData, $jqTg, $hbTg ) {
    var jqTg = $jqTg;
    var hbTg = $hbTg;
    var source = hbTg.html();
    var template = Handlebars.compile(source);
    var data = {
      resData : resData
    };
    var html = template(data);
    jqTg.append(html);
  },

  //--------------------------------------------------------------------------[COM]
  _comComma: function (str) {
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  },
  _comUnComma: function (str) {
    str = String(str);
    // return str.replace(/[^\d]+/g, '');
    return str.replace(/,/g, '');
  },
  _phoneStrToDash: function (str) {
    var str = String(str);
    return str.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
  },
  _goBack: function () {
    this._history.go(-1);
  },
  _goLoad: function (url) {
    location.href = url;
  },
  _go: function (hash) {
    this._history.setHistory();
    window.location.hash = hash;
  }

};