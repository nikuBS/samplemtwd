/**
 * FileName: myt-fare.bill.guide.donation.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */
Tw.MyTFareBillGuideDonation = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();

  this.bffListData = null; //원본 리스트 데이터
  this.detailListObj = {
    listData: null,
    curLen : 0, //현재 데이터 카운트
    startCount: 2, // 시작 데이터 카운트
    addCount: 2, // 추가 데이터 카운트
    viewData: [] // 잘라서 넣는 데이터
  };

};

Tw.MyTFareBillGuideDonation.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
  },
  _cachedElement: function () {
    this.$entryTpl = $('#fe-entryTpl');
    this.$entryTplList = $('#fe-entryTplList');

    this.$dateSelect= $('[data-target="dateSelect"]');
    this.$dataResult= $('[data-target="dataResult"]');
    this.$noData= $('[data-target="noData"]');

    this.$detailList = $('[data-target="detailList"]'); // 리스트 영역
    this.$addBtn = $('[data-target="addBtn"]'); // 더보기 버튼
    this.$curNum = $('[data-target="curNum"]'); // curNum

    this.$addBtnArea = $('[data-target="addBtnArea"]'); // 더보기 버튼 영


  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="dateBtn"]', $.proxy(this._dateBtnEvt, this));
    this.$container.on('click', '[data-target="popupCloseBt"]', $.proxy(this._popupCloseBtEvt, this));
    this.$container.on('click', '[data-target="addBtn"]', $.proxy(this._addView, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  _dateBtnEvt: function(e) {
    var $target = $(e.currentTarget);
    var formatStr = 'YYYYMMDD';

    this.selectVal = $target.attr('data-value');

    // var param = {
    //   startDt : this._getPeriod(this.selectVal, 'YYYYMMDD').startDt,
    //   endDt: this._getPeriod(this.selectVal, 'YYYYMMDD').endDt,
    // };
    // this._getRoamingInfo( param );

    this._getDonationInfo();
  },
  _popupCloseBtEvt: function() {
    this._goLoad('/myt/fare/bill/guide');
  },

  _proData: function() { //데이터 가공
    var thisMain = this;
    Tw.Logger.info('[ _proData ]');
    this.detailListObj.listData = $.extend(true, [], this.bffListData); // deep copy array
    this.detailListObj.curLen = this.detailListObj.listData.length;

    _.map(this.detailListObj.listData, function( item ) {
      item.billTcDt = moment(item.billTcDt, "YYYYMMDD").format('YYYY.MM.DD');
      item.sponAmt = thisMain._comComma( item.sponAmt );
      return item;
    });
    Tw.Logger.info('[ _proData end ]', this.detailListObj);
  },
  _ctrlInit: function() {
    this._cachedElement();
    this._dataSplice( this.detailListObj.listData, this.detailListObj.startCount );
    this._svcHbDetailList(this.detailListObj.viewData, this.$detailList, this.$entryTplList);

    this.$curNum.html('( ' + this.detailListObj.curLen + ' )');

    if( this.detailListObj.curLen <= 0 ) {
      this.$addBtnArea.hide();
    }

  },
  _addView: function() {
    if ( this.detailListObj.curLen <= 0 ) { return; }

    this._cachedElement();
    this._dataSplice( this.detailListObj.listData, this.detailListObj.addCount );
    this._svcHbDetailList(this.detailListObj.viewData, this.$detailList, this.$entryTplList);

    this.$curNum.html('( ' + this.detailListObj.curLen + ' )');

    Tw.Logger.info('[ detailListObj.curLen 2 ]', this.detailListObj.curLen);
    if( this.detailListObj.curLen <= 0 ) {
      this.$addBtnArea.hide();
    }
  },
  //--------------------------------------------------------------------------[API]
  _getDonationInfo: function(param) {
    var thisMain = this;
    // return this._apiService.request(Tw.API_CMD.BFF_05_0044, param).done($.proxy(this._getRoamingInfoInit, this));
    $.ajax('http://localhost:3000/mock/myt.bill.billguide.donation.BFF_05_0038.json')
      .done(function(resp){
        Tw.Logger.info(resp);
        thisMain._getDonationInfoInit(resp);
      })
      .fail(function(err) {
        Tw.Logger.info(err);
      });
  },
  _getDonationInfoInit: function(res) {

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var dataArr = res.result.donationList;
      var totalNum = res.result.totSponAmt;
      var totalCount = res.result.totalCount;

      var resData = {
        startDt: '2018.09.27',
        endDt: '2018.09.28',
        totalNum: this._comComma(totalNum),
        list: dataArr,
        totalCount: totalCount
      };

      this.$dateSelect.hide();
      this.$dataResult.empty();

      if ( dataArr.length === 0 ) {
        this.$dataResult.hide();
        this.$noData.show();
      } else {
        this.$dataResult.show();
        this.$noData.hide();
      }

      this._svcHbDetailList(resData, this.$dataResult, this.$entryTpl);

      // ----------
      /*
      * 상세 내역 리스트
       */
      this.$addBtnArea.show();
      this.$detailList.empty();
      this._listDataInit(dataArr); // 데이터 초기화
      this._proData(); // 데이터 가공
      this._ctrlInit(); // 데이터 뿌려주기
    }
  },

  //--------------------------------------------------------------------------[SVC]
  _listDataInit: function(dataArr) {
    /*
    * 데이터 초기화
     */
    this.bffListData = dataArr;
    this.detailListObj = {
      listData: null,
      curLen : 0, //현재 데이터 카운트
      startCount: 2, // 시작 데이터 카운트
      addCount: 2, // 추가 데이터 카운트
      viewData: [] // 잘라서 넣는 데이터
    };

  },
  _dataSplice: function( listData, count ) {
    var tempListData = listData;
    var tempCount = count;
    var spliceData = tempListData.splice(0, tempCount);
    this.detailListObj.viewData = spliceData;
    this.detailListObj.curLen = this.detailListObj.listData.length;
    Tw.Logger.info('[ _dataSplice end ]', this.detailListObj);
  },
  _getPeriod: function( selectVal, formatStr ) {

    var selectVal = selectVal;
    var dateArray = [];

    var dayBefore;  // 전일
    var oneWeek;    // 1주일
    var threeWeek;  // 3주일
    var oneMonth;   // 1개월
    var threeMonth; // 3개월
    var sixMonth;   // 6개월

    dayBefore = moment().subtract(1, 'days').format(formatStr);
    oneWeek = moment().subtract(1, 'weeks').format(formatStr);
    threeWeek = moment().subtract(3, 'weeks').format(formatStr);
    oneMonth = moment().subtract(1, 'months').format(formatStr);
    threeMonth = moment().subtract(3, 'months').format(formatStr);
    sixMonth = moment().subtract(6, 'months').format(formatStr);

    dateArray[0] = dayBefore;
    dateArray[1] = oneWeek;
    dateArray[2] = threeWeek;
    dateArray[3] = oneMonth;
    dateArray[4] = threeMonth;
    dateArray[5] = sixMonth;

    console.info( '[ 선택한 날짜 ]', dateArray[selectVal] );

    var startDt = dateArray[selectVal];
    var endDt = moment().subtract(1, 'days').format(formatStr);

    switch( selectVal ) {
      case 0:
        Tw.Logger.info('[전일]', 0);
        break;
      case 1:
        Tw.Logger.info('[1주일]', 1);
        break;
      case 2:
        Tw.Logger.info('[3주일]', 2);
        break;
      case 3:
        Tw.Logger.info('[1개월]', 3);
        break;
      case 4:
        Tw.Logger.info('[3개월]', 4);
        break;
      case 5:
        Tw.Logger.info('[6개월]', 5);
        break;

    }

    return {
      startDt: startDt,
      endDt: endDt
    }

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

  _svcToTimeObj: function(str) {
    var total_s_val = this._toSecond(str);
    return this._toHHMMSS(total_s_val);
  },
  //--------------------------------------------------------------------------[COM]
  _toSecond: function(str) {
    var strl = str;
    var m_loc = strl.indexOf('분'); // 분
    var s_loc = strl.indexOf('초'); // 초
    var m_val = Number( strl.slice(0, m_loc).trim() );
    var s_val = Number( strl.slice(m_loc + 1, s_loc).trim() );
    var total_s_val = (m_val * 60) + s_val; // 초로 변환

    return total_s_val
  },
  _toHHMMSS: function(num) {
    var myNum = parseInt(num, 10);
    var hour = Math.floor(myNum / 3600);
    var minute = Math.floor( (myNum - (hour * 3600)) / 60 );
    var second = myNum - (hour * 3600) - (minute * 60);

    if (hour < 10) { hour = '0' + hour; }
    if (minute < 10) { minute = '0' + minute; }
    if (second < 10) { second = '0' + second; }

    return {
      totalSec: myNum,
      hh: hour,
      mm: minute,
      ss: second,
      hhmmss: hour + ':' + minute + ':' + second
    };
  },
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