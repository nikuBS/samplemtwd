/**
 * FileName: myt.joinService.payClaimInfo.iptv.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.08.16
 * Info:
 */
Tw.MytBenefitRecommendDetail = function (rootEl, resData) {
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

  this._init();
};

Tw.MytBenefitRecommendDetail.prototype = {
  _init: function () {
    Tw.Logger.info('[Client Init]');
    // this._getDetailList();
    // this._bindEvent();
  },
  _cachedElement: function () {
    // this.$tgTpl = $('#fe-contract-terminal-detail');
    // this.$tgDetailList = $('[data-target="detailList"]');
    // this.$curNum = $('[data-target="curNum"]');
    // this.$addBtnArea = $('[data-target="addBtnArea"]');
  },
  _bindEvent: function () {
    // this.$container.on('click', '[data-target="addBtn"]', $.proxy(this._addView, this));
    // this.$container.on('click', '[data-target="closeBtn"]', $.proxy(this._goBack, this));

  },
  //--------------------------------------------------------------------------[service]
  _dataSplice: function( listData, count ) {
    var tempListData = listData;
    var tempCount = count;
    var spliceData = tempListData.splice(0, tempCount);
    this.detailListObj.viewData = spliceData;
    this.detailListObj.curLen = this.detailListObj.listData.length;
    Tw.Logger.info('[ _dataSplice end ]', this.detailListObj);
  },
  //--------------------------------------------------------------------------[api]
  _getDetailList: function() {
    Tw.Logger.info('[resData.reqQuery]', this.resData.reqQuery);

    var param = {
      svcAgrmtCdId: this.resData.reqQuery.svcAgrmtDcId,
      svcAgrmtDcCd: this.resData.reqQuery.svcAgrmtDcCd
    };

    // var param = {
    //   svcAgrmtCdId: 'AA1000000037069632',
    //   svcAgrmtDcCd: 'AA'
    // };

    // $.ajax('http://localhost:3000/mock/contract-terminal.detail.BFF_05_00076.json')
    //   .done(function(resp){
    //     Tw.Logger.info(resp);
    //   })
    //   .fail(function(err) {
    //     Tw.Logger.info(err);
    //   });

    this._apiService.request(Tw.API_CMD.BFF_05_0076, param)
      .done($.proxy(function(resp){

        if ( resp.code === Tw.API_CODE.CODE_00 ) {

          Tw.Logger.info('[BFF_05_0076]', resp);
          this.bffListData = resp.result.agrmt;
          this._proData();
          this._ctrlInit();

        } else {
          this._popupService.openAlert(resp.msg, resp.code);
        }

      }, this))
      .fail(function(err){
        Tw.Logger.info('[err]', err);
        this._popupService.openAlert(err.msg, err.code);
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
