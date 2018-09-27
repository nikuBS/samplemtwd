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

  this.selectMonthVal = null;
};

Tw.MyTFareBillGuideCallGift.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();

  },
  _cachedElement: function () {
    this.$entryTpl = $('#fe-entryTpl');
    this.$callGiftInfoArea = $('[data-target="callGiftInfoArea"]');
    this.$defaultTxt= $('[data-target="defaultTxt"]');


    this.$dateSelect= $('[data-target="dateSelect"]');
    this.$dataResult= $('[data-target="dataResult"]');
    this.$noData= $('[data-target="noData"]');
  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="monBtn"]', $.proxy(this._monthBtnEvt, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  _monthBtnEvt: function(e) {
    // Tw.Logger.info('[버튼 클릭]', e);
    var $target = $(e.currentTarget);
    this.selectMonthVal = $target.attr('data-value');

    Tw.Logger.info('[선택 값]', this.selectMonthVal);

    var param = {
      startDt : this._getPeriod(this.selectMonthVal, 'YYYYMMDD').startDt,
      endDt: this._getPeriod(this.selectMonthVal, 'YYYYMMDD').endDt,
    };

    Tw.Logger.info('[버튼 클릭 > param]', param);
    this._getCallGiftInfo( param );
  },
  //--------------------------------------------------------------------------[API]
  _getCallGiftInfo: function(param) {
    return this._apiService.request(Tw.API_CMD.BFF_05_0045, param).done($.proxy(this._getCallGiftInfoInit, this));
  },

  _getCallGiftInfoInit: function(res) {
    Tw.Logger.info('[콜기프트]', res);

    if ( res.code === Tw.API_CODE.CODE_00 ) {

      this.$dataResult.empty();
      this.$dateSelect.hide();
      this.$dataResult.show();

      if ( res.result.callData === '0분 0초' ) {
        Tw.Logger.info('[콜기프트 > 이용내역이 없습니다. ]', res.result.callData);

      } else {

      }

      var resData = {
        callData: res.result.callData,
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