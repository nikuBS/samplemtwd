/**
 * MenuName: 나의 요금 > 서브메인(MF2)
 * @file myt-fare-submain.js
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018.09.28
 * Summary: 최근 청구/사용/미납요금 조회, 및 각 상세화면으로 이동 등
 * Description:
 *   청구,사용요금 조회 - data.type이 UF인 경우 사용요금 조회 아닌 경우 청구요금 조회
 *   소액결제, 컨텐츠이용내역(성능개선 사항으로 미조회->버튼 무조건 노출)
 *   세금계산서,기부금내역 조회
 *   실시간 요금 조회 (매월 1일 미조회)
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
  // 배너 관련 통계 이벤트(xtractor)
  new Tw.XtractorService(this.$container);
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
    if ( this.data.unPaidTotSum ) {
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
    // 성능개선 대상으로 무조건 노출로 변경
    // if ( this.data.isMicroPrepay ) {
      // 소액결제
      this.$microBill = this.$container.find('button[data-id=micro-bill]');
    // }
    // 성능개선 대상으로 무조건 노출로 변경
    // if ( this.data.isContentPrepay ) {
      // 콘텐츠 이용료
      this.$contentBill = this.$container.find('button[data-id=content-bill]');
    // }
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
        this.$otherLinesMoreBtn = this.$otherLines.find('.btn-more button');
      }
    }
    // 세금계산서
    // if ( this.data.taxInvoice ) {
    this.$taxInv = this.$container.find('[data-id=taxinv]');
    // }
    // 기부금/후원금
    // if ( this.data.contribution ) {
    this.$contribution = this.$container.find('[data-id=contbt]');
    // }
    this.$otherPages = this.$container.find('[data-id=other-pages]');
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
    if ( this.data.unPaidTotSum ) {
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
    // 성능개선 대상으로 무조건 노출로 변경
    // if ( this.data.isMicroPrepay ) {
      // 소액결제
      this.$microBill.on('click', $.proxy(this._onClickedMicroBill, this));
    // }
    // 성능개선 대상으로 무조건 노출로 변경
    // if ( this.data.isContentPrepay ) {
      // 콘텐츠 이용료
      this.$contentBill.on('click', $.proxy(this._onClickedContentBill, this));
    // }
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
    // if ( this.data.taxInvoice ) {
    this.$taxInv.on('click', $.proxy(this._onClickedTaxInvoice, this));
    // }
    // 기부금/후원금
    // if ( this.data.contribution ) {
    this.$contribution.on('click', $.proxy(this._onClickedContribution, this));
    // }
    this.$otherPages.find('li').on('click', $.proxy(this._onOtherPages, this));
  },

  // lazyloading 처리
  _initScroll: function () {
    this._checkScroll();
    $(window).scroll($.proxy(function () {
      this._checkScroll();
    }, this));
  },

  _checkScroll: function () {
    if ( !this._isRequestTax && this._elementScrolled(this.$taxInv.parent()) ) {
      this._requestTaxContribute();
    }
  },

  _elementScrolled: function (element) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = element.offset().top;
    return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
  },

  // chart create
  _initPatternChart: function (data) {
    this.$billChart.chart2({
      target: '.chart4', //클래스명 String
      type: (this.data.type === 'UF') ? Tw.CHART_TYPE.BAR_2 : Tw.CHART_TYPE.BAR_4, //bar
      average: true, // 평균
      average_place: 'right',
      legend: (this.data.type === 'UF') ? Tw.FARE_CHART_LEGEND.USAGE : Tw.FARE_CHART_LEGEND.DEFAULT, // 범례
      link: true,
      unit: Tw.CHART_UNIT.WON, // 표기
      data_arry: data //데이터 obj,
    });
    // chart 생성 후 event bind 처리
    this.$billChart.on('click', '.chart4 button', $.proxy(this._onClickedBillReport, this));
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
    // FIXME: 성능개선으로 실시간요금 조회하지 않도록 수정
    // setTimeout($.proxy(this._realTimeBillRequest, this), 300);
  },

  _initialize: function () {
    this._requestCount = -1;
    this._resTimerID = null;
    this._svcMgmtNumList = [];
    this._feeChartInfo = [];
    //this._initBanners();
    this._getTosAdminMytFareBanner();
    this._initScroll();
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
      // 성능개선사항으로 api가 합처짐
      // this._usageFeeRequest();
      this._responseUsageFee({result: this.data.usage, code: Tw.API_CODE.CODE_00});
    }
    else {
      // 성능개선사항으로 api가 합처짐
      // this._claimPaymentRequest();
      this._responseClaimPayment({result: this.data.claim, code: Tw.API_CODE.CODE_00});
    }
  },

  /**
   * @function
   * @desc 토스 배너 정보 요청
   * @private
   */
  _getTosAdminMytFareBanner: function () {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_NEW_BANNER_TOS, params: { code: '0009' } },
      { command: Tw.NODE_CMD.GET_BANNER_ADMIN, params: { menuId: this._menuId } }
    ]).done($.proxy(this._successTosAdminMytFareBanner, this))
      .fail($.proxy(this._errorRequest, this));
  },

  /**
   * @function
   * @desc 토스 배너 처리
   * @param resp
   * @private
   */
  _successTosAdminMytFareBanner: function (banner1, admBanner) {
    var result = [{ target: 'M', banner: banner1 }];

    result.forEach(function(row){
      if(row.banner && row.banner.code === Tw.API_CODE.CODE_00){
        if(!row.banner.result.summary){
          row.banner.result.summary = {target: row.target};  
        }
        row.banner.result.summary.kind = Tw.REDIS_BANNER_TYPE.TOS;
        row.banner.result.imgList = Tw.CommonHelper.setBannerForStatistics(row.banner.result.imgList, row.banner.result.summary);
      }else{
        row.banner = { result: {summary : { target: row.target }, imgList : [] } };
      }

      if(admBanner.code === Tw.API_CODE.CODE_00){
        row.banner.result.imgList = row.banner.result.imgList.concat( 
          admBanner.result.banners.map(function(admbnr){
            admbnr.kind = Tw.REDIS_BANNER_TYPE.ADMIN;
            admbnr.bnnrImgAltCtt = admbnr.bnnrImgAltCtt.replace(/<br>/gi, ' ');
            return admbnr;
          })
        );
      }
    })
    this._drawTosAdminMytFareBanner(result);
  },

  /**
   * @function
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
  _drawTosAdminMytFareBanner: function (banners) {
    _.map(banners, $.proxy(function (bnr) {
      if ( bnr.banner.result.bltnYn === 'N' ) {
        this.$container.find('ul.slider[data-location=' + bnr.target + ']').parents('div.nogaps').addClass('none');
      }
      
      if ( !Tw.FormatHelper.isEmpty(bnr.banner.result.summary) 
          && bnr.banner.result.imgList.length > 0) {
        new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN, bnr.banner.result.imgList, bnr.target, $.proxy(this._successDrawBanner, this));
      }else{
        this.$container.find('[data-id=banners-empty]').hide();
        this.$container.find('[data-id=banners]').hide();
      }
    }, this));
    
    new Tw.XtractorService(this.$container);

  },

  // 배너 check
  _checkBanner: function (result) {
    return (result.bltnYn === 'N' || result.tosLnkgYn === 'Y');
  },

  // 배너 ui 처리
  _successDrawBanner: function () {
    this.$bannerList = this.$container.find('[data-id=banner-list]');
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.CommonHelper.resetHeight(this.$bannerList[0]);
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
      if ( !Tw.FormatHelper.isEmpty(resp.result) && resp.result.usedAmtList.length > 0 ) {
        var items = resp.result.usedAmtList;
        var length = items.length > 6 ? 6 : items.length;
        var chart_data = [];
        for ( var idx = length - 1; idx > -1; idx-- ) {
          var item = items[idx];
          var date = item.invDt; // this.getLastDate(item.invDt);
          var amtStr = item.invAmt.replace(/,/g, '');
          // var absDeduckStr = item.deduckInvAmt.replace(',', '');
          // --------------------
          var amt = parseInt(amtStr, 10);
          // var absDeduck = Math.abs(parseInt(absDeduckStr, 10));
          chart_data.push({
            't': this._recentChartDate(date), // 날짜
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
      if ( !Tw.FormatHelper.isEmpty(resp.result) && resp.result.billInvAmtList.length > 0 ) {
        var items = resp.result.billInvAmtList;
        var length = items.length > 6 ? 6 : items.length;
        var chart_data = [];
        for ( var idx = length - 1; idx > -1; idx-- ) {
          var item = items[idx];
          var date = item.invDt; // this.getLastDate(item.invDt);
          var amtStr = item.invAmt.replace(/,/g, '');
          var absDeduckStr = item.dcAmt.replace(/,/g, '');
          // --------------------
          var amt = parseInt(amtStr, 10);
          var absDeduck = Math.abs(parseInt(absDeduckStr, 10));
          chart_data.push({
            't': this._recentChartDate(date), // 날짜
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
    // 성능 개선 항목으로 요금조회 하지 않고 화면 표시하도록 수
    // var otherLineLength = this.data.otherLines.length;
    // if ( otherLineLength > 0 ) {
    //   var requestCommand = [];
    //   for ( var idx = 0; idx < otherLineLength; idx++ ) {
    //     this._svcMgmtNumList.push(this.data.otherLines[idx].svcMgmtNum);
    //     requestCommand.push({
    //       command: this.data.otherLines[idx].actRepYn === 'N' ? Tw.API_CMD.BFF_05_0047 : Tw.API_CMD.BFF_05_0036,
    //       // 서버 명세가 변경됨 svcMgmtNum -> T-svcMgmtNum
    //       headers: {
    //         'T-svcMgmtNum': this.data.otherLines[idx].svcMgmtNum
    //       }
    //     });
    //   }
    //   this._apiService.requestArray(requestCommand)
    //     .done($.proxy(this._responseOtherLineBills, this))
    //     .fail($.proxy(this._errorRequest, this));
    // }
    // else {
    //   this._responseOtherLineBills();
    // }
    this._responseOtherLineBills();
  },

  // 다른회선청구요금 조회-2
  _responseOtherLineBills: function () {
    var otherLineLength = this.data.otherLines.length > 20 ? 20 : this.data.otherLines.length;
    var combinList = [];
    var individualList = [];
    if ( otherLineLength > 0 ) {
      for ( var idx = 0; idx < otherLineLength; idx++ ) {
        // if ( arguments[idx].code === Tw.API_CODE.CODE_00 ) {
        // var item = arguments[idx].result;
        // var amt = parseInt(item.useAmtTot || 0, 10);
        var item = this.data.otherLines[idx];
        // 전체회선 조회에서는 통합청구여부 정보를 확인 할 수 없음 -> 통합청구 icon 미노출로 결정
        // var isCombine = (item.paidAmtMonthSvcCnt > 1); // 통합청구여부
        var isCombine = false;
        var repSvc = (item.actRepYn === 'Y'); // 대표청구여부
        var data = _.extend({
          combine: isCombine,
          repSvc: repSvc,
          amt: '',
          svcType: this.__selectSvcType(item.svcAttrCd),
          isAddr: (['S1', 'S2'].indexOf(item.svcAttrCd) > -1)
        }, item);
        if ( isCombine ) {
          combinList.push(data);
        }
        else {
          individualList.push(data);
        }
        // }
      }
    }
    // this._svcMgmtNumList = [];
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

  /**
   * 세금계산서, 기부금내역 조회
   * @private
   */
  _requestTaxContribute: function () {
    this._isRequestTax = true;

    // 두 api 조회를 확인하기 위한 변수
    this._isResponsedTax = false;
    this._isResponsedCont = false;

    // 세금계산서 재발행 조회
    this._apiService.request(Tw.SESSION_CMD.BFF_07_0017, {})
      .done($.proxy(this._responseTax, this))
      .fail($.proxy(this._errorRequest, this));
    // 기부금 내역 조회
    this._apiService.request(Tw.API_CMD.BFF_05_0038, {})
      .done($.proxy(this._responseContribute, this))
      .fail($.proxy(this._errorRequest, this));


    // 세금계산서 재발행을 위한 내역조회 캐싱처리를 위해 request 분기(성능개선 대상)
    /*this._apiService.requestArray([
      { command: Tw.API_CMD.BFF_07_0017 },
      { command: Tw.API_CMD.BFF_05_0038 }
    ]).done($.proxy(this._responseTaxContribute, this))
      .fail($.proxy(this._errorRequest, this));*/
  },

  /**
   * 세금계산서 조회결과 처리
   * @param tax - 조회결과
   * @private
   */
  _responseTax: function (tax) {
    if ( tax.code === Tw.API_CODE.CODE_00 ) {
      this.data.taxInvoice = tax.result;
    }
    //if ( tax.code === 'BIL0018' ) {}
    // 사업자 번호를 조회할 수 없는 상황
    this._isResponsedTax = true;
    this._responseTaxContribute();
  },

  /**
   * 기부금 조회결과 처리
   * @param cont - 조회결과
   * @private
   */
  _responseContribute: function (cont) {
    if ( cont.code === Tw.API_CODE.CODE_00 ) {
      if ( cont.result.donationList && cont.result.donationList.length > 0 ) {
        this.data.contribution = cont.result;
      }
    }
    this._isResponsedCont = true;
    this._responseTaxContribute();
  },

  /**
   * 세금계산서, 기부금내역 조회 결과 후 ur 처리
   * @private
   */
  _responseTaxContribute: function () {
    // 동시에 조회하기 때문에 두 result 모두 받은 후 하단 로직으로..
    if(!this._isResponsedTax || !this._isResponsedCont){
      return;
    }
    var twoPiece = this.data.taxInvoice && this.data.contribution;
    if ( !twoPiece ) {
      if ( !this.data.taxInvoice && !this.data.contribution ) {
        this.$container.find('[data-id="tc-container-empty"]').show();
        this.$container.find('[data-id="tc-container"]').hide();
      }
      else if ( this.data.taxInvoice ) {
        this.$taxInv.parent().removeClass('btn-link-list').addClass('full-link-list');
        this.$taxInv.find('button').append(Tw.MYT_TPL.FARE_SUBMAIN.TAX_TEMP);
        this.$contribution.hide();
      }
      else if ( this.data.contribution ) {
        this.$contribution.parent().removeClass('btn-link-list').addClass('full-link-list');
        this.$contribution.find('button').append(Tw.MYT_TPL.FARE_SUBMAIN.CONTB_TEMP);
        this.$taxInv.hide();
      }
    }
  },


  /* // 세금계산서 재발행을 위한 내역조회 캐싱처리를 위해 request 분기(성능개선 대상)
  _responseTaxContribute: function (tax, cont) {
    if ( cont.code === Tw.API_CODE.CODE_00 ) {
      if ( cont.result.donationList && cont.result.donationList.length > 0 ) {
        this.data.contribution = cont.result;
      }
    }

    if ( tax.code === Tw.API_CODE.CODE_00 ) {
      this.data.taxInvoice = tax.result;
    }
    //if ( tax.code === 'BIL0018' ) {}
    // 사업자 번호를 조회할 수 없는 상황

    var twoPiece = this.data.taxInvoice && this.data.contribution;
    if ( !twoPiece ) {
      if ( !this.data.taxInvoice && !this.data.contribution ) {
        this.$container.find('[data-id="tc-container-empty"]').hide();
        this.$container.find('[data-id="tc-container"]').hide();
      }
      else if ( this.data.taxInvoice ) {
        this.$taxInv.parent().removeClass('btn-link-list').addClass('full-link-list');
        this.$taxInv.find('button').append(Tw.MYT_TPL.FARE_SUBMAIN.TAX_TEMP);
        this.$contribution.hide();
      }
      else if ( this.data.contribution ) {
        this.$contribution.parent().removeClass('btn-link-list').addClass('full-link-list');
        this.$contribution.find('button').append(Tw.MYT_TPL.FARE_SUBMAIN.CONTB_TEMP);
        this.$taxInv.hide();
      }
    }
  },*/

  // 최근사용요금 월표시 (당해년 제외 년월로 표시)
  _recentChartDate: function (date) {
    var curYear = new Date().getFullYear();
    var nextMonth = Tw.DateHelper.AddMonth(date);
    var inputYear = Tw.DateHelper.convDateFormat(nextMonth).getFullYear();
    return Tw.DateHelper.getShortKoreanAfterMonth(date, (curYear !== inputYear));
  },

  // 요금안내서 이동(main)
  _onClickedSelBillGuide: function (/*event*/) {
    // 1. 통합청구, 2. 개별청구, 3. 보안솔루션
    // 선불폰, 사용요금
    this._historyService.goLoad('/myt-fare/billguide/guide');
  },

  // 요금납부 이동
  _onClickedBillPym: function (event) {
    new Tw.MyTFareBill(this.$container, this.data.svcInfo.svcAttrCd, $(event.currentTarget));
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
      mgmtNum = $target.attr('data-svc-mgmt-num');
    if ( mgmtNum ) {
      this.changeLineMgmtNum = mgmtNum;
      this.changeLineMdn = $target.attr('data-num');

      // 기준회선변경
      // 닉네임이 없는 경우 팻네임이 아닌  서비스 그룹명으로 노출 [DV001-14845]
      var target  = _.find(this.data.otherLines,  {svcMgmtNum: mgmtNum});
      this._popupService.openSwitchLine(this.data.svcInfo, target, Tw.REMNANT_OTHER_LINE.BTNAME, null,
        $.proxy(this._onChangeLineConfirmed, this), null, 'change_line');
    }
  },

  // 다른 회선 더보기
  _onOtherLinesMore: function () {
    var index = this.$otherLines.find('li').length;
    var totalCount = this.data.otherLines.length - index;
    if ( totalCount === 0 ) {
      this.$otherLinesMoreBtn.hide();
      return;
    }
    var length = totalCount > 20 ? 20 : totalCount;
    for ( var i = 0; i < length; i++ ) {
      var item = this.data.otherLines[index + i];
      // 전체회선 조회에서는 통합청구여부 정보를 확인 할 수 없음 -> 통합청구여부 icon 출력안하기로 결정됨
      // var isCombine = (item.paidAmtMonthSvcCnt > 1); // 통합청구여부
      var isCombine = false;
      var repSvc = (item.actRepYn === 'Y'); // 대표청구여부
      var data = _.extend({
        combine: isCombine,
        repSvc: repSvc,
        amt: '',
        svcType: this.__selectSvcType(item.svcAttrCd),
        isAddr: (['S1', 'S2'].indexOf(item.svcAttrCd) > -1)
      }, item);
      var result = this.$moreTempleate(data);
      this.$container.find('ul.my-line-info').append(result);
    }
  },

  // 세금계산서 이동
  _onClickedTaxInvoice: function (/*event*/) {
    if ( this.data.taxInvoice ) {
      // SB 상 납부내역상세로 진입하도록 정의되어있음
      this._historyService.goLoad('/myt-fare/info/history');
    }
  },

  // 기부금/후원금
  _onClickedContribution: function (/*event*/) {
    if ( this.data.contribution ) {
      this._historyService.goLoad('/myt-fare/billguide/donation');
    }
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
    lineService.changeLine(this.changeLineMgmtNum, this.changeLineMdn, $.proxy(this._onChangeSessionSuccess, this));
  },

  // 회선 변경 후 처리
  _onChangeSessionSuccess: function (resp) {

    if(resp.code === Tw.CALLBACK_CODE.SUCCESS){
      if ( Tw.BrowserHelper.isApp() ) {
        Tw.CommonHelper.toast(Tw.REMNANT_OTHER_LINE.TOAST);
      }
      setTimeout($.proxy(function () {
        // ios에서 reload하니까 앱이 멈춰버리는 현상이 있어서 url 이동으로 변경(DV001-17774)
        // this._historyService.reload();
        this._historyService.goLoad('/myt-fare/submain');
      }, this), 500);
    }
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
      if ( attrCd === 'S1' ) {
        clsNm = 'internet';
      } else {
        clsNm = 'pc';
      }
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

  /**
   * 소액결제, 컨텐츠 이용료 화면으로 이동
   * 원래는 node에서 내혁 조회후 error type에 해당하는 메세지를 팝업했지만 성능개선항목으로
   * 소액결제, 컨텐츠 이용료 버튼을 무조건 노출로 변경 -> type이용안하고 무조건 해당 화면으로 이동
   * @param type
   * @private
   */
  _openAdditionalService: function (type) {
    var code, url;
    if ( type === 'M' ) {
      // code = this.data.microPay.code;
      url = '/myt-fare/bill/small';
    }
    else {
      // code = this.data.contentPay.code;
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
      this._popupService.openModalTypeA(title, content, Tw.BUTTON_LABEL.CLOSE, $.proxy(this._openedLayerPopup, this),
        null, null, 'GR_02');
      // this._popupService.open(option, $.proxy(this._openedLayerPopup, this), null, 'GR_02');
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
        this._historyService.goLoad('/product/callplan?prod_id=NA00004184');
      }, this));
    }
    $closeBtn.on('click', $.proxy(function () {
      this._popupService.close();
    }, this));
  },

  _onOtherPages: function (event) {
    var $target = $(event.target);
    var href = $target.attr('data-href');
    if(!href) {
      return;
    }
    this._historyService.goLoad(href);
  }
};
