/**
 * FileName: myt.bill.billguide.combineRepresentPage.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.08
 * Info: 통합청구(대표)
 */

Tw.mytBillBillguideCombineRepresentPage = function (rootEl, resData) {
  this.thisMain = this;
  this.resData = resData;
  Tw.Logger.info('[서버에서 데이터 받음]', resData);

  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();
  this._bindEvent();

};

Tw.mytBillBillguideCombineRepresentPage.prototype = {
  _init: function () {
    //-----------------------------------[서브페이지 js 파일 정의]
    this.SubDetailSpecification = new Tw.mytBillBillguideSubDetailSpecification($('#wrapFdev'), this.resData);//통합청구 대표 > 상세요금 내역
    this.SubSelPayment = new Tw.mytBillBillguideSubSelPayment($('#wrapFdev'), this.resData);//납부가능일 선택
    this.SubSusRelease = new Tw.mytBillBillguideSubSusRelease($('#wrapFdev'), this.resData);//이용정지 해제
    this.SubChildBill = new Tw.mytBillBillguideSubChildBill($('#wrapFdev'), this.resData);//자녀폰 사용요금 조회
    this.SubCallBill = new Tw.mytBillBillguideSubCallBill($('#wrapFdev'), this.resData);//콜기프트 요금
    this.SubRoamingBill = new Tw.mytBillBillguideSubRoamingBill($('#wrapFdev'), this.resData);//로밍 사용요금
    this.SubDonationBill = new Tw.mytBillBillguideSubDonationBill($('#wrapFdev'), this.resData);//기부금/후원금
  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="detailedChargeBtn"]', $.proxy(this._goDetailSpecification, this));//가입 서비스별 상세 요금 버튼
    this.$container.on('click', '[data-target="totPaySelectBtn"]', $.proxy(this._totPaySelectFun, this)); //조회 월 셀렉트 버튼

    this.$container.on('click', '[data-target="selPaymentBtn"]', $.proxy(this._goSelPayment, this));//납부가능일 선택
    this.$container.on('click', '[data-target="susReleaseBtn"]', $.proxy(this._goSusReleaseBtn, this));//이용정지 해제
    this.$container.on('click', '[data-target="childBillBtn"]', $.proxy(this._goChildBill, this));//자녀폰 사용요금 조회
    this.$container.on('click', '[data-target="callBillBtn"]', $.proxy(this._goCallBill, this));//콜기프트 요금
    this.$container.on('click', '[data-target="roamingBillBtn"]', $.proxy(this._goRoamingBill, this));//로밍 사용요금
    this.$container.on('click', '[data-target="donationBillBtn"]', $.proxy(this._goDonationBill, this));//기부금/후원금

    this.$container.on('click', '[data-target="partialRedemptionBtn"]', $.proxy(this._goPartialRedemption, this));//정할인/단말분할상환정보
    this.$container.on('click', '[data-target="extraSvcBtn"]', $.proxy(this._goExtraSvcBill, this));//요금제/부가서비스 할인내역확인

  },
  //--------------------------------------------------------------------------[납부가능일 선택]
  _goSelPayment: function() {
    Tw.Logger.info('납부가능일 선택');
    this._go('#selPayment');
    this.SubSelPayment.init();
  },
  //--------------------------------------------------------------------------[이용정지 해제]
  _goSusReleaseBtn: function() {
    Tw.Logger.info('이용정지 해제');
    this._go('#susRelease');
    this.SubSusRelease.init();
  },
  //--------------------------------------------------------------------------[자녀폰 사용요금 조회]
  _goChildBill: function() {
    Tw.Logger.info('자녀폰 사용요금 조회');
    this._go('#childBill');
    this.SubChildBill.init();
  },
  //--------------------------------------------------------------------------[콜기프트 요금]
  _goCallBill: function() {
    Tw.Logger.info('콜기프트 요금');
    this._go('#callBill');
    this.SubCallBill.init();
  },
  //--------------------------------------------------------------------------[로밍 사용요금]
  _goRoamingBill: function() {
    Tw.Logger.info('로밍 사용요금');
    this._go('#roamingBill');
    this.SubRoamingBill.init();
  },
  //--------------------------------------------------------------------------[기부금/후원금]
  _goDonationBill: function() {
    Tw.Logger.info('기부금/후원금');
    this._go('#donationBill');
    this.SubDonationBill.init();
  },

  //--------------------------------------------------------------------------[정할인/단말분할상환정보]
  _goPartialRedemption: function() {
    Tw.Logger.info('정할인/단말분할상환정보');
    //this._goLoad('');
  },

  //--------------------------------------------------------------------------[요금제/부가서비스 할인내역확인]
  _goExtraSvcBill: function() {
    Tw.Logger.info('요금제/부가서비스 할인내역확인');
    //this._goLoad('');
  },

  //--------------------------------------------------------------------------[이벤트]
  _goDetailSpecification: function () {//상세요금조회
    Tw.Logger.info('상세요금 내역');
    this._go('#dtailSpecification');
    this.SubDetailSpecification.init();
  },
  //--------------------------------------------------------------------------[이벤트 | 팝업]
  _totPaySelectFun : function(event) {//------팝업 오픈
    Tw.Logger.info('기간선택팝업');
    var $target = $(event.currentTarget);
    var arrOption = [];
    for ( var i=0, len=this.resData.billpayInfo.invDtArr.length; i<len; i++ ) {
      arrOption.push({
        'attr' : 'data-info="' + this.resData.billpayInfo.invDtArr[i] + '"',
        text : this._getSelClaimDtBtn( this.resData.billpayInfo.invDtArr[i] )
      });
    }
    this._popupService.openChoice('기간선택', arrOption, 'type1', $.proxy(this._totPaySelectEvt, this, $target));
  },
  _totPaySelectEvt: function ($target, $layer) {//------팝업이벤트 설정
    $layer.on('click', '.popup-choice-list', $.proxy(this._totPaySelectExe, this, $target, $layer));
  },
  _totPaySelectExe: function ($target, $layer, event) {

    var queryStr = this._getUrlParamsJson();//쿼리스트링 Json
    var queryStrLen = Object.keys(queryStr).length; //쿼리스트링 갯수
    var $curTg = $(event.currentTarget);
    var dataInfo = {
      invDt :$curTg.find('button').attr('data-info')
    };
    var dataInfoEnc = $.param( dataInfo, true );
    var dataInfoDec = decodeURIComponent( dataInfoEnc );

    location.hash = '';
    var hrefStr = $(location).attr('href').replace('#', '');//해시 삭제

    if(queryStrLen > 0) {
      (queryStr.invDt) ? '' : hrefStr += '&' + dataInfoDec;
    } else {
      (queryStr.invDt) ? '' : hrefStr += '?' + dataInfoDec;
    }

    console.info('[hrefStr]', hrefStr);

    this._goLoad(hrefStr);

    //this._popupService.close();
  },
  //--------------------------------------------------------------------------[api]
  _getDetailSpecification: function() {

    $.ajax('http://localhost:3000/mock/myt.bill.billguide.BFF_05_00036.json')
      .done(function(resp){
        console.log('성공');
        Tw.Logger.info(resp);

        var filterAfterData = []; //필터링데이터
        var tgData = resp.result.paidAmtDetailInfo; //paidAmtDetailInfo
        var tgSvcNum = resp.result.paidAmtMonthSvcNum; //서비스번호

        //서비스번호 각각을 추출해서 필터링한다.
        for (var i=0, len=tgSvcNum.length; i<len; i++) {
          var tempVar = _.filter(tgData, function(item) {
            return item.svcMgmtNum == tgSvcNum[i].svcMgmtNum;
          });
          filterAfterData.push(tempVar);
        }

        Tw.Logger.info('[필터링 데이터] : ', filterAfterData);

        // var paidAmtDetailInfo = _.filter(
        //   resp.result.paidAmtDetailInfo,
        //   function( item ){
        //     return item.svcMgmtNum === '1144012200' ;
        //   });
        //
        // Tw.Logger.info('[필터링 데이터] : ', paidAmtDetailInfo);

      })
      .fail(function(err) {
        console.log('실패');
        Tw.Logger.info(err);
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
  _getUrlParamsJson: function() {
    var params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
    return params;
  }

};
