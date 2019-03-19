/**
 * FileName: myt-fare.bill.guide.donation.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */
Tw.MyTFareBillGuideDonation = function (rootEl, resData) {
  this.resData = resData;
  // Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService();

  this.bffListData = null; //원본 리스트 데이터
  this.detailListObj = {
    listData: null,
    curLen: 0, //현재 데이터 카운트
    startCount: 20, // 시작 데이터 카운트
    addCount: 20, // 추가 데이터 카운트
    viewData: [] // 잘라서 넣는 데이터
  };

  this._init();

};

Tw.MyTFareBillGuideDonation.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
  },
  _cachedElement: function () {
    this.$entryTpl = $('#fe-entryTpl');
    this.$entryTplList = $('#fe-entryTplList');

    this.$dateSelect = $('[data-target="dateSelect"]');
    this.$dataResult = $('[data-target="dataResult"]');
    this.$noData = $('[data-target="noData"]');

    this.$detailList = $('[data-target="detailList"]'); // 리스트 영역
    this.$addBtn = $('[data-target="addBtn"]'); // 더보기 버튼
    this.$curNum = $('[data-target="curNum"]'); // curNum

    this.$addBtnArea = $('[data-target="addBtnArea"]'); // 더보기 버튼 영


  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="dateBtn"]', $.proxy(this._dateBtnEvt, this));
    // this.$container.on('click', '[data-target="popupCloseBt"]', $.proxy(this._popupCloseBtEvt, this));
    this.$container.on('click', '[data-target="addBtn"]', $.proxy(this._addView, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  _dateBtnEvt: function (e) {
    var $target = $(e.currentTarget);

    this.selectVal = $target.attr('data-value');

    var param = {
      startDt: this._getPeriod(this.selectVal, 'YYYYMMDD').startDt,
      endDt: this._getPeriod(this.selectVal, 'YYYYMMDD').endDt
    };
    // console.info('[param]', param);

    this._getDonationInfo(param);

  },
  // _popupCloseBtEvt: function () {
  //   this._goLoad('/myt-fare/billguide/guide');
  // },

  _proData: function () { //데이터 가공
    var thisMain = this;
    // Tw.Logger.info('[ _proData ]');
    this.detailListObj.listData = $.extend(true, [], this.bffListData); // deep copy array
    this.detailListObj.curLen = this.detailListObj.listData.length;

    _.map(this.detailListObj.listData, function (item) {
      item.billTcDt = Tw.DateHelper.getShortDate( item.billTcDt );
      item.sponAmt = thisMain._comComma(item.sponAmt);
      return item;
    });
    // Tw.Logger.info('[ _proData end ]', this.detailListObj);
  },
  _ctrlInit: function () {
    this._cachedElement();
    this._dataSplice(this.detailListObj.listData, this.detailListObj.startCount);
    this._svcHbDetailList(this.detailListObj.viewData, this.$detailList, this.$entryTplList);

    this.$curNum.html('( ' + this.detailListObj.curLen + ' )');

    if ( this.detailListObj.curLen <= 0 ) {
      this.$addBtnArea.hide().attr('aria-hidden', true);
    }

  },
  _addView: function () {
    if ( this.detailListObj.curLen <= 0 ) {
      return;
    }

    this._cachedElement();
    this._dataSplice(this.detailListObj.listData, this.detailListObj.addCount);
    this._svcHbDetailList(this.detailListObj.viewData, this.$detailList, this.$entryTplList);

    this.$curNum.html('( ' + this.detailListObj.curLen + ' )');

    // Tw.Logger.info('[ detailListObj.curLen 2 ]', this.detailListObj.curLen);
    if ( this.detailListObj.curLen <= 0 ) {
      this.$addBtnArea.hide().attr('aria-hidden', true);
    }
  },
  //--------------------------------------------------------------------------[API]
  _getDonationInfo: function (param) {

    this._apiService.request(Tw.API_CMD.BFF_05_0038, param)
      .done($.proxy(this._getDonationInfoInit, this, param))
      .fail(function(){
        Tw.CommonHelper.endLoading('.container');
      });
  },
  _getDonationInfoInit: function ( param, res ) {
    // // Tw.Logger.info('[결과] _getRoamingInfoInit', param, res );

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var dataArr = res.result.donationList;
      var totalNum = res.result.totSponAmt;
      var totalCount = res.result.totalCount;

      var resData = {
        startDt: Tw.DateHelper.getShortDate( param.startDt ),
        endDt: Tw.DateHelper.getShortDate( param.endDt ),
        totalNum: this._comComma(totalNum),
        list: dataArr,
        totalCount: totalCount
      };

      this.$dateSelect.hide().attr('aria-hidden', true);
      this.$dataResult.empty();

      if ( dataArr.length === 0 ) {
        this.$dataResult.hide().attr('aria-hidden', true);
        this.$noData.show().attr('aria-hidden', false);
      } else {
        this.$dataResult.show().attr('aria-hidden', false);
        this.$noData.hide().attr('aria-hidden', true);
      }

      this._svcHbDetailList(resData, this.$dataResult, this.$entryTpl);

      // ----------
      /*
      * 상세 내역 리스트
       */
      this.$addBtnArea.show().attr('aria-hidden', false);
      this.$detailList.empty();
      this._listDataInit(dataArr); // 데이터 초기화
      this._proData(); // 데이터 가공
      this._ctrlInit(); // 데이터 뿌려주기
    }
  },

  //--------------------------------------------------------------------------[SVC]
  _listDataInit: function (dataArr) {
    /*
    * 데이터 초기화
     */
    this.bffListData = dataArr;
    this.detailListObj.listData = null;
    this.detailListObj.curLen = 0;
    this.detailListObj.viewData = [];

  },
  _dataSplice: function (listData, count) {
    var tempListData = listData;
    var tempCount = count;
    var spliceData = tempListData.splice(0, tempCount);
    this.detailListObj.viewData = spliceData;
    this.detailListObj.curLen = this.detailListObj.listData.length;
    // Tw.Logger.info('[ _dataSplice end ]', this.detailListObj);
  },
  _getPeriod: function ($selectVal, formatStr) {

    var selectVal = $selectVal;
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

    // console.info('[ 선택한 날짜 ]', dateArray[selectVal]);

    var startDt = dateArray[selectVal];
    var endDt = moment().format(formatStr);

    // switch( selectVal ) {
    //   case 0:
    //     // Tw.Logger.info('[전일]', 0);
    //     break;
    //   case 1:
    //     // Tw.Logger.info('[1주일]', 1);
    //     break;
    //   case 2:
    //     // Tw.Logger.info('[3주일]', 2);
    //     break;
    //   case 3:
    //     // Tw.Logger.info('[1개월]', 3);
    //     break;
    //   case 4:
    //     // Tw.Logger.info('[3개월]', 4);
    //     break;
    //   case 5:
    //     // Tw.Logger.info('[6개월]', 5);
    //     break;
    //
    // }

    return {
      startDt: startDt,
      endDt: endDt
    };

  },

  _svcHbDetailList: function (resData, $jqTg, $hbTg) {
    var jqTg = $jqTg;
    var hbTg = $hbTg;
    var source = hbTg.html();
    var template = Handlebars.compile(source);
    var data = {
      resData: resData
    };
    var html = template(data);
    jqTg.append(html);
  },

  //--------------------------------------------------------------------------[COM]
  _comComma: function (str) {
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  }

};