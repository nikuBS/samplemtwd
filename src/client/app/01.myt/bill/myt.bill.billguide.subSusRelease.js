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
      evtNum: '1234',
      colAmt: this.resData.suspensionInfo.colAmt
    };
    Tw.Logger.info('[param]', param);

    this._apiService.request(Tw.API_CMD.BFF_05_0034, param)
      .done($.proxy(function(resp){
        Tw.Logger.info('[BFF_05_0025 > resp]', resp);
        if ( resp.result.success === 'Y' ) {
          this._onSuccess();
        } else if ( resp.result.success === 'R' ) {
          this._onError();
        } else {
          Tw.Logger.info('[resp.result.success]', resp.result.success);
        }
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
  },
  _onSuccess: function (e) {
    Tw.Logger.info(e);
    //TODO success alert 공통모듈
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDE_SUBSUSSRELEASE_SUCCESS, Tw.MSG_MYT.BILL_GUIDE_SUBSELPAYMENT_SUCCESS_TITLE, function () {
      location.href = '/myt/bill/billguide';
    });
  },
  _onError: function (e) {
    Tw.Logger.error(e);
    //TODO error alert 공통모듈
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDE_SUBSUSSRELEASE_ERROR, Tw.MSG_MYT.BILL_GUIDE_SUBSELPAYMENT_SUCCESS_ERROR, function () {
      location.href = '/myt/bill/billguide';
    });
  }
};
