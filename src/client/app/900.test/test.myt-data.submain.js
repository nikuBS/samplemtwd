/**
 * @file
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018.09.17
 *
 */

Tw.TestMyTDataSubMain = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this.data = params.data;
  this._rendered();
  this._bindEvent();
  this._initialize();
};

Tw.TestMyTDataSubMain.prototype = {

  _rendered: function () {
    // 실시간잔여 상세
    this.$remnantBtn = this.$container.find('[data-id=remnant-detail]');
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
    if ( this.data.breakdownList ) {
      this.$breakdownDetail = this.$container.find('[data-id=bd-container] .bt');
    }
    if ( this.data.otherLines.length > 0 ) {
      this.$otherLines = this.$container.find('[data-id=other-lines]');
      if ( this.data.otherLines.length > 20 ) {
        this.$otherLinesMoreBtn = this.$otherLines.find('.bt-more button');
        this.$moreTempleate = Handlebars.compile(Tw.MYT_TPL.DATA_SUBMAIN.MORE_LINE_TEMP);
      }
    }
  },

  _bindEvent: function () {
    this.$remnantBtn.on('click', $.proxy(this._onRemnantDetail, this));
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

    if ( this.data.breakdownList ) {
      this.$breakdownDetail.on('click', $.proxy(this._onBreakdownListDetail, this));
    }
    if ( this.data.otherLines.length > 0 ) {
      this.$otherLines.on('click', $.proxy(this._onOtherLinesItemDetail, this));
      if ( this.data.otherLines.length > 20 ) {
        this.$otherLinesMoreBtn.on('click', $.proxy(this._onOtherLinesMore, this));
      }
    }
  },

  _initialize: function () {
    if ( this.data.pattern ) {
      setTimeout($.proxy(this._initPatternChart, this), 300);
    }
  },

  __getPatternMonth: function (value) {
    return value.slice(value.length - 2, value.length) + Tw.PERIOD_UNIT.MONTH;
  },

  __convertData: function (value) {
    return (value / 1024 / 1024).toFixed(2);
  },

  __secToMS: function (seconds) {
    var time = parseInt(seconds, 10);
    var h_min = (time / 3600) * 60;
    var min = Math.round(h_min + ((time % 3600) / 60));
    var sec = time % 60;

    return min + ':' + sec;
  },

  // chart create
  _initPatternChart: function () {
    if ( this.data.pattern.data.length > 0 || this.data.pattern.voice.length > 0 ) {
      var unit = '', data, chart_data, idx;
      if ( this.data.pattern.data.length > 0 ) {
        unit = 'GB';
        data = this.data.pattern.data;
        chart_data = {
          co: '#3b98e6',// 색상
          da_arr: []
        };
        if ( data.length > 0 ) {
          for ( idx = data.length - 1; idx >= 0; idx-- ) {
            chart_data.da_arr.push({
              na: this.__getPatternMonth(data[idx].invMth),// 각 항목 타이틀
              data: [this.__convertData(parseInt(data[idx].totalUsage, 10))]// 배열 평균값으로 전달
            });
          }
        }
      }
      else if ( this.data.pattern.voice.length > 0 ) {
        unit = Tw.CHART_UNIT.TIME;
        data = this.data.pattern.voice;
        chart_data = {
          co: '#3b98e6',// 색상
          da_arr: []
        };
        for ( idx = data.length - 1; idx >= 0; idx-- ) {
          chart_data.da_arr.push({
            na: this.__getPatternMonth(data[idx].invMth),// 각 항목 타이틀
            data: [this.__convertData(parseInt(data[idx].totalUsage, 10))]// 배열 평균값으로 전달
          });
        }
      }

      this.$patternChart.chart({
        type: Tw.CHART_TYPE.BAR, //bar
        container: 'pattern', //클래스명 String
        unit: unit, //x축 이름
        guide_num: 1, //가이드 갯수
        decimal: 2, //소숫점자리
        data: chart_data //데이터 obj
      });
    }
  },

  // event callback funtion
  _onRemnantDetail: function () {
    this._historyService.goLoad('/myt-data/hotdata');
  },

  _onImmChargeDetail: function () {
    // if ( this.data.svcInfo.svcAttrCd === 'M2' ) {
    //   new Tw.PPSRechargeLayer(this.$container);
    // }
    // else {
      new Tw.ImmediatelyRechargeLayer(this.$container);
    // }
  },

  _onTPresentDetail: function () {
    // if ( this.data.svcInfo.svcAttrCd === 'M2' ) {
    //   // PPS 인 경우 자동알람서비스
    //   if ( Tw.BrowserHelper.isApp() ) {
    //     // TODO: 금융거래 본인인증 작업이 완료되면 이후 처리 우선은 페이지 이동으로만 처리하고 완료 후 [DC_09_05] 이동
    //     this._popupService.openAlert('TBD');
    //   }
    //   else {
    //     // 웹인 경우 모바일 앱으로 유도 (설치/미설치)
    //     this._popupService.openModalTypeA(Tw.ALERT_MSG_COMMON.T_WORLD_APP_MOVED.TITLE,
    //       Tw.ALERT_MSG_COMMON.T_WORLD_APP_MOVED.MSG, Tw.ALERT_MSG_COMMON.T_WORLD_APP_MOVED.BUTTON,
    //       $.proxy(this._onOpenTworldMovedAlert, this), $.proxy(this._onConfirmTworldMovedAlert, this), this);
    //   }
    // }
    // else {
      this._historyService.goLoad('/myt-data/giftdata');
    // }
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
    if ( this.data.family.possible ) {
      // TODO: 미가입 관련 상태 업데이트 후 처리
      this._historyService.goLoad('/product/callplan?prod_id=NA00006031');
    }
    else {
      this._historyService.goLoad('/myt-data/familydata');
    }
  },

  // 데이터 혜텍
  _onDataBenefitDetail: function () {
    // 혜택 할인 페이지 BPCP 페이지
    Tw.CommonHelper.openUrlExternal(Tw.OUTLINK.DATA_FACTORY);
  },

  // 데이터 조르기
  _onDataPesterDetail: function () {
    //  2_A17 Alert 호출
    this._popupService.openModalTypeA(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.TITLE, Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.MSG,
      Tw.ALERT_MSG_MYT_DATA.ALERT_2_A17.BUTTON, null, $.proxy(this._pesterDetailConfirm, this), null);
  },

  _pesterDetailConfirm: function () {
    this._popupService.close();
    // excel 기준 (조르기 : OS 내 페이지 공유화면 제공)
    var content = Tw.ALERT_MSG_MYT_DATA.DATA_PESTER.TITLE +
      '010-****-***2' + Tw.ALERT_MSG_MYT_DATA.DATA_PESTER.CONTENT;
    Tw.CommonHelper.share(content);
  },

  // 리필쿠폰
  _onRefillDetail: function () {
    this._historyService.goLoad('/myt-data/recharge/coupon');
  },

  // 충전/선물내역 상세
  _onBreakdownListDetail: function () {
    this._historyService.goLoad('/myt-data/datainfo');
  },

  // 다른 회선 잔여량 상세
  _onOtherLinesItemDetail: function (event) {
    var $target = $(event.target).parents('[data-svc-mgmt-num]'),
        mgmtNum = $target.attr('data-svc-mgmt-num'),
        number  = $target.attr('data-num'),
        name    = $target.attr('data-name'),
        isChild = ($target.find('.badge').length > 0);
    if ( isChild ) {
      // 자녀회선
      this._historyService.goLoad('/myt-data/submain/child-hotdata/' + mgmtNum);
    }
    else {
      var defaultLineInfo = this.data.svcInfo.svcNum + ' ' + this.data.svcInfo.nickNm;
      var selectLineInfo = number + ' ' + name;
      this.changeLineMgmtNum = mgmtNum;
      this._popupService.openModalTypeA(Tw.REMNANT_OTHER_LINE.TITLE,
        defaultLineInfo + Tw.MYT_TPL.DATA_SUBMAIN.SP_TEMP + selectLineInfo,
        Tw.REMNANT_OTHER_LINE.BTNAME, null, $.proxy(this._onChangeLineConfirmed, this), null);
    }
  },

  // 다른 회선 더보기
  _onOtherLinesMore: function () {
    var totalCount = this.data.otherLines.length - this.$otherLines.find('li').length;
    if ( totalCount > 0 ) {
      this.data.otherLines.splice(0, totalCount);
      var length = this.data.otherLines.length > 20 ? 20 : this.data.otherLines.length;
      for ( var i = 0; i < length; i++ ) {
        var result = this.$moreTempleate(this.data.otherLines[i]);
        this.$otherLines.parents('ul.list-comp-lineinfo').append(result);
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
  }
};