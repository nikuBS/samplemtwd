/**
 * FileName: myt.bill.billguide.subChildBill.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.16
 * Info: 자녀폰 사용요금 조회
 */

Tw.mytBillBillguideSubChildBill = function (rootEl, resData) {
  this.thisMain = this;
  this.resData = resData;
  this.init = this._init;
  Tw.Logger.info('[서버에서 데이터 받음]', resData);

  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this.selectDataInfo = {
    selNum : 0,
    selChildPhoneId : null,//svcMgmtNum
    selChildBillMonth : null//invDt
  };
  this.usedAmounts = null; //BFF_05_0047 사용요금 조회(본인/자녀)
  this._init();
};

Tw.mytBillBillguideSubChildBill.prototype = {
  _init: function () {
    Tw.Logger.info('[Tw.mytBillBillguideSubChildBill 초기화]');

    //this._queryInit();
    // this._getUsedAmounts({
    //   childSvcMgmtNum : this.selectDataInfo.selChildPhoneId,
    //   invDt: this.selectDataInfo.selChildBillMonth
    //});
    // this._getMyPlanReq({
    // });

    this._bindEvent();
  },
  //--------------------------------------------------------------------------[쿼리스트링]
  // _queryInit: function() {
  //   if(this.resData.circuitChildInfo.length > 0) { //자녀가 있을때
  //     this.selectDataInfo.selNum = ( this.resData.reqQuery.selNum ) ? this.resData.reqQuery.selNum : 0;
  //     this.selectDataInfo.selChildPhoneId = this.resData.circuitChildInfo[ this.selectDataInfo.selNum ].svcMgmtNum;
  //     this.selectDataInfo.selChildBillMonth = ( this.resData.reqQuery.invDt ) ? this.resData.reqQuery.invDt : null;
  //   }
  //},
  _cachedElement: function () {
    this.$childPhonenum = $('[data-target="childPhonenum"]');//회선번호
    this.$childPhonenumBtn = $('[data-target="childPhonenumBtn"]');
    this.$deviceInfo = $('[data-target="deviceInfo"]');//제품명

    this.$feePlanName = $('[data-target="feePlanName"]');//요금제명

    this.$billMonthName = $('[data-target="billMonthName"]');//청구월명
    this.$useAmtTot = $('[data-target="useAmtTot"]');//사용요금
    this.$periodOfUse = $('[data-target="periodOfUse"]');//사용기간
    this.$discountArea = $('[data-target="discountArea"]');//할인금액
    this.$unpaidChargesTot = $('[data-target="unpaidChargesTot"]');//미납요금
    this.$unpaidChargesList = $('[data-target="unpaidChargesList"]');//미납요금리스트

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="billMonthName"]', $.proxy(this._selPopOpen, this)); //조회 월 셀렉트 버튼
    this.$container.on('click', '[data-target="childPhonenumBtn"]', $.proxy(this._selChildPopOpen, this));
  },
  //--------------------------------------------------------------------------[이벤트 | 팝업 | 자녀회선 선택]
  _selChildPopOpen : function(event) {
    console.info('자녀버튼 클릭!!!!');
    var $target = $(event.currentTarget);
    var tempArr = this.resData.circuitChildInfo;
    var arrOption = [];
    for ( var i=0, len=tempArr.length; i<len; i++ ) {
      arrOption.push({
        'attr' : 'data-info="' + i + '"',
        text : tempArr[i].svcNum
      });
    }
    this._popupService.openChoice('자녀회선선택', arrOption, 'type1', $.proxy(this._selChildPopOpenEvt, this, $target));
  },
  _selChildPopOpenEvt: function ($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._selChildPopOpenEvtExe, this, $target, $layer));
  },
  _selChildPopOpenEvtExe: function ($target, $layer, event) {
    var curTg = $(event.currentTarget);
    var tg = $target;
    var dataTemp = curTg.find('button').attr('data-info');
    tg.text(curTg.text());
    tg.attr('data-info', dataTemp);
    //this._popupService.close();
    var paramData = {
      invDt: this.selectDataInfo.selChildBillMonth,
      selNum: dataTemp
    };
    this._goLoad('/myt/bill/billguide/subChildBill' + '?' + $.param(paramData));
  },
  //--------------------------------------------------------------------------[이벤트 | 팝업 | 청구월 선택]
  _selPopOpen : function(event) {
    var $target = $(event.currentTarget);
    var tempArr = this.resData.usedAmountChildInfo.invDtArr;
    var arrOption = [];
    for ( var i=0, len=tempArr.length; i<len; i++ ) {
      arrOption.push({
        'attr' : 'data-info="' + tempArr[i] + '"',
        text : this._getSelClaimDtBtn( tempArr[i] )
      });
    }
    this._popupService.openChoice('기간선택', arrOption, 'type1', $.proxy(this._selPopOpenEvt, this, $target));
  },
  _selPopOpenEvt: function ($target, $layer) {
    //$layer.on('click', '.popup-choice-list', $.proxy(this._selPopOpenEvtExe, this, $target, $layer));
    $layer.find('.popup-choice-list').on('click', $.proxy(this._selPopOpenEvtExe, this, $target, $layer) );

  },
  _selPopOpenEvtExe: function ($target, $layer, event) {
    console.info('청구월 선택');
    var curTg = $(event.currentTarget);
    var tg = $target;
    var dataTemp = curTg.find('button').attr('data-info');
    tg.text( curTg.text() );
    tg.attr('data-info', dataTemp );
    //this._popupService.close();
    var paramData = {
      invDt: dataTemp,
      selNum: this.selectDataInfo.selNum,
      childSvcMgmtNum:  this.resData.selectSvcMgmtNum
    };
    console.info('청구월 선택 > ', paramData);
    this._goLoad('/myt/bill/billguide/subChildBill' + '?' + $.param(paramData));
  },
  //--------------------------------------------------------------------------[데이터 완료후 실행]
  _myPlanReqInit: function(resObj) {
    console.info('[_myPlanReqInit 요금제명] : ', resObj);
    this._cachedElement();
    this.$feePlanName.html($.proxy(function(){
      var htmlStr = '';
      htmlStr += '';
      return htmlStr;
    }, this));

  },
  _usedAmountsInit: function() {
    this._cachedElement();

    this.$childPhonenumBtn.html($.proxy(function(){
      var htmlStr = '';
      htmlStr += this.resData.circuitChildInfo[ this.selectDataInfo.selNum ].svcNum;
      return htmlStr;
    }, this));

    this.$billMonthName.html($.proxy(function(){
      this.$billMonthName.attr( 'data-info', this.usedAmounts.invDt );
      var htmlStr = '';
      htmlStr += this._getSelClaimDtBtn( this.usedAmounts.invDt );
      htmlStr += '<span class="ico">';
      return htmlStr;
    }, this));

    this.$useAmtTot.html($.proxy(function(){
      var htmlStr = '';
      htmlStr = Tw.FormatHelper.addComma( this.usedAmounts.useAmtTot );
      return htmlStr;
    }, this));

    this.$periodOfUse.html($.proxy(function(){
        return this._getSelPeriod( this.usedAmounts.invDt );
    }, this));

    this.$discountArea.html($.proxy(function(){
      var tempMonth = Tw.DateHelper.getShortDateWithFormat(this.usedAmounts.invDt, 'M월');//청구월
      var usageFee = Tw.FormatHelper.addComma( this.usedAmounts.useAmtTot );//사용요금
      var discountRate = Tw.FormatHelper.addComma( String( Math.abs( Number(this.usedAmounts.deduckTotInvAmt) ) ) );//할인요금
      var htmlStr = '';
      htmlStr += '<p>';
      htmlStr += '<span class="num">' + tempMonth +'</span>';
      htmlStr += '월 사용 요금은 <span class="num">' + usageFee + '</span>원이고<br />';
      htmlStr += '<span class="num">' + discountRate + '</span>원을 할인 받으셨습니다.';
      htmlStr += '</p>';
      return htmlStr;
    }, this));

    this.$unpaidChargesTot.html($.proxy(function(){
      var htmlStr = '';
      htmlStr = Tw.FormatHelper.addComma( this.usedAmounts.unPayAmt );
      return htmlStr;
    }, this));

    this.$unpaidChargesList.html($.proxy(function(){

      var tempArr = this.usedAmounts.unPayAmtList;
      var htmlStr = '';

      for (var i=0, len=tempArr.length; i<len; i++) {
        var NonPaymentMonth = this._getSelClaimDtBtn( tempArr[i].invDt );
        var NonPaymentNum = tempArr[i].comBat;

        htmlStr += '<li>';
        htmlStr += '<dl class="pdt-wrap">';
        htmlStr += '<dt class="pdt-tit">' + NonPaymentMonth + '</dt>';
        htmlStr += '<dd class="pdt-price"><span class="num">' + NonPaymentNum + '</span>원</dd>';
        htmlStr += '</dl>';
        htmlStr += '</li>';
      }
      return htmlStr;
    }, this));

  },
  //--------------------------------------------------------------------------[api]
  // _getUsedAmounts: function(param) {//BFF_05_0047 사용요금 조회(본인/자녀)
  //   Tw.Logger.info('[param]', param);
  //
  //   this._apiService.request(Tw.API_CMD.BFF_05_0047, param)
  //     .done($.proxy(function(resp){
  //       Tw.Logger.info('[자녀폰 사용 요금조회]', resp);
  //       this.usedAmounts = resp.result;
  //       this._usedAmountsInit();
  //     }, this))
  //     .fail(function(err){})
  // },
  // _getMyPlanReq: function(param) {//BFF_05_0041 나의요금제
  //   Tw.Logger.info('[param]', param);
  //
  //   this._apiService.request(Tw.API_CMD.BFF_05_0041, param)
  //     .done($.proxy(function(resp){
  //       this._myPlanReqInit(resp.result);
  //     }, this))
  //     .fail(function(err){})
  // },

  //--------------------------------------------------------------------------[공통]
  _onOpenSelectPopup: function () {
    //$('.popup-info').addClass('scrolling');
  },
  _goHistory: function () {
    this._goLoad('/recharge/cookiz/history');
  },
  _goBack: function () {
    this._history.go(-1);
  },
  _goLoad: function (url) {
    location.href = url;
  },
  _go: function (hash) {
    window.location.hash = hash;
  },
  _getSelClaimDtBtn: function (str) {
    return moment(str).add(1, 'days').format('YYYY년 MM월');
  },
  _getSelPeriod: function(str) {
    var startDate = moment(str).format('YYYY.MM') + '.01';
    var endDate = moment(str).format('YYYY.MM.DD');
    return startDate + ' ~ ' + endDate;

  }


};
