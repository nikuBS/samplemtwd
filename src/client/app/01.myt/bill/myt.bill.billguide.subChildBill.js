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
  Tw.Logger.info('[서버에서 데이터 받음 mytBillBillguideSubChildBill]', resData);

  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this.selectDataInfo = { //조회 할때 사용할 데이터
    selectChildPhoneId : null,
    selectChildBillMonth : null
  };

  this.usedAmounts = null; //BFF_05_0047 사용요금 조회(본인/자녀)

  return this;
};

Tw.mytBillBillguideSubChildBill.prototype = {
  _init: function () {
    Tw.Logger.info('[Tw.mytBillBillguideSubChildBill 초기화]');
    this.selectDataInfo.selectPhoneId = this.resData.circuitChildInfo[0].svcMgmtNum;

    this._bindEvent();
    this._getUsedAmounts();
  },
  _cachedElement: function () {
    this.$childPhonenum = $('[data-target="childPhonenum"]');//회선번호
    //this.$childPhonenumBtn = $('[data-target="childPhonenumBtn"]');
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
    //this.$container.on('click', '[data-target="totPaySelectBtn"]', $.proxy(this._totPaySelectFun, this));
  },
  _usedAmountsInit: function() {
    this._cachedElement();

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
  _getUsedAmounts: function() {//BFF_05_0047 사용요금 조회(본인/자녀)

    $.ajax('http://localhost:3000/mock/myt.bill.billguide.BFF_05_00047.json')
      .done($.proxy(function(resp){
        console.log('성공');
        Tw.Logger.info('[BFF_05_00047]', resp);
        this.usedAmounts = resp.result;
        this._usedAmountsInit();

      }, this))
      .fail(function(err) {
        console.log('실패');
        Tw.Logger.info('[BFF_05_00047]', err);
      });


    // this._apiService.request(Tw.API_CMD.BFF_05_0036, { detailYn: 'Y' })
    //   .done(function(resp){
    //     Tw.Logger.info('[청구요금 | 상세요금조회]', resp);
    //   })
    //   .fail(function(err){})
  },

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
