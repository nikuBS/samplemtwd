/**
 * FileName: myt-fare.bill.guide.call-gift.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */
Tw.MyTFareBillGuideCallGift = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();

};

Tw.MyTFareBillGuideCallGift.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();

  },
  _cachedElement: function () {
    this.$entryTpl = $('#fe-entryTpl');

    this.$dateSelect= $('[data-target="dateSelect"]');
    this.$dataResult= $('[data-target="dataResult"]');
    this.$noData= $('[data-target="noData"]');
  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="monBtn"]', $.proxy(this._monthBtnEvt, this));
    this.$container.on('click', '[data-target="popupCloseBt"]', $.proxy(this._popupCloseBtEvt, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  _monthBtnEvt: function(e) {
    // Tw.Logger.info('[버튼 클릭]', e);
    var $target = $(e.currentTarget);
    this.selectMonthVal = $target.attr('data-value');

    // Tw.Logger.info('[선택 값]', this.selectMonthVal);

    var param = {
      startDt : this._getPeriod(this.selectMonthVal, 'YYYYMMDD').startDt,
      endDt: this._getPeriod(this.selectMonthVal, 'YYYYMMDD').endDt,
    };

    // Tw.Logger.info('[버튼 클릭 > param]', param);
    this._getCallGiftInfo( param );
  },
  _popupCloseBtEvt: function() {
    this._goLoad('/myt/fare/bill/guide');
  },
  //--------------------------------------------------------------------------[API]
  _getCallGiftInfo: function(param) {
    return this._apiService.request(Tw.API_CMD.BFF_05_0045, param).done($.proxy(this._getCallGiftInfoInit, this));
  },
  _getCallGiftInfoInit: function(res) {
    // Tw.Logger.info('[콜기프트]', res);

    if ( res.code === Tw.API_CODE.CODE_00 ) {

      var resObj = this._svcToTimeObj( res.result.callData );
      // Tw.Logger.info('[ resObj ]', resObj);

      this.$dateSelect.hide();

      if ( resObj.totalSec === 0 ) {
        // Tw.Logger.info('[콜기프트 > 이용내역이 없습니다. ]', resObj.totalSec);
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
        startDt: this._getPeriod(this.selectMonthVal, 'YYYY.MM.DD').startDt,
        endDt: this._getPeriod(this.selectMonthVal, 'YYYY.MM.DD').endDt
      };

      this._svcHbDetailList(resData, this.$dataResult, this.$entryTpl);
    }

  },

  //--------------------------------------------------------------------------[SVC]
  _getPeriod: function( periodStr, formatStr ) {
    var periodStr = String(periodStr); // 기간 : 1, 2, 3, 6 (개월)
    var defaultSubtractNum = 1;
    var subtractNum = Number(periodStr);
    var startDt = moment().subtract(subtractNum, 'months').startOf('month').format(formatStr);
    var endDt = moment().subtract(defaultSubtractNum, 'months').endOf('month').format(formatStr);

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