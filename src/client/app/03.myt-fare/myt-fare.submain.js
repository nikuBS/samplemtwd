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
  this.data = params.data;
  this._rendered();
  this._bindEvent();
  this._initialize();
};

Tw.MyTFareSubMain.prototype = {
  loadingView: function (value, selector) {
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

  getLastDate: function (date) {
    var lDate = new Date(date.slice(0, 4), date.slice(4, 6), 0).getDate().toString();
    return date + lDate;
  },

  _rendered: function () {
    if ( this.data.type === 'UF' ) {
      if ( this.data.svcInfo.svcAttrCd === 'M2' ) {
        // 사용내역확인버튼
        this.$usedBrkd = this.$container.find('button[data-id=used-brkd]');
      }
      else {
        // 사용요금자세히보기
        this.$usedDetail = this.$container.find('button[data-id=used-detail]');
      }
    }
    else {
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
    }
    // 실시간요금버튼
    if ( this.data.isNotFirstDate ) {
      this.$realTimePay = this.$container.find('button[data-id=realtime-pay]');
    }
    if ( this.data.nonpayment ) {
      // 미납요금버튼
      this.$nonPayment = this.$container.find('button[data-id=non-payment]');
    }
    if ( this.data.paymentInfo ) {
      // 청구요금화면인 경우
      if ( this.data.type !== 'UF' ) {
        // 요금안내서설정버튼
        this.$billType = this.$container.find('button[data-id=bill-type]');
      }
      // 납부방법버튼
      this.$payMthd = this.$container.find('button[data-id=pay-mthd]');
    }
    if ( this.data.isMicroPrepay ) {
      // 소액결제
      this.$microBill = this.$container.find('button[data-id=micro-bill]');
    }
    if ( this.data.isContentPrepay ) {
      // 콘텐츠 이용료
      this.$contentBill = this.$container.find('button[data-id=content-bill]');
    }
    if ( this.data.totalPayment && this.data.totalPayment.length > 0 ) {
      // 최근납부내역상세
      this.$paymentDetail = this.$container.find('button[data-id=payment-detail]');
    }
    // 최근요금내역
    this.$billChart = this.$container.find('[data-id=bill-chart]');
    if ( this.data.otherLines.length > 0 ) {
      // 다른회선 요금 조회
      this.$otherLines = this.$container.find('[data-id=other-line]');
      this.$moreTempleate = Handlebars.compile(Tw.MYT_TPL.FARE_SUBMAIN.MORE_LINE_TEMP);
      if ( this.data.otherLines.length > 20 ) {
        this.$otherLinesMoreBtn = this.$otherLines.find('.bt-more button');
      }
    }
    // 세금계산서
    if ( this.data.taxInvoice ) {
      this.$taxInv = this.$container.find('[data-id=taxinv]');
    }
    // 기부금/후원금
    if ( this.data.contribution ) {
      this.$contribution = this.$container.find('[data-id=contbt]');
    }
    this.$otherPages = this.$container.find('[data-id=other-pages]');

    if ( this.data.banner.length > 0 ) {
      this.$bannerList = this.$container.find('[data-id=banner-list]');
    }
  },

  _bindEvent: function () {
    if ( this.data.type === 'UF' ) {
      if ( this.data.svcInfo.svcAttrCd === 'M2' ) {
        // 사용내역확인버튼
        this.$usedBrkd.on('click', $.proxy(this._onClickedSelBillGuide, this));
      }
      else {
        // 사용요금자세히보기
        this.$usedDetail.on('click', $.proxy(this._onClickedSelBillGuide, this));
      }
    }
    else {
      if ( this.data.svcInfo.svcAttrCd === 'M2' ) {
        // 사용내역확인버튼
        this.$usedBrkd.on('click', $.proxy(this._onClickedSelBillGuide, this));
      }
      else {
        // 요금안내서버튼
        this.$billReport.on('click', $.proxy(this._onClickedSelBillGuide, this));
        if ( this.data.isNotAutoPayment ) {
          // 요금납부버튼
          this.$billPym.on('click', $.proxy(this._onClickedBillPym, this));
        }
      }
    }
    // 실시간요금버튼
    if ( this.data.isNotFirstDate ) {
      this.$realTimePay.on('click', $.proxy(this._onClickedRealTimePay, this));
    }
    if ( this.data.nonpayment ) {
      // 미납요금버튼
      this.$nonPayment.on('click', $.proxy(this._onClickedNonPayment, this));
    }
    if ( this.data.paymentInfo ) {
      // 청구요금화면인 경우
      if ( this.data.type !== 'UF' ) {
        // 요금안내서설정버튼
        this.$billType.on('click', $.proxy(this._onClickedSetBillReport, this));
      }
      // 납부방법버튼
      this.$payMthd.on('click', $.proxy(this._onClickedPayMthd, this));
    }
    if ( this.data.isMicroPrepay ) {
      // 소액결제
      this.$microBill.on('click', $.proxy(this._onClickedMicroBill, this));
    }
    if ( this.data.isContentPrepay ) {
      // 콘텐츠 이용료
      this.$contentBill.on('click', $.proxy(this._onClickedContentBill, this));
    }
    if ( this.data.totalPayment && this.data.totalPayment.length > 0 ) {
      // 최근납부내역상세
      this.$paymentDetail.on('click', $.proxy(this._onClickedPaymentDetail, this));
    }
    // 다른회선 요금 조회
    if ( this.data.otherLines.length > 0 ) {
      this.$otherLines.on('click', $.proxy(this._onClickedOtherLine, this));
      if ( this.data.otherLines.length > 20 ) {
        this.$otherLinesMoreBtn.on('click', $.proxy(this._onOtherLinesMore, this));
      }
    }
    // 세금계산서
    if ( this.data.taxInvoice ) {
      this.$taxInv.on('click', $.proxy(this._onClickedTaxInvoice, this));
    }
    // 기부금/후원금
    if ( this.data.contribution ) {
      this.$contribution.on('click', $.proxy(this._onClickedContribution, this));
    }
    this.$otherPages.find('li').on('click', $.proxy(this._onOtherPages, this));
    if ( this.data.banner.length > 0 ) {
      this.$bannerList.on('click', 'li', $.proxy(this._onClickBannerItem, this));
    }
  },

  // chart create
  _initPatternChart: function (data) {
    this.$billChart.chart2({
      target: '.chart4', //클래스명 String
      type: (this.data.type === 'UF') ? Tw.CHART_TYPE.BAR_2 : Tw.CHART_TYPE.BAR_4, //bar
      average: true, // 평균
      legend: Tw.FARE_CHART_LEGEND, // 범례
      link: true,
      unit: Tw.CHART_UNIT.WON, // 표기
      data_arry: data //데이터 obj,
    });
    // chart 생성 후 event bind 처리
    this.$billChart.on('click', 'button', $.proxy(this._onClickedBillReport, this));
  },

  // 다른회선내역 리스트
  _initOtherLineList: function (list) {
    if ( list.length > 0 ) {
      for ( var i = 0; i < list.length; i++ ) {
        var $ul = this.$container.find('ul.my-line-info');
        var result = this.$moreTempleate(list[i]);
        $ul.append(result);
      }
    }
    setTimeout($.proxy(this._realTimeBillRequest, this), 300);
  },

  _initialize: function () {
    this._requestCount = -1;
    this._resTimerID = null;
    this._chartDefaultClass = 'chart_link item';
    this._svcMgmtNumList = [];
    this._feeChartInfo = [];
    /**
     * /청구요금인 경우
     * 1. 최근요금내역
     * 2. 다른회선요금조회
     * 3. 실시간 요금조회
     * 사용요금인 경우
     * 1. 사용요금내역
     * 2. 실시간 요금조회
     **/
    if ( this.data.type === 'UF' ) {
      this._usageFeeRequest();
    }
    else {
      this._claimPaymentRequest();
    }
  },

  // 사용요금내역조회-1
  _usageFeeRequest: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0021, {})
      .done($.proxy(this._responseUsageFee, this))
      .fail($.proxy(this._errorRequest, this));
  },

  // 사용요금내역조회-2
  _responseUsageFee: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( !Tw.FormatHelper.isEmpty(resp.result) && resp.result.recentUsageList.length > 0 ) {
        var items = resp.result.recentUsageList;
        var chart_data = [];
        for ( var idx = items.length - 1; idx > -1; idx-- ) {
          var item = items[idx];
          var date = item.invDt; // this.getLastDate(item.invDt);
          var amtStr = item.invAmt.replace(',', '');
          // var absDeduckStr = item.deduckInvAmt.replace(',', '');
          // --------------------
          var amt = parseInt(amtStr, 10);
          // var absDeduck = Math.abs(parseInt(absDeduckStr, 10));
          chart_data.push({
            't': Tw.DateHelper.getShortKoreanAfterMonth(date), // 날짜
            'v': amt // 사용금액
            // 'v2': absDeduck // 할인금액
          });
          this._feeChartInfo.push(date);
        }
        this._initPatternChart(chart_data);
      }
      else {
        this.$billChart.hide();
        this.$container.find('[data-id=bill-chart-empty]').hide();
      }
    }
    else {
      this.$billChart.hide();
      this.$container.find('[data-id=bill-chart-empty]').hide();
    }
    this._responseOtherLineBills();
    // setTimeout($.proxy(this._otherLineBills, this), 300);
    // setTimeout($.proxy(this._realTimeBillRequest, this), 300);
  },

  // 최근청구요금내역조회-1
  _claimPaymentRequest: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0020, {})
      .done($.proxy(this._responseClaimPayment, this))
      .fail($.proxy(this._errorRequest, this));
  },

  // 최근청구요금내역조회-2
  _responseClaimPayment: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( !Tw.FormatHelper.isEmpty(resp.result) && resp.result.recentUsageList.length > 0 ) {
        var items = resp.result.recentUsageList;
        var length = items.length > 6 ? 6 : items.length;
        var chart_data = [];
        for ( var idx = length - 1; idx > -1; idx-- ) {
          var item = items[idx];
          var date = item.invDt; // this.getLastDate(item.invDt);
          var amtStr = item.invAmt.replace(',', '');
          var absDeduckStr = item.deduckInvAmt.replace(',', '');
          // --------------------
          var amt = parseInt(amtStr, 10);
          var absDeduck = Math.abs(parseInt(absDeduckStr, 10));
          chart_data.push({
            't': Tw.DateHelper.getShortKoreanAfterMonth(date), // 날짜
            'v': amt, // 사용금액
            'v2': absDeduck // 할인금액
          });
          this._feeChartInfo.push(date);
        }
        this._initPatternChart(chart_data);
      }
      else {
        this.$billChart.hide();
        this.$container.find('[data-id=bill-chart-empty]').hide();
      }
    }
    else {
      this.$billChart.hide();
      this.$container.find('[data-id=bill-chart-empty]').hide();
    }
    setTimeout($.proxy(this._otherLineBills, this), 300);
  },

  // 다른회선청구요금 조회-1
  _otherLineBills: function () {
    var otherLineLength = this.data.otherLines.length;
    if ( otherLineLength > 0 ) {
      var requestCommand = [];
      for ( var idx = 0; idx < otherLineLength; idx++ ) {
        this._svcMgmtNumList.push(this.data.otherLines[idx].svcMgmtNum);
        requestCommand.push({
          command: this.data.type === 'UF' ? Tw.API_CMD.BFF_05_0047 : Tw.API_CMD.BFF_05_0036,
          // 서버 명세가 변경됨 svcMgmtNum -> T-svcMgmtNum
          headers: {
            'T-svcMgmtNum': this.data.otherLines[idx].svcMgmtNum
          }
        });
      }
      this._apiService.requestArray(requestCommand)
        .done($.proxy(this._responseOtherLineBills, this))
        .fail($.proxy(this._errorRequest, this));
    }
    else {
      this._responseOtherLineBills();
    }
  },

  // 다른회선청구요금 조회-2
  _responseOtherLineBills: function () {
    var combinList = [];
    var individualList = [];
    if ( arguments.length > 0 ) {
      for ( var idx = 0; idx < arguments.length; idx++ ) {
        if ( arguments[idx].code === Tw.API_CODE.CODE_00 ) {
          var item = arguments[idx].result;
          var amt = parseInt(item.useAmtTot || 0, 10);
          var isCombine = (item.paidAmtMonthSvcCnt > 1); // 통합청구여부
          var repSvc = (item.repSvcYn === 'Y'); // 대표청구여부
          var selectLine = this.__selectOtherLine(this._svcMgmtNumList[idx]);
          var data = _.extend({
            combine: isCombine,
            repSvc: repSvc,
            amt: Tw.FormatHelper.addComma(amt.toString()),
            svcType: this.__selectSvcType(selectLine.svcAttrCd),
            isAddr: (['S1', 'S2'].indexOf(selectLine.svcAttrCd) > -1)
          }, selectLine);
          if ( isCombine ) {
            combinList.push(data);
          }
          else {
            individualList.push(data);
          }
        }
      }
    }
    this._svcMgmtNumList = [];
    // 통합청구리스트, 개별청구리스트
    this._initOtherLineList(combinList.concat(individualList));
  },


  // 실시간 사용요금 요청-1
  _realTimeBillRequest: function () {
    // 매월 1일은 비노출, 휴대폰, T-PocketFi 인 경우에만 노출
    if ( this.data.isRealTime && this.data.isNotFirstDate ) {
      this.loadingView(true, 'button[data-id=realtime-pay]');
      this._resTimerID = setTimeout($.proxy(this._getBillResponse, this), 2500);
    }
  },

  // 실시간 사용요금 요청-2
  _getBillResponse: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0022, { count: ++this._requestCount })
      .done($.proxy(this._onReceivedBillData, this))
      .fail($.proxy(this._onErrorReceivedBillData, this));
  },

  // 실시간 사용요금 요청-3
  _onReceivedBillData: function (resp) {
    this.loadingView(false, 'button[data-id=realtime-pay]');
    if ( resp.result && resp.code === Tw.API_CODE.CODE_00 ) {
      if ( _.isEmpty(resp.result) ) {
        this._realTimeBillRequest();
      }
      else {
        if ( this._resTimerID ) {
          this.__resetTimer();
        }
        // 당월 기준으로 실시간 요금 노출
        var realtimeBillInfo = resp.result.hotBillInfo[0];
        this.$realTimePay.find('span.text').html(realtimeBillInfo.totOpenBal2 + Tw.CHART_UNIT.WON);
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

  // 요금안내서 이동(main)
  _onClickedSelBillGuide: function (/*event*/) {
    // 1. 통합청구, 2. 개별청구, 3. 보안솔루션
    // 선불폰, 사용요금
    this._historyService.goLoad('/myt-fare/billguide/guide');
  },

  // 요금납부 이동
  _onClickedBillPym: function (/*event*/) {
    new Tw.MyTFareBill(this.$container, this.data.svcInfo.svcAttrCd);
  },

  // 실시간요금 이동
  _onClickedRealTimePay: function (/*event*/) {
    this._historyService.goLoad('/myt-fare/bill/hotbill');
  },

  // 미납요금버튼
  _onClickedNonPayment: function (/*event*/) {
    this._historyService.goLoad('/myt-fare/unbill');
  },

  // 요금안내서 설정 이동
  _onClickedSetBillReport: function (/*event*/) {
    this._historyService.goLoad('/myt-fare/billsetup');
  },

  // 납부방법 이동
  _onClickedPayMthd: function (/*event*/) {
    if ( this.data.type !== 'UF' ) {
      this._historyService.goLoad('/myt-fare/bill/option');
    }
  },

  // 소액결제 이동
  _onClickedMicroBill: function (/*event*/) {
    this._openAdditionalService('M');
  },

  // 콘텐츠이용료 이동
  _onClickedContentBill: function (/*event*/) {
    this._openAdditionalService('C');
  },

  // 최근납부내역 이동
  _onClickedPaymentDetail: function (/*event*/) {
    this._historyService.goLoad('/myt-fare/info/history');
  },

  // 다른회선조회
  _onClickedOtherLine: function (event) {
    // 통합, 개별이면서 대표인 경우만 동작
    var $target = $(event.target).parents('[data-svc-mgmt-num]'),
        mgmtNum = $target.attr('data-svc-mgmt-num'),
        number  = $target.attr('data-num'),
        name    = $target.attr('data-name');
    if ( mgmtNum ) {
      // 기준회선변경
      var defaultLineInfo = this.data.svcInfo.svcNum + ' ' + (this.data.svcInfo.nickNm || this.data.svcInfo.eqpMdlNm);
      var selectLineInfo = number + ' ' + name;
      this.changeLineMgmtNum = mgmtNum;
      this._popupService.openModalTypeA(Tw.REMNANT_OTHER_LINE.TITLE,
        defaultLineInfo + Tw.MYT_TPL.DATA_SUBMAIN.SP_TEMP + selectLineInfo,
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
        this.$container.find('ul.my-line-info').append(result);
      }
    }
  },

  // 세금계산서 이동
  _onClickedTaxInvoice: function (/*event*/) {
    // SB 상 납부내역상세로 진입하도록 정의되어있음
    this._historyService.goLoad('/myt-fare/info/history');
  },

  // 기부금/후원금
  _onClickedContribution: function (/*event*/) {
    this._historyService.goLoad('/myt-fare/billguide/donation');
  },

  // 요금안내서 이동(chart)
  _onClickedBillReport: function (event) {
    var clsName = event.target.className;
    var index = clsName.replace('link', '');
    this._historyService.goLoad('/myt-fare/billguide/guide?date=' + this._feeChartInfo[index]);
  },

  _onErrorReceivedBillData: function (resp) {
    this.__resetTimer();
    this._errorRequest(resp);
  },

  // 다른 회선 팝업에서 변경하기 눌렀을 경우
  _onChangeLineConfirmed: function () {
    var lineService = new Tw.LineComponent();
    lineService.changeLine(this.changeLineMgmtNum, null, $.proxy(this._onChangeSessionSuccess, this));
  },

  // 회선 변경 후 처리
  _onChangeSessionSuccess: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._popupService.toast(Tw.REMNANT_OTHER_LINE.TOAST);
    }
    setTimeout($.proxy(function () {
      this._historyService.reload();
    }, this), 500);
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

  __resetTimer: function () {
    clearTimeout(this._resTimerID);
    this._requestCount = -1;
    this._resTimerID = null;
  },

  __selectSvcType: function (attrCd) {
    var clsNm = 'cellphone';
    if ( attrCd.indexOf('S') > -1 ) {
      clsNm = 'pc';
    }
    else if ( ['M3', 'M4'].indexOf(attrCd) > -1 ) {
      clsNm = 'tablet';
    }
    return clsNm;
  },

  __selectOtherLine: function (number) {
    var select = _.find(this.data.otherLines, function (item) {
      if ( item.svcMgmtNum === number ) {
        return item;
      }
    });
    return select;
  },

  _openAdditionalService: function (type) {
    var code, url;
    if ( type === 'M' ) {
      code = this.data.microPay.code;
      url = '/myt-fare/bill/small';
    }
    else {
      code = this.data.contentPay.code;
      url = '/myt-fare/bill/contents';
    }
    var title = '', content = '', more = '';
    switch ( code ) {
      case Tw.API_ADD_SVC_ERROR.BIL0030:
        title = Tw.ALERT_MSG_MYT_FARE.ADD_SVC.BIL0030;
        content = Tw.ALERT_MSG_MYT_FARE.ADD_SVC.BIL0030_C;
        more = Tw.ALERT_MSG_MYT_FARE.ADD_SVC.MORE;
        break;
      case Tw.API_ADD_SVC_ERROR.BIL0035:
      case Tw.API_ADD_SVC_ERROR.BIL0033:
        title = Tw.ALERT_MSG_MYT_FARE.ADD_SVC.BIL0033;
        content = Tw.ALERT_MSG_MYT_FARE.ADD_SVC.BIL0033_C;
        break;
      case Tw.API_ADD_SVC_ERROR.BIL0034:
        title = Tw.ALERT_MSG_MYT_FARE.ADD_SVC.BIL0034;
        content = Tw.ALERT_MSG_MYT_FARE.ADD_SVC.BIL0034_C;
        break;
    }
    if ( !_.isEmpty(title) ) {
      var option = {
        ico: 'type2',
        title: title,
        contents: content,
        bt: [{
          style_class: 'bt-blue1',
          txt: Tw.BUTTON_LABEL.CLOSE
        }]
      };
      if ( !_.isEmpty(more) ) {
        _.extend(option, {
          ico: 'type1',
          link_list: [{
            link: 'link-customer',
            txt: more
          }]
        });
      }
      this._popupService.open(option, $.proxy(this._openedLayerPopup, this), null, 'GR_02');
    }
    else {
      this._historyService.goLoad(url);
    }
  },

  _openedLayerPopup: function ($container) {
    var $moreBtn = $container.find('.link-list button');
    var $closeBtn = $container.find('.bt-blue1 button');
    if ( $moreBtn.length > 0 ) {
      $moreBtn.on('click', $.proxy(function () {
        this._popupService.close();
        this._historyService.goLoad('/product/callplan/NA00004184');
      }, this));
    }
    $closeBtn.on('click', $.proxy(function () {
      this._popupService.close();
    }, this));
  },

  _onOtherPages: function (event) {
    var $target = $(event.target);
    var href = $target.attr('data-href');
    this._historyService.goLoad(href);
  },

  _onClickBannerItem: function (event) {
    var $target = $(event.currentTarget);
    var url = $target.find('a').attr('data-href');
    Tw.CommonHelper.openUrlExternal(url);
  }
};
