/**
 * FileName: myt.benefit.recommend.detail-point.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.08.21
 * Info:
 */
Tw.MytBenefitRecommendDetailPoint = function (rootEl, resData) {
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
  this.proDataObj = null;

  this._init();

};

Tw.MytBenefitRecommendDetailPoint.prototype = {
  _init: function () {
    this._bindEvent();

    Tw.Logger.info('[Client Init]');
    Tw.Logger.info('[resData.reqQuery]', this.resData.reqQuery);

    // if (this.resData.reqQuery.type === 'A') {
    //   this._getDetailList();
    //
    // } else {
    //
    // }


  },
  _cachedElement: function () {
    this.$refillCpArea = $('[data-target="refillCpArea"]');
    this.$LtsCpArea = $('[data-target="LtsCpArea"]');
  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="goShopping"]', $.proxy(this._goShopping, this));

  },
  _proData: function() {

  },
  _ctrlInit: function() {


  },
  //--------------------------------------------------------------------------[service]
  _goShopping: function() {
    Tw.CommonHelper.openUrlExternal('http://www.11st.co.kr');

  },
  //--------------------------------------------------------------------------[api]
  _getDetailList: function() {
    this._apiService.request(Tw.API_CMD.BFF_06_0001)
      .done($.proxy(function(resp){

        if ( resp.code === Tw.API_CODE.CODE_00 ) {
          Tw.Logger.info('[BFF_06_0001]', resp);
          this.bffListData = resp.result;

          this._proData();
          this._ctrlInit();

        } else {
          Tw.Error(resp.code, resp.msg).pop();
        }

      }, this))
      .fail(function(err){
        Tw.Logger.info('[err]', err);
        Tw.Error(err.code, err.msg).pop();
      });
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
