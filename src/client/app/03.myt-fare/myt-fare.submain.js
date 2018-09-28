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
      if( this.data.isNotAutoPayment) {
        // 요금납부버튼
        this.$billPym = this.$container.find('button[data-id=bill-pym]');
      }
    }
    // 실시간요금버튼
    this.$realTimePay = this.$container.find('button[data-id=realtime-pay]');
    if (this.data.nopayment) {
      // 미납요금버튼
      this.$nonPayment = this.$container.find('button[data-id=non-payment]');
    }
    if (this.data.paymentInfo) {
      // 요금안내서설정버튼
      this.$billType = this.$container.find('button[data-id=bill-type]');
      // 납부방법버튼
      this.$payMthd = this.$container.find('button[data-id=pay-mthd]');
    }

    if(this.data.isMicroPayment) {
      // 소액결제
      this.$microBill = this.$container.find('button[data-id=micro-bill]');
      // 콘텐츠 이용료
      this.$contentBill = this.$container.find('button[data-id=content-bill]');
    }
    if (this.data.totalPayment && this.data.totalPayment.length > 0) {
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

  _initialize: function () {
    setTimeout($.proxy(this._initPatternChart, this), 300);
  },

  // chart create
  _initPatternChart: function () {
    /*jshint es5: false */
    var chart_data = {
      co: '#3b98e6',//색상
      da_arr: [
        {
          na: '3월',//각 항목 타이틀
          'class': 'link1',
          data: [3000],//배열 평균값으로 전달
          sale: [2700]//퍼센트로 처리
        }, {
          na: '4월',
          'class': 'link2',
          data: [12100],
          sale: [5000]
        }, {
          na: '5월',
          'class': 'link3',
          data: [52100],
          sale: [20050]
        },
        {
          na: '6월',
          'class': 'link4',
          data: [82500],
          sale: [30000]
        }, {
          na: '7월',
          'class': 'link5',
          data: [0],
          sale: [0]
        }, {
          na: '8월',
          'class': 'link6',
          data: [72500],
          sale: [10000]
        }
      ]
    };
    $(document).on('ready', function () {
      $('body').chart({
        type: 'bar2', //bar
        container: 'chart4', //클래스명 String
        unit: '원', //x축 이름
        decimal: 'won', //소숫점자리
        data: chart_data //데이터 obj
      });
    });
  },

  // 최근 청구요금 내역

  // 다른 회선 요금 조회

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
