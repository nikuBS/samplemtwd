/**
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.17
 *
 */
var skipIdList = ['POT10', 'POT20', 'DDZ25', 'DDZ23', 'DD0PB', 'DD3CX', 'DD3CU', 'DD4D5', 'LT'];

Tw.MyTDataSubMain = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this.data = params.data;
  this._bpcpServiceId = this.data.bpcpServiceId;
  this._eParam = this.data.eParam;
  this._svcMgmtNum = this.data.svcInfo.svcMgmtNum;
  this._tidLanding = new Tw.TidLandingComponent();
  this._rendered();
  this._bindEvent();
  this._initialize();
  // 배너 관련 통계 이벤트(xtractor)
  new Tw.XtractorService(this.$container);
};

Tw.MyTDataSubMain.prototype = {
  _OTHER_LINE_MAX_COUNT: 20, // 다른 회선 최대 노출 카운트
  _rendered: function () {
    if ( !Tw.BrowserHelper.isApp() && this._historyService.isBack() ) {
      // this._historyService.reload();
      this._historyService.goLoad('/myt-data/submain');
    }
    // 실시간잔여 상세
    // this.$remnantBtn = this.$container.find('[data-id=remnant-detail]');
    // 즉시충전버튼
    if ( this.data.immCharge ) {
      this.$immChargeBtn = this.$container.find('[data-id=immCharge]');
    }
    // T끼리 데이터 선물 버튼
    if ( this.data.present ) {
      this.$presentBtn = this.$container.find('[data-id=present]');
    }
    // T가족모아 배너
    if ( this.data.family ) {
      this.$familymoaBanner = this.$container.find('[data-id=family-moa]');
    }
    this.$prepayContainer = this.$container.find('[data-id=prepay-container]');
    if ( this.data.refill ) {
      this.$refillBtn = this.$container.find('[data-id=refill]');
    }
    if ( this.data.isBenefit ) {
      this.$dataBenefitBtn = this.$container.find('[data-id=benefit]');
    }
    this.$dataPesterBtn = this.$container.find('[data-id=pester]');
    // if ( this.data.pattern ) {
    this.$patternChart = this.$container.find('[data-id=pattern_chart]');
    // }
    // if ( this.data.breakdownList ) {
    //   this.$breakdownDetail = this.$container.find('[data-id=bd-container] .bt');
    // }
    if ( this.data.otherLines.length > 0 ) {
      this.$otherLines = this.$container.find('[data-id=other-lines]');
      this.$moreTempleate = Handlebars.compile(Tw.MYT_TPL.DATA_SUBMAIN.MORE_LINE_TEMP);
      if ( this.data.otherLines.length > 20 ) {
        this.$otherLinesMoreBtn = this.$otherLines.find('.btn-more button');
      }
    }
    this.$otherPages = this.$container.find('[data-id=other-pages]');

    if (!Tw.FormatHelper.isEmpty(this._bpcpServiceId)) {
      this._initBpcp();
    }
  },

  _bindEvent: function () {
    // this.$remnantBtn.on('click', $.proxy(this._onRemnantDetail, this));
    if ( this.data.immCharge ) {
      this.$immChargeBtn.on('click', $.proxy(this._onImmChargeDetail, this));
    }
    if ( this.data.present ) {
      this.$presentBtn.on('click', $.proxy(this._onTPresentDetail, this));
    }
    // T가족모아 배너
    if ( this.data.family ) {
      this.$familymoaBanner.on('click', $.proxy(this._onFamilyMoaDetail, this));
    }
    if ( this.data.refill ) {
      this.$refillBtn.on('click', $.proxy(this._onRefillDetail, this));
    }
    if ( this.data.isBenefit ) {
      this.$dataBenefitBtn.on('click', $.proxy(this._onDataBenefitDetail, this));
    }
    this.$dataPesterBtn.on('click', $.proxy(this._onDataPesterDetail, this));

    // if ( this.data.breakdownList ) {
    //   this.$breakdownDetail.on('click', $.proxy(this._onBreakdownListDetail, this));
    // }
    if ( this.data.otherLines.length > 0 ) {
      this.$otherLines.on('click', $.proxy(this._onOtherLinesItemDetail, this));
      if ( this.data.otherLines.length > 20 ) {
        this.$otherLinesMoreBtn.on('click', $.proxy(this._onOtherLinesMore, this));
      }
    }
    this.$otherPages.find('li').on('click', $.proxy(this._onOtherPages, this));
    this.$prepayContainer.on('click', 'button', $.proxy(this._onPrepayCoupon, this));
    // BPCP 페이지에서 이벤트 받기 위한 처리
    $(window).on('message', $.proxy(this._getWindowMessage, this));
  },

  _initialize: function () {
    this._svcMgmtNumList = [];
    this._initScroll();
    this._initBanners();
    var otherLinesLength = this.data.otherLines.length > this._OTHER_LINE_MAX_COUNT ? this._OTHER_LINE_MAX_COUNT : this.data.otherLines.length;
    if ( otherLinesLength > 0 ) {
      setTimeout($.proxy(this._initOtherLinesInfo, this, 0, otherLinesLength), 200);
    }
  },

  _initBanners: function () {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_TOS, { code: '0008' })
      .done($.proxy(this._successBanner, this, Tw.REDIS_BANNER_TYPE.TOS))
      .fail($.proxy(this._errorRequest, this));
  },

  _successBanner: function (type, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var result = resp.result;
      var isCheckBanner = type === Tw.REDIS_BANNER_TYPE.ADMIN || this._checkBanner(result);
      if ( isCheckBanner ) {
        var list = (type === Tw.REDIS_BANNER_TYPE.ADMIN) ? result.banners : result.imgList;
        new Tw.BannerService(this.$container, type, list, 'M', $.proxy(this._successDrawBanner, this));
      }
      else {
        this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: this.data.pageInfo.menuId })
          .done($.proxy(this._successBanner, this, Tw.REDIS_BANNER_TYPE.ADMIN))
          .fail($.proxy(this._errorRequest, this));
      }
    }
    else {
      this.$container.find('[data-id=banners-empty]').hide();
      this.$container.find('[data-id=banners]').hide();
    }
  },

  _checkBanner: function (result) {
    return (result.bltnYn === 'N' || result.tosLnkgYn === 'Y');
  },

  _successDrawBanner: function () {
    this.$bannerList = this.$container.find('[data-id=banner-list]');
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.CommonHelper.resetHeight(this.$bannerList[0]);
    }
  },

  _initScroll: function () {
    this._checkScroll();
    $(window).scroll($.proxy(function () {
      this._checkScroll();
    }, this));
  },

  _checkScroll: function () {
    if ( !this._isRequestPattern && this._elementScrolled(this.$patternChart) ) {
      this._requestPattern();
    }
  },

  _elementScrolled: function (element) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = element.offset().top;
    return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
  },

  __convertData: function (value) {
    return parseFloat((value / 1024 / 1024).toFixed(2));
  },

  __convertVoice: function (value) {
    var min = parseInt((value % 3600) / 60, 10);
    var sec = value % 60;
    return min + ':' + sec;
  },

  __calculationData: function (tmoaremained, tmoatotal, etcremained, etctotal) {
    var result = {};
    var total = tmoatotal + etctotal;
    var totalRemained = tmoaremained + etcremained;
    result.showTotal = this.__convFormat(total.toString(), Tw.UNIT_E.DATA);
    result.showRemained = this.__convFormat(totalRemained.toString(), Tw.UNIT_E.DATA);
    result.showTmoaRemained = this.__convFormat(tmoaremained.toString(), Tw.UNIT_E.DATA);
    result.showEtcmoaRemained = this.__convFormat(etcremained.toString(), Tw.UNIT_E.DATA);
    result.tmoaRemainedRatio = Math.round(tmoaremained / total * 100);
    result.etcRemainedRatio = Math.round(etcremained / total * 100);
    result.totalRemainedRatio = Math.round(totalRemained / total * 100);
    return result;
  },

  __convShowData: function (data) {
    data.isUnlimit = !_.isFinite(data.total);
    data.remainedRatio = 100;
    data.showUsed = this.__convFormat(data.used, data.unit);
    if ( !data.isUnlimit ) {
      data.showTotal = this.__convFormat(data.total, data.unit);
      data.showRemained = this.__convFormat(data.remained, data.unit);
      data.remainedRatio = Math.round((data.remained / data.total) * 100);
    }
  },

  __convFormat: function (data, unit) {
    switch ( unit ) {
      case Tw.UNIT_E.FEE:
        return Tw.FormatHelper.convSpDataFormat(data, Tw.UNIT[unit]);
      case Tw.UNIT_E.DATA:
        return Tw.FormatHelper.convDataFormat(data, Tw.UNIT[unit]);
      case Tw.UNIT_E.VOICE:
        return Tw.FormatHelper.convVoiceFormat(data);
      case Tw.UNIT_E.SMS:
      case Tw.UNIT_E.SMS_2:
        return Tw.FormatHelper.addComma(data);
      default:
    }
    return '';
  },

  __parseRemnantData: function (remnant) {
    var GDATA = remnant.gnrlData || [];
    var SDATA = remnant.spclData || [];
    var VOICE = remnant.voice || [];
    var SMS = remnant.sms || [];
    var tmoaRemained = 0;
    var tmoaTotal = 0;
    var etcRemained = 0;
    var etcTotal = 0;
    var result = {
      gdata: [],
      sdata: [],
      voice: [],
      sms: [],
      tmoa: []
    };
    if ( GDATA.length > 0 ) {
      _.filter(
        GDATA,
        $.proxy(function (item) {
          if ( item.unlimit === '1' || item.unlimit === 'B' || item.unlimit === 'M' ) {
            result.totalLimit = true;
          }
          this.__convShowData(item);
          if ( item.skipId === skipIdList[0] || item.skipId === skipIdList[1] ) {
            result.tmoa.push(item);
            tmoaRemained += parseInt(item.remained || 0, 10);
            tmoaTotal += parseInt(item.total || 0, 10);
          }
          else {
            result.gdata.push(item);
            etcRemained += result.totalLimit ? 100 : parseInt(item.remained || 0, 10);
            etcTotal += result.totalLimit ? 100 : parseInt(item.total || 0, 10);
          }
        }, this)
      );
      if ( !result.totalLimit ) {
        result.total = this.__calculationData(tmoaRemained, tmoaTotal, etcRemained, etcTotal);
      }
      else {
        result.total = {
          etcRemainedRatio: 100,
          totalRemainedRatio: 0
        };
      }
    }
    if ( SDATA.length > 0 ) {
      _.filter(
        SDATA,
        $.proxy(function (item) {
          this.__convShowData(item);
          result.sdata.push(item);
        }, this)
      );
    }
    if ( VOICE.length > 0 ) {
      _.filter(
        VOICE,
        $.proxy(function (item) {
          this.__convShowData(item);
          result.voice.push(item);
        }, this)
      );
    }
    if ( SMS.length > 0 ) {
      _.filter(
        SMS,
        $.proxy(function (item) {
          this.__convShowData(item);
          result.sms.push(item);
        }, this)
      );
    }
    return result;
  },

  __selectOtherLine: function (number) {
    var select = _.find(this.data.otherLines, function (item) {
      if ( item.svcMgmtNum === number ) {
        return item;
      }
    });
    return select;
  },

  __selectSvcType: function (attrCd) {
    var clsNm = 'cellphone';
    if ( ['M3', 'M4'].indexOf(attrCd) > -1 ) {
      clsNm = 'tablet';
    }
    return clsNm;
  },

  // chart create
  _requestPattern: function () {
    this._isRequestPattern = true;
    this._apiService.request(Tw.API_CMD.BFF_05_0091, {})
      .done($.proxy(this._successPattern, this))
      .fail($.proxy(this._errorRequestPattern, this));
  },

  _initPatternChart: function () {
    if ( (this.data.pattern.data && this.data.pattern.data.length > 0) ||
      (this.data.pattern.voice && this.data.pattern.voice.length > 0) ) {
      var unit,
          data,
          chart_data = [],
          idx;
      this.$patternChart.find('.tit > span').text(Tw.MYT_DATA_PATTERN_TITLE.DATA);
      unit = Tw.CHART_UNIT.GB;
      data = this.data.pattern.data;
      var baseTotalData = 0, baseTotalVoice = 0, baseTotalSms = 0;
      // [DVI001-13652] SKT 요청사항
      // for ( idx = 0; idx < data.length; idx++ ) {
      for ( idx = data.length - 1; idx >= 0; idx-- ) {
        var usageData = parseInt(data[idx].totalUsage, 10);
        baseTotalData += usageData;/*parseInt(data[idx].basOfrUsage, 10)*/
        if ( usageData > 0 ) {
          var convVal = this.__convertData(usageData); // 배열 평균값으로 전달
          if ( convVal > 0 ) {
            chart_data.push({
              t: this._recentChartDate(data[idx].invMth), // 각 항목 타이틀
              v: convVal
            });
          }
        }
      }
      // 음성
      if ( baseTotalData === 0 ) {
        chart_data = [];
        if ( this.data.pattern.voice.length > 0 ) {
          this.$patternChart.find('.tit > span').text(Tw.MYT_DATA_PATTERN_TITLE.VOICE);
          unit = Tw.CHART_UNIT.TIME;
          data = this.data.pattern.voice;
          // [DVI001-13652] SKT 요청사항
          // for ( idx = 0; idx < data.length; idx++ ) {
          for ( idx = data.length - 1; idx >= 0; idx-- ) {
            var convVal_v = parseInt(data[idx].totalUsage, 10);
            baseTotalVoice += convVal_v;
            if ( convVal_v > 0 ) {
              chart_data.push({
                t: this._recentChartDate(data[idx].invMth), // 각 항목 타이틀
                v: this.__convertVoice(parseInt(data[idx].totalUsage, 10)) // 배열 평균값으로 전달
              });
            }
          }
        }
      }
      // 문자
      if ( baseTotalData === 0 && baseTotalVoice === 0 ) {
        chart_data = [];
        if ( this.data.pattern.sms.length > 0 ) {
          this.$patternChart.find('.tit > span').text(Tw.MYT_DATA_PATTERN_TITLE.SMS);
          unit = Tw.CHART_UNIT.SMS;
          data = this.data.pattern.sms;
          // [DVI001-13652] SKT 요청사항
          // for ( idx = 0; idx < data.length; idx++ ) {
          for ( idx = data.length - 1; idx >= 0; idx-- ) {
            baseTotalSms += parseInt(data[idx].totalUsage, 10);
            var convVal_s = parseInt(data[idx].totalUsage, 10); // 배열 평균값으로 전달
            if ( convVal_s > 0 ) {
              chart_data.push({
                t: this._recentChartDate(data[idx].invMth), // 각 항목 타이틀
                v: convVal_s
              });
            }
          }
        }
      }
      // 최근사용량이 모두 없는 경우
      if ( baseTotalData === 0 && baseTotalVoice === 0 && baseTotalSms === 0 ) {
        chart_data = [];
      }
      if ( chart_data.length > 0 ) {
        this.$patternChart.chart2({
          type: Tw.CHART_TYPE.BAR_2, //bar
          target: '.pattern', //클래스명 String
          average: true,
          // [DVI001-13652] SKT 요청사항
          average_place: 'right',
          unit: unit, //x축 이름
          data_arry: chart_data //데이터 obj
        });
      }
      else {
        this.$patternChart.hide();
        this.$container.find('[data-id=pattern_empty]').hide();
      }
    }
    else {
      this.$patternChart.hide();
      this.$container.find('[data-id=pattern_empty]').hide();
    }
  },

  _initOtherLinesInfo: function (from, end) {
    var requestCommand = [];
    for ( var idx = from; idx < end; idx++ ) {
      this._svcMgmtNumList.push(this.data.otherLines[idx].svcMgmtNum);
      var param = { command: Tw.API_CMD.BFF_05_0001 };
      if ( this.data.otherLines[idx].child ) {
        param.params = { childSvcMgmtNum: this.data.otherLines[idx].svcMgmtNum };
      }
      else {
        // 간편로그인이 아닌 경우에만 다른회선잔여량도 포함시킨다.
        if ( this.data.svcInfo.loginType !== Tw.AUTH_LOGIN_TYPE.EASY ) {
          // 서버 명세가 변경됨 svcMgmtNum -> T-svcMgmtNum
          param.headers = { 'T-svcMgmtNum': this.data.otherLines[idx].svcMgmtNum };
        }
      }
      requestCommand.push(param);
    }
    if ( requestCommand.length > 0 ) {
      this._apiService
        .requestArray(requestCommand)
        .done($.proxy(this._responseOtherLine, this))
        .fail($.proxy(this._errorRequest, this));
    }
    else {
      // 다른 회선 정보는 있지만 조회할 수 없는 경우 숨김
      this.$container.find('[data-id=empty-other-lines]').hide();
      this.$otherLines.hide();
    }
  },

  _responseOtherLine: function () {
    var list = [];
    if ( arguments.length > 0 ) {
      for ( var idx = 0; idx < arguments.length; idx++ ) {
        var selectLine = this.__selectOtherLine(this._svcMgmtNumList[idx]);
        var data = {};
        if ( arguments[idx].code === Tw.API_CODE.CODE_00 ) {
          var item = this.__parseRemnantData(arguments[idx].result);
          if ( item.total ) {
            data = {
              data: item.totalLimit ? Tw.COMMON_STRING.UNLIMIT : item.total.showRemained.data,
              unit: item.totalLimit ? '' : item.total.showRemained.unit
            };
          }
          else if ( item.sdata.length > 0 ) {
            data = {
              data: item.sdata[0].showRemained.data,
              unit: item.sdata[0].showRemained.unit
            };
          }
          else if ( item.voice.length > 0 ) {
            data = {
              data: item.voice[0].showRemained.hours + Tw.VOICE_UNIT.HOURS + item.voice[0].showRemained.min + Tw.VOICE_UNIT.MIN,
              unit: ''
            };
          }
          else if ( item.sms.length > 0 ) {
            var smsTotalData = item.sms[0].total;
            if ( item.sms[0].isUnlimit && smsTotalData ) {
              var isStandard = smsTotalData === Tw.COMMON_STRING.STANDARD;
              data = {
                data: isStandard ? Tw.COMMON_STRING.UNLIMIT : smsTotalData,
                unit: isStandard ? '' : Tw.SMS_UNIT
              };
            }
            else {
              data = {
                data: item.sms[0].showRemained,
                unit: Tw.SMS_UNIT
              };
            }
          }
        }
        else {
          data = {
            data: Tw.MYT_DATA_ERROR_CODE.DEFAULT,
            unit: ''
          };
        }
        data.svcType = this.__selectSvcType(selectLine.svcAttrCd);
        data = _.extend(selectLine, data);
        list.push(data);
      }
    }
    this._svcMgmtNumList = [];
    this._initOtherLineList(list);
  },

  _initOtherLineList: function (list) {
    if ( list.length > 0 ) {
      for ( var i = 0; i < list.length; i++ ) {
        var $ul = this.$container.find('ul.my-line-info');
        var result = this.$moreTempleate(list[i]);
        $ul.append(result);
      }
    }
  },

  // 최근데이터사용량 월표시 (당해년 제외 년월로 표시)
  _recentChartDate: function (date) {
    var curYear = new Date().getFullYear();
    var inputYear = Tw.DateHelper.convDateFormat(date).getFullYear();
    return Tw.DateHelper.getShortKoreanMonth(date, (curYear !== inputYear));
  },

  _onImmChargeDetail: function () {
    switch ( this.data.svcInfo.svcAttrCd ) {
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
        this.immediatelyRechargeLayer = new Tw.ImmediatelyRechargeLayer(this.$container, {
          isPrepayment: this.data.isPrepayment
        });
        break;
    }
  },

  // pps 인 경우 자동알람서비스 그 외 데이터선물하기
  _onTPresentDetail: function () {
    if ( this.data.svcInfo.svcAttrCd === 'M2' ) {
      // PPS 인 경우 자동알람서비스 - 190128 SB 기준 변경됨
      // 인증인 API 호출시 인증화면으로 넘어감으로 DC_09_05로 이동 - 재차 확인 필요
      this._historyService.goLoad('/myt-data/recharge/prepaid/alarm');
      // if ( Tw.BrowserHelper.isApp() ) {
      // }
      // else {
      //   // CO_UT_09_01 page 이동
      //   this._historyService.goLoad('/common/share/app-install/info');
      // }
    }
    else {
      this._historyService.goLoad('/myt-data/giftdata');
    }
  },

  // T가족모아
  _onFamilyMoaDetail: function () {
    // 공유 버튼
    this._historyService.goLoad('/myt-data/familydata/share');
  },

  // 데이터 혜텍
  _onDataBenefitDetail: function () {
    this._getBPCP(Tw.OUTLINK.DATA_COUPON.DATA_FACTORY);
  },

  // 데이터 조르기
  _onDataPesterDetail: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      //  2_A17 Alert 호출
      this._popupService.openModalTypeA(
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.TITLE,
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.MSG,
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.BUTTON,
        null,
        $.proxy(this._pesterDetailConfirm, this),
        null,
        null,
        null,
        this.$dataPesterBtn.find('button')
      );
    }
    else {
      Tw.CommonHelper.openUrlExternal(Tw.OUTLINK.TWORLD_DATA_PRESENT);
    }
  },

  _pesterDetailConfirm: function () {
    this._popupService.close();
    // excel 기준 (조르기 : OS 내 페이지 공유화면 제공)
    var content = Tw.ALERT_MSG_MYT_DATA.DATA_PESTER.TITLE + this.data.svcInfo.svcNum +
      Tw.ALERT_MSG_MYT_DATA.DATA_PESTER.CONTENT + Tw.OUTLINK.TWORLD_DATA_PRESENT;
    Tw.CommonHelper.share(content);
  },

  // 리필쿠폰
  _onRefillDetail: function () {
    this._historyService.goLoad('/myt-data/recharge/coupon?from=submain');
  },

  // 충전/선물내역 상세
  // _onBreakdownListDetail: function () {
  //   this._historyService.goLoad('/myt-data/history');
  // },

  // 다른 회선 잔여량 상세
  _onOtherLinesItemDetail: function (event) {
    var $target = $(event.target).parents('[data-svc-mgmt-num]'),
      mgmtNum = $target.attr('data-svc-mgmt-num'),
      number  = $target.attr('data-num'),
      isChild = $target.find('.icon-children').length > 0;
    if ( mgmtNum ) {
      if ( isChild ) {
        // 자녀회선
        this._historyService.goLoad('/myt-data/submain/child-hotdata?childSvcMgmtNum=' + mgmtNum);
      }
      else {
        this.changeLineMgmtNum = mgmtNum;
        this.changeLineMdn = number;

        var target = _.find(this.data.otherLines, { svcMgmtNum: mgmtNum });
        this._popupService.openSwitchLine(this.data.svcInfo, target, Tw.REMNANT_OTHER_LINE.BTNAME, null,
          $.proxy(this._onChangeLineConfirmed, this), null, 'change_line', null, $target.find('button'));
      }
    }
  },

  // 다른 회선 더보기
  _onOtherLinesMore: function () {
    var renderedListCnt = this.$otherLines.find('.my-line-info li').length;
    var gapCnt = this.data.otherLines.length - renderedListCnt;
    var isMore = false;
    if ( gapCnt > this._OTHER_LINE_MAX_COUNT ) {
      gapCnt = this._OTHER_LINE_MAX_COUNT;
      isMore = true;
    }
    else {
      gapCnt = gapCnt;
    }
    var fromCnt = renderedListCnt;
    var endCnt = fromCnt + gapCnt;
    if ( gapCnt > 0 ) {
      this._initOtherLinesInfo(fromCnt, endCnt);
      if ( isMore ) {
        this.$otherLines.find('.btn-more').show();
      }
      else {
        this.$otherLines.find('.btn-more').hide();
      }
    }
  },

  // 다른 회선 팝업에서 변경하기 눌렀을 경우
  _onChangeLineConfirmed: function () {
    // 회선변경 API 호출
    this._popupService.close();
    var lineService = new Tw.LineComponent();
    lineService.changeLine(this.changeLineMgmtNum, this.changeLineMdn, $.proxy(this._onChangeSessionSuccess, this));
  },

  // 회선 변경 후 처리
  _onChangeSessionSuccess: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.CommonHelper.toast(Tw.REMNANT_OTHER_LINE.TOAST);
    }
    setTimeout($.proxy(function () {
      this._historyService.reload();
    }, this), 500);
  },

  _onOtherPages: function (event) {
    var $target = $(event.target);
    var href = $target.attr('data-href');
    this._historyService.goLoad(href);
  },

  _onPrepayCoupon: function (event) {
    var $target = $(event.currentTarget);
    var type = $target.attr('data-type');
    var url = '';
    switch ( type ) {
      case 'data':
        url = Tw.OUTLINK.DATA_COUPON.T_DATA;
        break;
      case 'coupon':
        url = Tw.OUTLINK.DATA_COUPON.T_COUPON;
        break;
      case 'oksusu':
        url = Tw.OUTLINK.DATA_COUPON.OKSUSU;
        break;
      case 'jeju':
        url = Tw.OUTLINK.DATA_COUPON.JEJU;
        break;
      case 'sdata':
        url = Tw.OUTLINK.DATA_COUPON.T_SHORT_DATA;
        break;
    }
    this._getBPCP(url);
  },

  _getBPCP: function (url) {
    var reqParams = {
      svcMgmtNum: this._svcMgmtNum,
      bpcpServiceId: url.replace('BPCP:', '')
    };

    if (!Tw.FormatHelper.isEmpty(this._eParam)) {
      reqParams.eParam = this._eParam;
    }

    this._apiService.request(Tw.API_CMD.BFF_01_0039, reqParams)
      .done($.proxy(this._responseBPCP, this));
  },

  _responseBPCP: function (resp) {
    if (resp.code === 'BFF0003') {
      return this._tidLanding.goLogin(location.origin + '/myt-data/submain');
    }

    if (resp.code === 'BFF0504') {
      var msg = resp.msg.match(/\(.*\)/);
      msg = msg.pop().match(/(\d+)/);

      var fromDtm = Tw.FormatHelper.isEmpty(msg[0]) ? null : Tw.DateHelper.getShortDateWithFormat(msg[0].substr(0, 8), 'YYYY.M.D.'),
          toDtm = Tw.FormatHelper.isEmpty(msg[1]) ? null : Tw.DateHelper.getShortDateWithFormat(msg[1].substr(0, 8), 'YYYY.M.D.'),
          serviceBlock = { hbs: 'service-block' };

      if (!Tw.FormatHelper.isEmpty(fromDtm) && !Tw.FormatHelper.isEmpty(toDtm)) {
        serviceBlock = $.extend(serviceBlock, { fromDtm: fromDtm, toDtm: toDtm });
      }

      return this._popupService.open(serviceBlock);
    }

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var url = resp.result.svcUrl;
    if (Tw.FormatHelper.isEmpty(url)) {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.BPCP).pop();
    }

    if (!Tw.FormatHelper.isEmpty(resp.result.tParam)) {
      url += (url.indexOf('?') !== -1 ? '&tParam=' : '?tParam=') + resp.result.tParam;
    }

    url += '&ref_origin=' + encodeURIComponent(location.origin);

    this._popupService.open({
      hbs: 'product_bpcp',
      iframeUrl: url
    }, null, $.proxy(function() {
      this._historyService.replaceURL('/myt-data/submain');
    }, this));
  },

  _successPattern: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var curDate = new Date().getDate();
      // 1 ~ 4 일 (집계중으로표시하지 않음)
      if ( curDate > 4 ) {
        this.data.pattern = resp.result;
        setTimeout($.proxy(this._initPatternChart, this), 300);
      }
      else {
        this.$patternChart.hide();
        this.$container.find('[data-id=pattern_empty]').hide();
      }
    }
    else {
      this._isRequestPattern = false;
    }
  },

  _errorRequestPattern: function (resp) {
    this.$patternChart.hide();
    this.$container.find('[data-id=pattern_empty]').hide();
    this._errorRequest(resp);
  },

  _errorRequest: function (resp) {
    if ( !resp ) {
      resp = {
        code: '',
        msg: Tw.ALERT_MSG_COMMON.SERVER_ERROR
      };
    }
    Tw.Error(resp.code, resp.msg).pop();
  },

  _initBpcp: function() {
    this._getBPCP(this._bpcpServiceId);
    history.replaceState(null, document.title, location.origin + '/myt-data/submain');
  },

  // BPCP 페이지에서 X 버튼 누른 경우에 대한 이벤트 처리
  _getWindowMessage: function (e) {
    var data = e.data || e.originalEvent.data;
    var popupService = this._popupService;
    if (this.immediatelyRechargeLayer && this.immediatelyRechargeLayer._popupService) {
      popupService = this.immediatelyRechargeLayer._popupService;
    }

    // BPCP 팝업 닫기
    if (data === 'popup_close') {
      popupService.closeAll();
    }

    // BPCP 팝업 닫고 링크 이동
    if (data.indexOf('goLink:') !== -1) {
      popupService.closeAllAndGo(data.replace('goLink:', ''));
    }

    // BPCP 팝업 닫고 로그인 호출
    if (data.indexOf('goLogin:') !== -1) {
      this._tidLanding.goLogin('/myt-data/submain?' + $.param(JSON.parse(data.replace('goLogin:', ''))));
    }
  }
};
