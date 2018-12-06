/**
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.17
 *
 */
var skipIdList = ['POT10', 'DDZ25', 'DDZ23', 'DD0PB', 'DD3CX', 'DD3CU', 'DD4D5', 'LT'];

Tw.MyTDataSubMain = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this.data = params.data;
  this._rendered();
  this._bindEvent();
  this._initialize();
};

Tw.MyTDataSubMain.prototype = {

  _rendered: function () {
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
    // TODO: 선불쿠폰 API 기능 완료 후 작업(TBD)
    // this.$prepayContainer = this.$container.find('[data-id=prepay-container]');
    if ( this.data.refill ) {
      this.$refillBtn = this.$container.find('[data-id=refill]');
    }
    if ( this.data.isBenefit ) {
      this.$dataBenefitBtn = this.$container.find('[data-id=benefit]');
      this.$dataPesterBtn = this.$container.find('[data-id=pester]');
    }
    if ( this.data.pattern ) {
      this.$patternChart = this.$container.find('[data-id=pattern_chart]');
    }
    // if ( this.data.breakdownList ) {
    //   this.$breakdownDetail = this.$container.find('[data-id=bd-container] .bt');
    // }
    if ( this.data.otherLines.length > 0 ) {
      this.$otherLines = this.$container.find('[data-id=other-lines]');
      this.$moreTempleate = Handlebars.compile(Tw.MYT_TPL.DATA_SUBMAIN.MORE_LINE_TEMP);
      if ( this.data.otherLines.length > 20 ) {
        this.$otherLinesMoreBtn = this.$otherLines.find('.bt-more button');
      }
    }
    this.$otherPages = this.$container.find('[data-id=other-pages]');
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
      this.$dataPesterBtn.on('click', $.proxy(this._onDataPesterDetail, this));
    }

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
  },

  _initialize: function () {
    this._svcMgmtNumList = [];
    if ( this.data.pattern ) {
      setTimeout($.proxy(this._initPatternChart, this), 300);
    }
  },

  __getPatternMonth: function (value) {
    return value.slice(value.length - 2, value.length) + Tw.PERIOD_UNIT.MONTH;
  },

  __convertData: function (value) {
    return parseFloat((value / 1024 / 1024).toFixed(2));
  },

  __convShowData: function (data) {
    data.isUnlimit = !_.isFinite(data.total);
    data.remainedRatio = 100;
    data.showUsed = this.__convFormat(data.used, data.unit);
    if ( !data.isUnlimit ) {
      data.showTotal = this.__convFormat(data.total, data.unit);
      data.showRemained = this.__convFormat(data.remained, data.unit);
      data.remainedRatio = Math.round(data.remained / data.total * 100);
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
    var DATA = remnant.data || [];
    var VOICE = remnant.voice || [];
    var SMS = remnant.sms || [];
    var result = {
      data: [],
      voice: [],
      sms: [],
      tmoa: []
    };
    if ( DATA.length > 0 ) {
      _.filter(DATA, $.proxy(function (item) {
        this.__convShowData(item);
        if ( skipIdList.indexOf(item.skipId) === -1 ) {
          result.data.push(item);
        }
        else {
          if ( item.skipId === 'POT10' ) {
            result.tmoa.push(item);
          }
        }
      }, this));
    }
    if ( VOICE.length > 0 ) {
      _.filter(VOICE, $.proxy(function (item) {
        this.__convShowData(item);
        result.voice.push(item);
      }, this));
    }
    if ( SMS.length > 0 ) {
      _.filter(SMS, $.proxy(function (item) {
        this.__convShowData(item);
        result.sms.push(item);
      }, this));
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

  // chart create
  _initPatternChart: function () {
    if ( this.data.pattern.data.length > 0 || this.data.pattern.voice.length > 0 ) {
      var unit = '', data, chart_data = [], idx;
      if ( this.data.pattern.data.length > 0 ) {
        unit = Tw.CHART_UNIT.GB;
        data = this.data.pattern.data;
        if ( data.length > 0 ) {
          for ( idx = 0; idx < data.length; idx++ ) {
            chart_data.push({
              t: this.__getPatternMonth(data[idx].invMth),// 각 항목 타이틀
              v: this.__convertData(parseInt(data[idx].totalUsage, 10))// 배열 평균값으로 전달
            });
          }
        }
      }
      else if ( this.data.pattern.voice.length > 0 ) {
        unit = Tw.CHART_UNIT.TIME;
        data = this.data.pattern.voice;
        for ( idx = 0; idx < data.length; idx++ ) {
          chart_data.push({
            t: this.__getPatternMonth(data[idx].invMth),// 각 항목 타이틀
            v: this.__convertData(parseInt(data[idx].totalUsage, 10))// 배열 평균값으로 전달
          });
        }
      }

      this.$patternChart.chart2({
        type: Tw.CHART_TYPE.BAR_2, //bar
        target: '.pattern', //클래스명 String
        average: true,
        unit: unit, //x축 이름
        data_arry: chart_data //데이터 obj
      });
    }
    setTimeout($.proxy(this._initOtherLinesInfo, this), 200);
  },

  _initOtherLinesInfo: function () {
    var otherLineLength = this.data.otherLines.length;
    if ( otherLineLength > 0 ) {
      var requestCommand = [];
      for ( var idx = 0; idx < otherLineLength; idx++ ) {
        this._svcMgmtNumList.push(this.data.otherLines[idx].svcMgmtNum);
        requestCommand.push({
          command: Tw.API_CMD.BFF_05_0001,
          // 서버 명세가 변경됨 svcMgmtNum -> T-svcMgmtNum
          params: {
            'childSvcMgmtNum': this.data.otherLines[idx].svcMgmtNum
          }
        });
      }
      this._apiService.requestArray(requestCommand)
        .done($.proxy(this._responseOtherLine, this))
        .fail($.proxy(this._errorRequest, this));
    }
  },


  _responseOtherLine: function () {
    var list = [];
    if ( arguments.length > 0 ) {
      for ( var idx = 0; idx < arguments.length; idx++ ) {
        if ( arguments[idx].code === Tw.API_CODE.CODE_00 ) {
          var item = this.__parseRemnantData(arguments[idx].result);
          var selectLine = this.__selectOtherLine(this._svcMgmtNumList[idx]);
          var data = {};
          if ( item.data.length > 0 ) {
            data = {
              data: item.data[0].showRemained.data,
              unit: item.data[0].showRemained.unit
            };
          }
          else if ( item.voice.length > 0 ) {
            data = {
              data: item.voice[0].showRemained.hours + '시간' + item.voice[0].showRemained.min + '분',
              unit: ''
            };
          }
          else if ( item.sms.length > 0 ) {
            data = {
              data: (item.sms[0].isUnlimit ? item.sms[0].total : item.sms[0].showRemained),
              unit: Tw.SMS_UNIT
            };
          }
          data = _.extend(selectLine, data);
          list.push(data);
        }
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

  // event callback funtion
  // _onRemnantDetail: function () {
  //   this._historyService.goLoad('/myt-data/hotdata');
  // },

  _onImmChargeDetail: function () {
    if ( this.data.svcInfo.svcAttrCd === 'M2' ) {
      new Tw.PPSRechargeLayer(this.$container);
    }
    else {
      new Tw.ImmediatelyRechargeLayer(this.$container);
    }
  },

  _onTPresentDetail: function () {
    if ( this.data.svcInfo.svcAttrCd === 'M2' ) {
      // PPS 인 경우 자동알람서비스
      if ( Tw.BrowserHelper.isApp() ) {
        // TODO: 금융거래 본인인증 작업이 완료되면 이후 처리 우선은 페이지 이동으로만 처리하고 완료 후 [DC_09_05] 이동
        this._popupService.openAlert('TBD');
      }
      else {
        // 웹인 경우 모바일 앱으로 유도 (설치/미설치)
        this._popupService.openModalTypeA(Tw.ALERT_MSG_COMMON.T_WORLD_APP_MOVED.TITLE,
          Tw.ALERT_MSG_COMMON.T_WORLD_APP_MOVED.MSG, Tw.ALERT_MSG_COMMON.T_WORLD_APP_MOVED.BUTTON,
          $.proxy(this._onOpenTworldMovedAlert, this), $.proxy(this._onConfirmTworldMovedAlert, this), this);
      }
    }
    else {
      this._historyService.goLoad('/myt-data/giftdata');
    }
  },

  _onOpenTworldMovedAlert: function ($layer) {
    $layer.find('.pos-left .tw-popup-closeBtn').on('click', $.proxy(function () {
      // TODO: 서비스 이용 안내 페이지로 이동 [CO_UT_09_01]
      this._popupService.openAlert('TBD');
    }, this));
  },

  _onConfirmTworldMovedAlert: function () {

  },

  // T가족모아
  _onFamilyMoaDetail: function () {
    this._historyService.goLoad('/myt-data/familydata');
  },

  // 데이터 혜텍
  _onDataBenefitDetail: function () {
    // 혜택 할인 페이지 BPCP 페이지
    //Tw.CommonHelper.openUrlExternal(Tw.OUTLINK.DATA_FACTORY);
    // TODO: BP 페이지 미개발 상태로 개발 완료 후 처리
    this._popupService.openAlert('TBD');
  },

  // 데이터 조르기
  _onDataPesterDetail: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      //  2_A17 Alert 호출
      this._popupService.openModalTypeA(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.TITLE, Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.MSG,
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.BUTTON, null, $.proxy(this._pesterDetailConfirm, this), null);
    }
    else {
      Tw.CommonHelper.openUrlExternal(Tw.OUTLINK.MOBILE_TWORLD);
    }
  },

  _pesterDetailConfirm: function () {
    this._popupService.close();
    // excel 기준 (조르기 : OS 내 페이지 공유화면 제공)
    var content = Tw.ALERT_MSG_MYT_DATA.DATA_PESTER.TITLE +
      this.data.svcInfo.svcNum + Tw.ALERT_MSG_MYT_DATA.DATA_PESTER.CONTENT + Tw.OUTLINK.MOBILE_TWORLD;
    Tw.CommonHelper.share(content);
  },

  // 리필쿠폰
  _onRefillDetail: function () {
    this._historyService.goLoad('/myt-data/recharge/coupon');
  },

  // 충전/선물내역 상세
  // _onBreakdownListDetail: function () {
  //   this._historyService.goLoad('/myt-data/datainfo');
  // },

  // 다른 회선 잔여량 상세
  _onOtherLinesItemDetail: function (event) {
    var $target = $(event.target).parents('[data-svc-mgmt-num]'),
        mgmtNum = $target.attr('data-svc-mgmt-num'),
        number  = $target.attr('data-num'),
        name    = $target.attr('data-name'),
        isChild = ($target.find('.icon-children').length > 0);
    if ( mgmtNum ) {
      if ( isChild ) {
        // 자녀회선
        this._historyService.goLoad('/myt-data/submain/child-hotdata?childSvcMgmtNum=' + mgmtNum);
      }
      else {
        var defaultLineInfo = this.data.svcInfo.svcNum + ' ' + this.data.svcInfo.nickNm;
        var selectLineInfo = number + ' ' + name;
        this.changeLineMgmtNum = mgmtNum;
        this._popupService.openModalTypeA(Tw.REMNANT_OTHER_LINE.TITLE,
          defaultLineInfo + Tw.MYT_TPL.DATA_SUBMAIN.SP_TEMP + selectLineInfo,
          Tw.REMNANT_OTHER_LINE.BTNAME, null, $.proxy(this._onChangeLineConfirmed, this), null);
      }
    }
  },

  // 다른 회선 더보기
  _onOtherLinesMore: function () {
    var totalCount = this.data.otherLines.length - this.$otherLines.length;
    if ( totalCount > 0 ) {
      this.data.otherLines.splice(0, totalCount);
      var length = this.data.otherLines.length > 20 ? 20 : this.data.otherLines.length;
      for ( var i = 0; i < length; i++ ) {
        var result = this.$moreTempleate(this.data.otherLines[i]);
        this.$container.find('ul.my-line-info').append(result);
      }
    }
  },

  // 다른 회선 팝업에서 변경하기 눌렀을 경우
  _onChangeLineConfirmed: function () {
    // 회선변경 API 호출
    var lineService = new Tw.LineComponent();
    lineService.changeLine(this.changeLineMgmtNum, null, $.proxy(this._onChangeSessionSuccess, this));
  },

  // 회선 변경 후 처리
  _onChangeSessionSuccess: function () {
    this._historyService.reload();
    if ( Tw.BrowserHelper.isApp() ) {
      setTimeout($.proxy(function () {
        this._popupService.toast(Tw.REMNANT_OTHER_LINE.TOAST);
      }, this), 500);
    }
  },

  _onOtherPages: function (event) {
    var $target = $(event.target);
    var href = $target.attr('data-href');
    this._historyService.goLoad(href);
  },

  _errorRequest: function (resp) {
    if ( !resp ) {
      resp = {
        code: '',
        msg: Tw.ALERT_MSG_COMMON.SERVER_ERROR
      };
    }
    Tw.Error(resp.code, resp.msg).pop();
  }
};