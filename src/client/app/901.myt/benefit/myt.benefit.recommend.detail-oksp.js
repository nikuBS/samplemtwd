/**
 * FileName: myt.benefit.recommend.detail-oksp.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.08.21
 * Info:
 */
Tw.MytBenefitRecommendDetailOksp = function (rootEl, resData) {
  this.thisMain = this;
  this.resData = resData;
  this.init = this._init;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this.bffListData = null;

  this._init();
};

Tw.MytBenefitRecommendDetailOksp.prototype = {
  _init: function () {
    Tw.Logger.info('[Client Init]');
    Tw.Logger.info('[resData.reqQuery]', this.resData.reqQuery);


  },
  _cachedElement: function () {
    // this.$sendTotArea = $('[data-target="sendTotArea"]');

  },
  _bindEvent: function () {
    // this.$container.on('click', '[data-target="addBtn"]', $.proxy(this._addView, this));

  },
  _proData: function() {


  },
  _ctrlInit: function() {

  },
  //--------------------------------------------------------------------------[service]

  //--------------------------------------------------------------------------[api]
  _getDetailList: function() {
    $.ajax('http://localhost:3000/mock/recommend.BFF_05_00018.json')
      .done($.proxy(function(resp){
        if ( resp.code === Tw.API_CODE.CODE_00 ) {
            Tw.Logger.info('[BFF_06_0018]', resp);
            this.bffListData = resp.result;
            this._proData();
            this._ctrlInit();
        } else {
          Tw.Error(resp.code, resp.msg).pop();
        }
      }, this))
      .fail(function(err) {
        Tw.Logger.info('[err]', err);
        Tw.Error(err.code, err.msg).pop();
      });


    // this._apiService.request(Tw.API_CMD.BFF_06_0018)
    //   .done($.proxy(function(resp){
    //
    //     if ( resp.code === Tw.API_CODE.CODE_00 ) {
    //       Tw.Logger.info('[BFF_06_0018]', resp);
    //       this.bffListData = resp.result;
    //
    //       this._proData();
    //       this._ctrlInit();
    //
    //     } else {
    //       this._popupService.openAlert(resp.msg, resp.code);
    //     }
    //
    //   }, this))
    //   .fail(function(err){
    //     Tw.Logger.info('[err]', err);
    //     this._popupService.openAlert(err.msg, err.code);
    //   });
  },
  //--------------------------------------------------------------------------[공통]
  _serverErrPopup: function() {
    if ( this.resData.errBol ) {
      Tw.Logger.info('[_serverErrPopup]');
      this._popupService.openAlert(this.resData.errObj[0].msg, this.resData.errObj[0].code);
    }
  },
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
    return moment(str).add(1, 'days').format(Tw.DATE_FORMAT.YYYYDD_TYPE_0);
  },
  _getSelPeriod: function(str) {
    var startDate = moment(str).format('YYYY.MM') + '.01';
    var endDate = moment(str).format('YYYY.MM.DD');
    return startDate + ' ~ ' + endDate;
  }
};
