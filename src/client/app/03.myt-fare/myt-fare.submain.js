/**
 * FileName: myt-fare-submain.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.28
 *
 */

Tw.MyTFareSubMain = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this._requestCount = -1;
  this._resTimerID = null;
  this.data = params.data;
  this.loadingView(true);
  this._rendered();
  this._bindEvent();
  this._initialize();
};

Tw.MyTFareSubMain.prototype = {

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
    if ( this.data.svcInfo.svcAttrCd === 'M2' ) {
      // 사용내역확인버튼
      this.$usedBrkd = this.$container.find('button[data-id=used-brkd]');
    }
    else {
      // 요금안내서버튼
      this.$billReport = this.$container.find('button[data-id=bill-report]');
      if ( this.data.isNotAutoPayment ) {
        // 요금납부버튼
        this.$billPym = this.$container.find('button[data-id=bill-pym]');
      }
    }
    // 실시간요금버튼
    this.$realTimePay = this.$container.find('button[data-id=realtime-pay]');
    if ( this.data.nopayment ) {
      // 미납요금버튼
      this.$nonPayment = this.$container.find('button[data-id=non-payment]');
    }
    if ( this.data.paymentInfo ) {
      // 요금안내서설정버튼
      this.$billType = this.$container.find('button[data-id=bill-type]');
      // 납부방법버튼
      this.$payMthd = this.$container.find('button[data-id=pay-mthd]');
    }

    if ( this.data.isMicroPayment ) {
      // 소액결제
      this.$microBill = this.$container.find('button[data-id=micro-bill]');
      // 콘텐츠 이용료
      this.$contentBill = this.$container.find('button[data-id=content-bill]');
    }
    if ( this.data.totalPayment && this.data.totalPayment.length > 0 ) {
      // 최근납부내역상세
      this.$paymentDetail = this.$container.find('button[data-id=payment-detail]');
    }
    // 최근요금내역
    this.$billChart = this.$container.find('[data-id=bill-chart]');
    // 다른회선 요금 조회
    this.$otherLines = this.$container.find('[data-id=other-line]');
  },

  _bindEvent: function () {

  },

  // chart create
  _initPatternChart: function (data) {
    this.$billChart.chart({
      type: 'bar2', //bar
      container: 'chart4', //클래스명 String
      unit: '원', //x축 이름
      decimal: 'won', //소숫점자리
      data: data //데이터 obj
    });
  },
  _initialize: function () {
    // 1. 최근요금내역
    // 2. 다른회선요금조회
    // 3. 실시간 요금조회
    this._claimPaymentRequest();
  },

  // 최근요금내역조회
  _claimPaymentRequest: function () {
    var claimDtArray = this.data.claim.invDtArr;
    if ( claimDtArray.length > 0 ) {
      var requestCommand = [];
      for ( var index = 0; index < claimDtArray.length; index++ ) {
        requestCommand.push({
          command: Tw.API_CMD.BFF_05_0036, params: {
            invDt: claimDtArray[index]
          }
        });
      }
      this._apiService.requestArray(requestCommand)
        .done($.proxy(this._responseClaimPayment, this))
        .fail($.proxy(this._errorRequest, this));
    }
    else {

    }
  },

  _responseClaimPayment: function () {
    if ( arguments.length > 0 ) {
      var chart_data = {
        co: '#3b98e6', //색상
        da_arr: []
      };
      for ( var idx = arguments.length - 1; idx > -1; idx-- ) {
        if ( arguments[idx].code === Tw.API_CODE.CODE_00 ) {
          var item = arguments[idx].result;
          // deduckTotInvAmt 값이 ' - '로 되어있어 더한다.
          var amt = parseInt(item.useAmtTot, 10) + parseInt(item.deduckTotInvAmt, 10);
          var absDeduck = Math.abs(parseInt(item.deduckTotInvAmt, 10));
          chart_data.da_arr.push({
            'na': Tw.DateHelper.getShortKoreanMonth(item.invDt), // 날짜
            'class': 'chart_link item' + idx,
            'data': [amt], // 청구금액
            'sale': [absDeduck] // 할인금액
          });
        }
      }
      if ( chart_data.da_arr.length > 0 ) {
        this._initPatternChart(chart_data);
      }
      setTimeout($.proxy(this._otherLineBills, this), 300);
      this.loadingView(false);
    }
  },

  // 다른 회선 요금 조회
  _otherLineBills: function () {

  },

  // 실시간 사용요금 요청
  _realTimeBillRequest: function () {
    this._resTimerID = setTimeout($.proxy(this._getBillResponse, this), 2500);
  },

  _getBillResponse: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, { count: this._requestCount++ })
      .done($.proxy(this._onReceivedBillData, this))
      .fail($.proxy(this._onErrorReceivedBillData, this));
  },


  _onReceivedBillData: function (resp) {
    if ( resp.result && resp.code === Tw.API_CODE.CODE_00 ) {
      if ( _.isEmpty(resp.result) ) {
        this._realTimeBillRequest();
      }
      else {
        if ( this._resTimerID ) {
          this.__resetTimer();
        }
        // 당월 기준으로 실시간 요금 노출
        // var realtimeBillInfo = resp.result.hotBillInfo[0];
      }
    }
    else if ( resp.code === Tw.MYT_FARE_SUB_MAIN.NO_BILL_REQUEST_EXIST ) {
      // 요청을 하지 않은 경우
      this._requestCount = -1;
      this._realTimeBillRequest();
    }
    else {
      this._onErrorReceivedBillData(resp);
    }
  },

  _onErrorReceivedBillData: function (resp) {
    this.__resetTimer();
    this._errorRequest(resp);
  },

  _errorRequest: function (resp) {
    this.loadingView(false);
    Tw.Error(resp.code, resp.msg).pop();
  },

  __resetTimer: function () {
    clearTimeout(this._resTimerID);
    this._requestCount = -1;
    this._resTimerID = null;
  },

  __getPatternMonth: function (value) {
    return value.slice(value.length - 2, value.length) + Tw.PERIOD_UNIT.MONTH;
  }
};
