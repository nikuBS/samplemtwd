/**
 * FileName: myt.bill.billguide.subDetailSpecification.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.16
 * Info: 통합청구 대표 > 상세요금 내역
 */

Tw.mytBillBillguideSubDetailSpecification = function (rootEl, resData) {
  this.thisMain = this;
  this.resData = resData;
  this.init = this._init;
  Tw.Logger.info('[서버에서 데이터 받음 mytBillBillguideSubDetailSpecification]', resData);

  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  return this;
};

Tw.mytBillBillguideSubDetailSpecification.prototype = {
  _init: function () {
    Tw.Logger.info('[Tw.mytBillBillguideSubDetailSpecification 초기화]');
    this._bindEvent();
  },
  _bindEvent: function () {
    //this.$container.on('click', '[data-target="totPaySelectBtn"]', $.proxy(this._totPaySelectFun, this));
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
