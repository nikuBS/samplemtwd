/**
 * FileName: myt-fare.bill.guide.call-gift.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */
Tw.MyTFareBillGuideCallGift = function (rootEl, resData) {
  this.resData = resData;
  // Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService();

  this._init();

};

Tw.MyTFareBillGuideCallGift.prototype = {
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
    this.$container.on('click', '[data-target="monBtn"]', $.proxy(this._monthBtnEvt, this));
    // this.$container.on('click', '[data-target="popupCloseBt"]', $.proxy(this._popupCloseBtEvt, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  _monthBtnEvt: function (e) {
    // // Tw.Logger.info('[버튼 클릭]', e);
    var $target = $(e.currentTarget);
    this.selectMonthVal = $target.attr('data-value');

    // // Tw.Logger.info('[선택 값]', this.selectMonthVal);

    var param = {
      startDt: this._getPeriod(this.selectMonthVal, 'YYYYMMDD').startDt,
      endDt: this._getPeriod(this.selectMonthVal, 'YYYYMMDD').endDt
    };

    // // Tw.Logger.info('[버튼 클릭 > param]', param);
    this._getCallGiftInfo(param);
  },
  // _popupCloseBtEvt: function () {
  //   this._goLoad('/myt-fare/billguide/guide');
  // },
  //--------------------------------------------------------------------------[API]
  _getCallGiftInfo: function (param) {
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_05_0045, param)
      .done($.proxy(this._getCallGiftInfoInit, this))
      .fail(function(err){
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });
  },
  _getCallGiftInfoInit: function (res) {
    Tw.CommonHelper.endLoading('.container');
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var resObj = this._svcToTimeObj(res.result.callData);
      this.$dateSelect.hide();

      if ( resObj.totalSec === 0 ) {
        // // Tw.Logger.info('[콜기프트 > 이용내역이 없습니다. ]', resObj.totalSec);
        this.$dataResult.hide();
        this.$noData.show();
      } else {
        this.$dataResult.show();
        this.$noData.hide();
      }

      var resData = {
        hh: resObj.hh,
        mm: resObj.mm,
        ss: resObj.ss,
        startDt: this._getPeriod(this.selectMonthVal, 'YYYY.M.').startDt,
        endDt: this._getPeriod(this.selectMonthVal, 'YYYY.M.').endDt
      };

      this._svcHbDetailList(resData, this.$dataResult, this.$entryTpl);
    }

  },

  //--------------------------------------------------------------------------[SVC]
  _getPeriod: function (periodStr, formatStr) {
    var subtractNum = Number(periodStr);
    var startDt = moment().subtract(subtractNum, 'months').format(formatStr);
    var endDt = moment().format(formatStr);

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
    jqTg.html(html);
  },

  _svcToTimeObj: function (str) {
    // var total_s_val = this._toSecond(str);
    // return this._toHHMMSS(total_s_val);

    return this._toHHMMSS(str);
  },
  //--------------------------------------------------------------------------[COM]
  _toSecond: function (str) {
    var strl = str;
    var m_loc = strl.indexOf(Tw.VOICE_UNIT.MIN); // 분
    var s_loc = strl.indexOf(Tw.VOICE_UNIT.SEC); // 초
    var m_val = Number(strl.slice(0, m_loc).trim());
    var s_val = Number(strl.slice(m_loc + 1, s_loc).trim());
    var total_s_val = (m_val * 60) + s_val; // 초로 변환

    return total_s_val;
  },
  _toHHMMSS: function (num) {
    // console.info('[초]', num);
    var myNum = parseInt(num, 10);
    // console.info('[초 변환]', myNum);

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
  }
};