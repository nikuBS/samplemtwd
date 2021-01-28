/**
 * MenuName: 나의 요금 서브메인 - 선불폰(PPS)
 * @file myt-fare.bill.guide.pps.js
 * @author 양정규
 * @since 2020.11.09
 * Summary: 선불폰 이용내역 조회 및 화면 처리
 */
Tw.MyTFareSubmainPps = function (rootEl, resData) {
  this.resData = resData;
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService();
  this._init();
};

Tw.MyTFareSubmainPps.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
    this._getHistoriesInfo();
    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    /* this._lineComponent = */ new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
  },
  /**
   * element cache
   * @private
   */
  _cachedElement: function () {
    this.$entryTplList = Handlebars.compile( $('#fe-entryTplList').html());
    this.$detailList = $('[data-target="detailList"]'); // 리스트 영역
  },
  /**
   * even bind
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-imm-charge', $.proxy(this._onImmChargeDetail, this)); // 선불폰 충전 버튼
  },

  /**
   * @function
   * @desc 즉시충전 상세보기
   */
  _onImmChargeDetail: function () {
    switch ( this.resData.svcInfo.svcAttrCd ) {
      case 'M2':
        // PPS
        new Tw.PPSRechargeLayer(this.$container);
        break;
      case 'M3':
      case 'M4':
        // PocketFi, Tlogin
        this._historyService.goLoad('/myt-data/hotdata');
        break;
      default:
        new Tw.ImmediatelyRechargeLayer(this.$container, {
          pathUrl: '/myt-data/submain'
        });
        break;
    }
  },

  /**
   * 사용내역 조회
   * @returns {*}
   * @private
   */
  _getHistoriesInfo: function () {
    var endMM = Tw.DateHelper.getEndOfMonSubtractDate(new Date(), 1, 'YYYYMM');
    var startMM = Tw.DateHelper.getEndOfMonSubtractDate(endMM, 2, 'YYYYMM');

    return this._apiService.request(Tw.API_CMD.BFF_05_0014, {
      startMM: startMM,
      endMM: endMM
    }).done($.proxy(this._getHistoriesInfoInit, this));
  },
  /**
   * 사용내역 조회결과
   * @param res
   * @private
   */
  _getHistoriesInfoInit: function (res) {
    var dataArr = _.sortBy(res.result, 'usedDt').reverse().slice(0, 2); // 최신순으로 정렬(내림차순)
    this._proData(dataArr); // 데이터 가공
    this._ctrlInit(dataArr); // 데이터 뿌려주기
  },

  _proData: function (dataArr) { //데이터 가공
    var thisMain = this;
    _.map(dataArr, function (item) {
      item.usedDt = Tw.DateHelper.getShortDate(item.usedDt);
      // var used = Number(item.used) < 0 ?
      // 0보다 작을 경우 데이터 이외 사용 항목(음성/sms/충전 등)
      if ( Number(item.used) < 0 ) {
        item.used = thisMain._comComma(Number(item.rate||0).toFixed());
        item.dataUnit = Tw.CURRENCY_UNIT.WON;
      } else {
        item.used = (Number(item.used) / 1024).toFixed();
        item.used = thisMain._comComma(item.used);
        item.dataUnit = Tw.DATA_UNIT.MB;
      }

      return item;
    });
  },

  /**
   * 화면에 데이터 세팅
   * @private
   */
  _ctrlInit: function (dataArr) {
    this.$detailList.append(this.$entryTplList({resData: dataArr}));
  },

  _comComma: function (str) {
    if(!str) return '';
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  }

};
