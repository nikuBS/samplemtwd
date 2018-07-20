/**
 * FileName: myt.bill.billguide.subSusRelease.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.16
 * Info: 이용정지 해제
 */

Tw.mytBillBillguideSubSusRelease = function (rootEl, resData) {
  this.thisMain = this;
  this.resData = resData;
  this.init = this._init;
  Tw.Logger.info('[서버에서 데이터 받음 mytBillBillguideSubSusRelease]', resData);

  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();
};

Tw.mytBillBillguideSubSusRelease.prototype = {
  _init: function () {
    Tw.Logger.info('[Tw.mytBillBillguideSubSusRelease 초기화]');
    this._bindEvent();
  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="cancelBtn"]', $.proxy(this._goBack, this));
    this.$container.on('click', '[data-target="susReleaseBtn"]', $.proxy(this._susReleaseFun, this));
  },
  //--------------------------------------------------------------------------[api]
  _susReleaseFun: function() {
    var param = {
      evtNum:this.resData.suspensionInfo,
      colAmt:''
    };
    Tw.Logger.info('[param]', param);

    this._apiService.request(Tw.API_CMD.BFF_05_0034, param)
      .done($.proxy(function(resp){
        Tw.Logger.info('[BFF_05_0025 > resp]', resp);
        //this._myPlanReqInit(resp.result);
      }, this))
      .fail(function(err){})
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
