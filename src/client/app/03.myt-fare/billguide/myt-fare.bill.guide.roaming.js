/**
 * FileName: myt-fare.bill.guide.roaming.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */
Tw.MyTFareBillGuideRoaming = function (rootEl, resData) {
  this.resData = resData;
  // Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService();

  this._init();

  this.selectVal = '';
};

Tw.MyTFareBillGuideRoaming.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
  },
  _cachedElement: function () {
    this.$entryTpl = $('#fe-entryTpl');

    this.$dateSelect = $('[data-target="dateSelect"]');
    this.$dataResult = $('[data-target="dataResult"]');
    this.$noData = $('[data-target="noData"]');
  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="dateBtn"]', $.proxy(this._dateBtnEvt, this));
    // this.$container.on('click', '[data-target="popupCloseBt"]', $.proxy(this._popupCloseBtEvt, this));
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

    this._getRoamingInfo(param);

  },
  // _popupCloseBtEvt: function () {
  //   this._goLoad('/myt-fare/billguide/guide');
  // },
  //--------------------------------------------------------------------------[API]
  _getRoamingInfo: function (param) {

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_05_0044, param)
      .done($.proxy(this._getRoamingInfoInit, this, param))
      .fail(function(){
        Tw.CommonHelper.endLoading('.container');
      });
  },
  _getRoamingInfoInit: function (param, res) {
    // // Tw.Logger.info('[결과] _getRoamingInfoInit', param, res );
    Tw.CommonHelper.endLoading('.container');
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var dataArr = res.result.roamingList;
      var totalNum = 0;

      _.map(dataArr, function (item) {
        totalNum += Number(item.amt);
      });

      // Tw.Logger.info('[totalNum]', totalNum);
      // Tw.Logger.info('[param]', param);

      var resData = {
        startDt: Tw.DateHelper.getShortDateNoDot(param.startDt),
        endDt: Tw.DateHelper.getShortDateNoDot(param.endDt),
        totalNum: this._comComma(totalNum)
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

    }


    // if ( res.code === Tw.API_CODE.CODE_00 ) {
    //   var resObj = this._svcToTimeObj( res.result.roamingList );
    //
    //   this.$dateSelect.hide();
    //
    //   if ( resObj.totalSec === 0 ) {
    //     // // Tw.Logger.info('[콜기프트 > 이용내역이 없습니다. ]', resObj.totalSec);
    //     this.$dataResult.hide();
    //     this.$noData.show();
    //   } else {
    //     this.$dataResult.show();
    //     this.$noData.hide();
    //   }
    //
    //   var resData = {
    //     hh: resObj.hh,
    //     mm: resObj.mm,
    //     ss: resObj.ss,
    //     startDt: this._getPeriod(this.selectMonthVal, 'YYYY.MM.DD').startDt,
    //     endDt: this._getPeriod(this.selectMonthVal, 'YYYY.MM.DD').endDt
    //   };
    //
    //   this._svcHbDetailList(resData, this.$dataResult, this.$entryTpl);
    // }

  },

  //--------------------------------------------------------------------------[SVC]
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

  _svcToTimeObj: function (str) {
    var total_s_val = this._toSecond(str);
    return this._toHHMMSS(total_s_val);
  },
  //--------------------------------------------------------------------------[COM]
  _toSecond: function (str) {
    var strl = str;
    var m_loc = strl.indexOf('분'); // 분
    var s_loc = strl.indexOf('초'); // 초
    var m_val = Number(strl.slice(0, m_loc).trim());
    var s_val = Number(strl.slice(m_loc + 1, s_loc).trim());
    var total_s_val = (m_val * 60) + s_val; // 초로 변환

    return total_s_val;
  },
  _toHHMMSS: function (num) {
    var myNum = parseInt(num, 10);
    var hour = Math.floor(myNum / 3600);
    var minute = Math.floor((myNum - (hour * 3600)) / 60);
    var second = myNum - (hour * 3600) - (minute * 60);

    if ( hour < 10 ) {
      hour = '0' + hour;
    }
    if ( minute < 10 ) {
      minute = '0' + minute;
    }
    if ( second < 10 ) {
      second = '0' + second;
    }

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
  }

};