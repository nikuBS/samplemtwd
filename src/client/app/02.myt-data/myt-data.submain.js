/**
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.17
 *
 */

Tw.MyTDataSubMain = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this.data = params.data;
  this.immChargeData = {}; // 초기화
  this.loadingView(true);
  this._rendered();
  this._bindEvent();
  this._initialize();
};

Tw.MyTDataSubMain.prototype = {

  loadingView: function (value) {
    if ( value ) {
      skt_landing.action.loading.on({
        ta: '[data-id=wrapper]', co: 'grey', size: true
      });
    }
    else {
      skt_landing.action.loading.off({
        ta: '[data-id=wrapper]'
      });
    }
  },

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
    // TODO: 선불쿠폰 API 기능 완료 후 작업(TBD)
    // this.$prepayContainer = this.$container.find('[data-id=prepay-container]');
    if ( this.data.refill ) {
      this.$refillBtn = this.$container.find('[data-id=refill]');
    }
    if ( this.data.isBenefit ) {
      this.$dataBenefitBtn = this.$container.find('[data-id=benefit]');
      this.$dataUsefulBtn = this.$container.find('[data-id=useful]');
    }
    if ( this.data.pattern ) {
      this.$patternChart = this.$container.find('[data-id=pattern_chart]');
    }
    if ( this.data.breakdownList ) {
      this.$breakdownDetail = this.$container.find('[data-id=bd-container] .bt');
    }
    if ( this.data.otherLines.length > 0 ) {
      this.$otherLines = this.$container.find('[data-id=other-lines] li');
      if ( this.data.otherLines.length > 20 ) {
        this.$otherLinesMoreBtn = this.$otherLines.find('.bt-more button');
        this.$moreTempleate = Handlebars.compile(Tw.MYT_DATA_TPL.SUBMAIN.MORE_LINE_TEMP);
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
    if ( this.data.refill ) {
      this.$refillBtn.on('click', $.proxy(this._onRefillDetail, this));
    }
    if ( this.data.isBenefit ) {
      this.$dataBenefitBtn.on('click', $.proxy(this._onDataBenefitDetail, this));
      this.$dataUsefulBtn.on('click', $.proxy(this._onDataUsefulDetail, this));
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
    if ( this.data.immCharge ) {
      this._immediatelyChargeRequest();
    }
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
      var unit = '', data, chart_data;
      if ( this.data.pattern.data.length > 0 ) {
        unit = 'GB';
        data = this.data.pattern.data;
        chart_data = {
          co: '#3b98e6',// 색상
          da_arr: [
            {
              na:this.__getPatternMonth(data[2].invMth) ,// 각 항목 타이틀
              data: [this.__convertData(parseInt(data[2].totalUsage, 10))]// 배열 평균값으로 전달
            }, {
              na:this.__getPatternMonth(data[1].invMth) ,
              data: [this.__convertData(parseInt(data[1].totalUsage, 10))]
            }, {
              na:this.__getPatternMonth(data[0].invMth) ,
              data: [this.__convertData(parseInt(data[0].totalUsage, 10))]
            }
          ]
        };
      }
      else if ( this.data.pattern.voice.length > 0 ) {
        unit = 'time';
        data = this.data.pattern.voice;
        chart_data = {
          co: '#3b98e6',// 색상
          da_arr: [
            {
              na:this.__getPatternMonth(data[2].invMth) ,// 각 항목 타이틀
              data: [this.__secToMS(parseInt(data[2].totalUsage, 10))]// 배열 평균값으로 전달
            }, {
              na:this.__getPatternMonth(data[1].invMth) ,
              data: [this.__secToMS(parseInt(data[1].totalUsage, 10))]
            }, {
              na:this.__getPatternMonth(data[0].invMth) ,
              data: [this.__secToMS(parseInt(data[0].totalUsage, 10))]
            }
          ]
        };
      }

      this.$patternChart.chart({
        type: 'bar', //bar
        container: 'pattern', //클래스명 String
        unit: unit, //x축 이름
        guide_num: 1, //가이드 갯수
        decimal: 2, //소숫점자리
        data: chart_data //데이터 obj
      });
    }
  },

  // api request
  _immediatelyChargeRequest: function () {
    var apiList = [
      { command: Tw.API_CMD.BFF_06_0001, params: {} },
      { command: Tw.API_CMD.BFF_06_0020, params: {} },
      { command: Tw.API_CMD.BFF_06_0028, params: {} },
      { command: Tw.API_CMD.BFF_06_0034, params: {} }
    ];
    this._apiService.requestArray(apiList)
      .done($.proxy(function (refill, ting, etc, limit) {
        if ( refill.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.refill = refill.result;
        }
        else {
          this.immChargeData.refill = null;
        }
        if ( ting.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.ting = ting.result;
        }
        else {
          this.immChargeData.ting = null;
        }
        if ( etc.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.etc = etc.result;
        }
        else {
          this.immChargeData.etc = null;
        }
        if ( limit.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.limit = limit.result;
        }
        else {
          this.immChargeData.limit = null;
        }
        this.loadingView(false);
      }, this));
  },


  // event callback funtion
  _onRemnantDetail: function () {
    this._historyService.goLoad('/myt/data/usage');
  },

  _onImmChargeDetail: function () {
    var data = [];
    if ( this.immChargeData ) {
      if ( !_.isEmpty(this.immChargeData.refill) ) {
        data.push({
          'type': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.REFILL.TYPE,
          'list': [{
            'option': 'refill',
            'value': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.REFILL.VALUE,
            'text2': this.immChargeData.refill.length + Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.REFILL.UNIT
          }]
        });
      }
      // 선불 쿠폰 TODO: API 완료 후 적용 필요함(TBD)
      data.push(Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.PREPAY);
      var subList = [];
      if ( !_.isEmpty(this.immChargeData.limit) ) {
        subList.push({
          'option': 'limit',
          'value': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.VALUE.LIMIT
        });
      }
      if ( !_.isEmpty(this.immChargeData.etc) ) {
        subList.push({
          'option': 'etc',
          'value': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.VALUE.ETC
        });
      }
      if ( !_.isEmpty(this.immChargeData.ting) ) {
        subList.push({
          'option': 'ting',
          'value': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.VALUE.TING
        });
      }
      data.push({
        'type': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.TYPE,
        'list': subList
      });
    }
    this._popupService.open({
        hbs: 'DC_04',// hbs의 파일명
        layer: true,
        title: Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.TITLE,
        data: data
      }, $.proxy(this._onImmediatelyPopupOpened, this),
      $.proxy(this._onImmediatelyPopupClosed, this), 'DC_04');
  },

  _onTPresentDetail: function () {
    this._historyService.goLoad('/myt/data/gift');
  },

  // 데이터 혜텍
  _onDataBenefitDetail: function () {
    this._popupService.openAlert('TBD');
  },

  // 데이터활용하기
  _onDataUsefulDetail: function () {
    this._popupService.openAlert('TBD');
  },

  // 리필쿠폰
  _onRefillDetail: function () {
    this._historyService.goLoad('/myt/data/recharge/coupon');
  },

  // 충전/선물내역 상세
  _onBreakdownListDetail: function () {
    this._historyService.goLoad('/myt/data/recharge/history');
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
      this._historyService.goLoad('/myt/data/usage/child/' + mgmtNum);
    }
    else {
      var defaultLineInfo = this.data.svcInfo.svcNum + ' ' + this.data.svcInfo.nickNm;
      var selectLineInfo = number + ' ' + name;
      this.changeLineMgmtNum = mgmtNum;
      this._popupService.openModalTypeA(Tw.REMNANT_OTHER_LINE.TITLE,
        defaultLineInfo + Tw.MYT_DATA_TPL.SUBMAIN.SP_TEMP + selectLineInfo,
        Tw.REMNANT_OTHER_LINE.BTNAME, null, $.proxy(this._onChangeLineConfirmed, this), null);
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
        this.$otherLines.parents('ul.list-comp-lineinfo').append(result);
      }
    }
  },

  // 다른 회선 팝업에서 변경하기 눌렀을 경우
  _onChangeLineConfirmed: function () {
    // 회선변경 API 호출
    // TODO: 선택회선변경에 대한 class 분리예정, 완료되면 적용!!
    this._apiService.request(Tw.NODE_CMD.CHANGE_SESSION, {
      svcMgmtNum: this.changeLineMgmtNum
    }).done($.proxy(this._onChangeSessionSuccess, this));
  },

  // DC_04 팝업내 아이템 선택시 이동
  _onImmDetailLimit: function () {
    this._historyService.goLoad('/myt/data/limit');
  },

  _onImmDetailEtc: function () {
    this._historyService.goLoad('/myt/data/cookiz');
  },

  _onImmDetailTing: function () {
    this._historyService.goLoad('/myt/data/ting');
  },

  _onImmDetailRefill: function () {
    this._historyService.goLoad('/myt/data/refill/coupon');
  },


  // DC_O4 팝업 호출 후
  _onImmediatelyPopupOpened: function ($container) {
    var items = $container.find('li');
    for ( var i = 0; i < items.length; i++ ) {
      var item = items.eq(i);
      switch ( item.attr('class') ) {
        case 'limit':
          item.on('click', $.proxy(this._onImmDetailLimit, this));
          break;
        case 'etc':
          item.on('click', $.proxy(this._onImmDetailEtc, this));
          break;
        case 'ting':
          item.on('click', $.proxy(this._onImmDetailTing, this));
          break;
        case 'refill':
          item.on('click', $.proxy(this._onImmDetailRefill, this));
          break;
      }
    }
  },

  // DC_04 팝업 close 이후 처리 부분 - 만약 사용될 경우가 없다면 제거예정
  _onImmediatelyPopupClosed: function () {
  },

  // 회선 변경 후 처리
  _onChangeSessionSuccess: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.close();
      this._popupService.toast(Tw.REMNANT_OTHER_LINE.TOAST);
      setTimeout($.proxy(function () {
        this._historyService.reload();
      }, this), 300);
    }
  }
};
