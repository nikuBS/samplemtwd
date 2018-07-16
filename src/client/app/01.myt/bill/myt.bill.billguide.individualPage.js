/**
 * FileName: myt.bill.billguide.individualPage.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.08
 * Info: 개별청구
 */

Tw.mytBillBillguideIndividualPage = function (rootEl, resData) {
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

Tw.mytBillBillguideIndividualPage.prototype = {
  _init: function () {
    //this.$refillBtn = this.$container.find('.link-long > a');
  },
  _bindEvent: function () {
    //this.$container.on('click', '.slick-slide', $.proxy(this._selectCoupon, this));
    this.$container.on('click', '[data-target="totPaySelectBtn"]', $.proxy(this._totPaySelectFun, this));
  },
  //--------------------------------------------------------------------------[이벤트 | 팝업]
  _totPaySelectFun : function(event) {//팝업 오픈
    var $target = $(event.currentTarget);
    var arrOption = [];
    for ( var i=0, len=this.resData.billpayInfo.invDtArr.length; i<len; i++ ) {
      arrOption.push({
        'attr':'onclick=""',
        text : this._getSelClaimDtBtn( this.resData.billpayInfo.invDtArr[i] )
      });
    }
    this._popupService.openChoice('기간선택', arrOption,
      'type1', $.proxy(this._totPaySelectEvt, this, $target));
  },
  _totPaySelectEvt: function ($target, $layer) {//이벤트 설정
    console.info('[$target]', $target);//버튼 타겟
    console.info('[$layer]', $layer);//팝업 레이어 타겟
    $layer.on('click', '.popup-choice-list', $.proxy(this._totPaySelectExe, this, $target));
  },
  _totPaySelectExe: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    //$target.attr('id', $selectedValue.find('button').attr('id'));
    $target.text($selectedValue.text());
    this._popupService.close();
  },
  //--------------------------------------------------------------------------[api]
  _getDetailSpecification: function() {

    $.ajax('http://localhost:3000/mock/myt.bill.billguide.BFF_05_00036.json')
      .done(function(resp){
        console.log('성공');
        Tw.Logger.info(resp);
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
  }
};
