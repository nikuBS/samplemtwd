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

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="detailedChargeBtn"]', $.proxy(this._goDetailSpecification, this));//가입 서비스별 상세 요금 버튼
    this.$container.on('click', '[data-target="selDateBtn"]', $.proxy(this._selPopOpen, this)); //조회 월 셀렉트 버튼

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
    //this._goLoad('selPayment');
  },
  //--------------------------------------------------------------------------[이용정지 해제]
  _goSusReleaseBtn: function() {
    Tw.Logger.info('이용정지 해제');
    //this._goLoad('susRelease');
  },
  //--------------------------------------------------------------------------[자녀폰 사용요금 조회]
  _goChildBill: function() {
    Tw.Logger.info('자녀폰 사용요금 조회');
    //this._goLoad('childBill');
  },
  //--------------------------------------------------------------------------[콜기프트 요금]
  _goCallBill: function() {
    Tw.Logger.info('콜기프트 요금');
    //this._goLoad('callBill');
  },
  //--------------------------------------------------------------------------[로밍 사용요금]
  _goRoamingBill: function() {
    Tw.Logger.info('로밍 사용요금');
    //this._goLoad('roamingBill');
  },
  //--------------------------------------------------------------------------[기부금/후원금]
  _goDonationBill: function() {
    Tw.Logger.info('기부금/후원금');
    //this._goLoad('donationBill');
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
    //this._goLoad('');
  },
  //--------------------------------------------------------------------------[이벤트 | 팝업]
  _selPopOpen : function(event) {
    var $target = $(event.currentTarget);
    var tempArr = this.resData.billpayInfo.invDtArr;
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
    $layer.on('click', '.popup-choice-list', $.proxy(this._selPopOpenEvtExe, this, $target, $layer));
  },
  _selPopOpenEvtExe: function ($target, $layer, event) {
    var curTg = $(event.currentTarget);
    var tg = $target;
    var dataTemp = curTg.find('button').attr('data-info');
    tg.text( curTg.text() );
    tg.attr('data-info', dataTemp );
    this._popupService.close();
    this._goLoad('http://localhost:3000/myt/bill/billguide?invDt='+ dataTemp);
  },
  //--------------------------------------------------------------------------[api]
  _getTest: function() {

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
