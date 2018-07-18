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
    //this.$container.on('click', '[data-target="totPaySelectBtn"]', $.proxy(this._totPaySelectFun, this));
    this.$container.on('click', '[data-target="selDateBtn"]', $.proxy(this._selPopOpen, this)); //조회 월 셀렉트 버튼
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
    this._goLoad('/myt/bill/billguide?invDt='+ dataTemp);
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
