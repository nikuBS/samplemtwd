Tw.MyTFareSubMain = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this.data = params.data;
  this._menuId = this.data.pageInfo.menuId;
  this._rendered();
  this._bindEvent();
  this._initialize();
  // 배너 관련 통계 이벤트(xtractor)
  this._xtractorService = new Tw.XtractorService(this.$container);
};

Tw.MyTFareSubMain.prototype = {
  _loadingView: function (value, selector) {
      if ( !selector ) {
      selector = '[data-id="wrapper"]';
      }
      if ( value ) {
      Tw.CommonHelper.startLoading(selector, 'white', false);
      }
      else {
      Tw.CommonHelper.endLoading(selector);
      }
  },
  _rendered: function () {
    // 요금안내서버튼
    this.$billReport = this.$container.find('button[data-id=bill-report]');
      
    // 실시간요금버튼
    if ( this.data.isNotFirstDate ) {
        this.$realTimePay = this.$container.find('button[data-id=realtime-pay]');
    }

  },
 
  _bindEvent: function () {
      // 요금안내서버튼
      this.$billReport.on('click', $.proxy(this._onClickedSelBillGuide, this));

      // 실시간요금버튼
      if ( this.data.isNotFirstDate ) {   //jgmik
          this.$realTimePay.on('click', $.proxy(this._onClickedRealTimePay, this));
      }

      if ( this.data.paymentInfo ) {
          // 청구요금화면인 경우
          if ( this.data.type !== 'UF' ) {
              // 요금안내서설정버튼
              this.$billType.on('click', $.proxy(this._onClickedSetBillReport, this));
          }
      }
    
  },
  _initialize: function () {

      this._requestCount = -1;
      this._resTimerID = null;
      this._svcMgmtNumList = [];
      this._feeChartInfo = [];

      this._chart_data = this.data.billInvAmtList;

      //차트 데이타 생성
      var chart_data = [];
      for(var i=0; i < this._chart_data.length; i++) {
          var info = {};
          info.t  = this._chart_data[i].invDtText;
          info.v  = Number(this._chart_data[i].invAmt);
          info.v2 = Number(this._chart_data[i].dcAmt);
          info.class = 'chartLink'+i;

          chart_data.push(info);
          this._feeChartInfo.push( this._chart_data[i].invDt );
      }
  
      this.$billChart = $('body').find('[data-id=bill-chart]');
      this.$billChart.chart2({
          target:'.kjs10',
          type : 'bar6',
          average : true,
          legend : ['Fees', 'Discount'],
          link : true,
          unit : '₩', // gb, 원, time
          data_arry : chart_data
      });
      this.$billChart.on('click', '.kjs10 button', $.proxy(this._onClickedBillReport, this));

      // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
      this._lineComponent = new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
  },
  // 요금안내서 이동(chart)
  _onClickedBillReport: function (event) {
      var clsName = event.target.className;
      var index = clsName.replace('chartLink', '');

      this._xtractorService.logClick( this.data.xtEid[index] , "NO" );
      this._historyService.goLoad('/en/myt-fare/billguide/guide?date=' + this._feeChartInfo[index]);
  },
  _onClickedSelBillGuide: function (event) {
      this._historyService.goLoad('/en/myt-fare/billguide/guide');
  },
}
