/**
 * FileName: myt.benefit.recommend.detail-plan.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.08.21
 * Info:
 */
Tw.MytBenefitRecommendDetailPlan = function (rootEl, resData) {
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

Tw.MytBenefitRecommendDetailPlan.prototype = {
  _init: function () {
    Tw.Logger.info('[Client Init]');
    Tw.Logger.info('[resData.reqQuery]', this.resData.reqQuery);
    this._getDetailList();


  },
  _cachedElement: function () {
    this.$planArea = $('[data-target="planArea"]');

  },
  _bindEvent: function () {
    // this.$container.on('click', '[data-target="addBtn"]', $.proxy(this._addView, this));

  },
  _proData: function() {
    this.proDataObj = {};
    this.proDataObj.usblPoint = Tw.FormatHelper.addComma( String( this.bffListData.usblPoint ) );
    this.proDataObj.exprdDays = Tw.FormatHelper.addComma( String( this.bffListData.exprdDays ) );
    this.proDataObj.remndDays = Tw.FormatHelper.addComma( String( this.bffListData.remndDays ) );
    this.proDataObj.scrbDt = Tw.DateHelper.getNextYearShortDate( String( this.bffListData.scrbDt ) );

    Tw.Logger.info('[_proData]', this.proDataObj);

  },
  _ctrlInit: function() {
    this._cachedElement();
    this.$planArea.find('[data-target="tg_0"]').html('사용가능 포인트 : ' + this.proDataObj.usblPoint + '점');
    this.$planArea.find('[data-target="tg_1"]').html('누적 사용일 : ' + this.proDataObj.exprdDays + '일');
    this.$planArea.find('[data-target="tg_2"]').html('잔여 사용 가능일 : ' + this.proDataObj.remndDays + '일');
    this.$planArea.find('[data-target="tg_3"]').html('가입일 : ' + this.proDataObj.scrbDt);

  },
  //--------------------------------------------------------------------------[service]

  //--------------------------------------------------------------------------[api]
  _getDetailList: function() {
    $.ajax('http://localhost:3000/mock/recommend.BFF_05_0120.json')
      .done($.proxy(function(resp){
        if ( resp.code === Tw.API_CODE.CODE_00 ) {
          Tw.Logger.info('[BFF_06_00120]', resp);
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

    // this._apiService.request(Tw.API_CMD.BFF_06_0001)
    //   .done($.proxy(function(resp){
    //
    //     if ( resp.code === Tw.API_CODE.CODE_00 ) {
    //       Tw.Logger.info('[BFF_06_0001]', resp);
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
