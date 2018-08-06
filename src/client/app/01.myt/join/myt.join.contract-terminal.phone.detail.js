/**
 * FileName: myt.joinService.contractTerminalInfo.phone.detail.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.24
 * Info:
 */

Tw.MytJoinContractTerminalPhoneDetail = function (rootEl, resData) {
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

  this.bffListData = null; //리스트 데이터
  this.spliceLen = 3;

  this._init();
};

Tw.MytJoinContractTerminalPhoneDetail.prototype = {
  _init: function () {
    Tw.Logger.info('[Client Init]');
    this._getDetailList();
    this._bindEvent();
  },
  _cachedElement: function () {
    this.$tgTpl = $('#fe-contract-terminal-detail');
    this.$tgDetailList = $('[data-target="detailList"]');
  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="addBtn"]', $.proxy(this._ctrlInit, this));
  },
  _proData: function() { //데이터 가공
    Tw.Logger.info('[ _proData ]');
   _.map(this.bffListData, function( item ) {
      item.invoDt = Tw.DateHelper.getShortDateNoDot( item.invoDt );
      item.invCnt = Tw.FormatHelper.addComma( item.invCnt );
      item.penEstDcAmt = Tw.FormatHelper.addComma( item.penEstDcAmt );

      return item;
    });
  },
  _ctrlInit: function() {
    this._cachedElement();
    var tempData = this.bffListData.splice(0, this.spliceLen); //데이터 자르기

    var template = Handlebars.compile( this.$tgTpl.html() );
    var output = template( { tempData:tempData } );
    this.$tgDetailList.append(output);

    Tw.Logger.info('[_ctrlInit > 데이터가공]', this.bffListData);
    Tw.Logger.info('[ 데이터 > slice ]', tempData);

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
        Tw.Logger.info('[BFF_05_0076]', resp);
        this.bffListData = resp.result.agrmt;
        this._proData();
        this._ctrlInit();
      }, this))
      .fail(function(err){
        Tw.Logger.info('[err]', err);
      });
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
    return moment(str).add(1, 'days').format(Tw.DATE_FORMAT.YYYYDD_TYPE_0);
  },
  _getSelPeriod: function(str) {
    var startDate = moment(str).format('YYYY.MM') + '.01';
    var endDate = moment(str).format('YYYY.MM.DD');
    return startDate + ' ~ ' + endDate;
  }


};
