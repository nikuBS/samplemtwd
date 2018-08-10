/**
 * FileName: myt.joinService.contractTerminalInfo.phone.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.24
 * Info:
 */

Tw.MytJoinContractTerminal = function (rootEl, resData) {
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

Tw.MytJoinContractTerminal.prototype = {
  _init: function () {
    Tw.Logger.info('[Client Init]');

    this._bindEvent();
    this._serverErrPopup();
  },

  _cachedElement: function () {
    this.$childPhonenum = $('[data-target="childPhonenum"]');

  },
  _bindEvent: function () {

    this.$container.on('click', '[data-target="detailSaleList"]', $.proxy(this._detailSaleList, this)); //상세할인내역

    this.$container.on('click', '[data-target="beforeSalePriceSum"]', $.proxy(this._beforeSalePriceSumPopOpen, this));

    this.$container.on('click', '[data-target="boon_fee_type_A"]', $.proxy(this._boon_fee_type_A_PopOpen, this));
    this.$container.on('click', '[data-target="boon_fee_type_B"]', $.proxy(this._boon_fee_type_B_PopOpen, this));

    this.$container.on('click', '[data-target="boon_join_type_A"]', $.proxy(this._boon_join_type_A_PopOpen, this));
    this.$container.on('click', '[data-target="boon_join_type_B"]', $.proxy(this._boon_join_type_B_PopOpen, this));

    this.$container.on('click', '[data-target="boon_suc_type_A"]', $.proxy(this._boon_suc_type_A_PopOpen, this));
    this.$container.on('click', '[data-target="boon_suc_type_B"]', $.proxy(this._boon_suc_type_B_PopOpen, this));
    this.$container.on('click', '[data-target="boon_suc_type_C"]', $.proxy(this._boon_suc_type_C_PopOpen, this));
  },
  _detailSaleList: function (e) {

    var svcAgrmtDcId = $(e.target).attr('data-svcAgrmtDcId');
    var svcAgrmtDcCd = $(e.target).attr('data-svcAgrmtDcCd');
    var tempUrl = '/myt/join/contract-terminal/detail' + '?' + 'svcAgrmtDcId=' + svcAgrmtDcId + '&' + 'svcAgrmtDcCd=' + svcAgrmtDcCd;
    this._goLoad(tempUrl);
    //window.open( tempUrl, '_blank');

  },
  _beforeSalePriceSumPopOpen: function () {
    this._popupService.openAlert(Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BSPS.MSG, Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BSPS.TITLE);
  },
  _boon_fee_type_A_PopOpen: function () {
    this._popupService.openAlert(Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_FEE_TYPE_A.MSG,
      Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_FEE_TYPE_A.TITLE);
  },
  _boon_fee_type_B_PopOpen: function () {
    this._popupService.openAlert(Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_FEE_TYPE_B.MSG,
      Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_FEE_TYPE_B.TITLE);
  },
  _boon_join_type_A_PopOpen: function () {
    this._popupService.openAlert(Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_JOIN_TYPE_A.MSG,
      Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_JOIN_TYPE_A.TITLE);
  },
  _boon_join_type_B_PopOpen: function () {
    this._popupService.openAlert(Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_JOIN_TYPE_B.MSG,
      Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_JOIN_TYPE_B.TITLE);
  },
  _boon_suc_type_A_PopOpen: function () {
    this._popupService.openAlert(Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_SUC_TYPE_A.MSG,
      Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_SUC_TYPE_A.TITLE);
  },
  _boon_suc_type_B_PopOpen: function () {
    this._popupService.openAlert(Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_SUC_TYPE_B.MSG,
      Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_SUC_TYPE_B.TITLE);
  },
  _boon_suc_type_C_PopOpen: function () {
    this._popupService.openAlert(Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_SUC_TYPE_C.MSG,
      Tw.MSG_MYT.CONTRACT_TERMINAL.OPEN_ALERT.BOON_SUC_TYPE_C.TITLE);
  },

  //--------------------------------------------------------------------------[이벤트 | 팝업 | 청구월 선택]
  //_selPopOpen : function(event) {
  //   var $target = $(event.currentTarget);
  //   var tempArr = this.resData.usedAmountChildInfo.invDtArr;
  //   var arrOption = [];
  //   for ( var i=0, len=tempArr.length; i<len; i++ ) {
  //     arrOption.push({
  //       'attr' : 'data-info="' + tempArr[i] + '"',
  //       text : this._getSelClaimDtBtn( tempArr[i] )
  //     });
  //   }
  //   this._popupService.openChoice(Tw.POPUP_TITLE.PERIOD_SELECT, arrOption, 'type1', $.proxy(this._selPopOpenEvt, this, $target));
  // },
  // _selPopOpenEvt: function ($target, $layer) {
  //   $layer.find('.popup-choice-list').on('click', $.proxy(this._selPopOpenEvtExe, this, $target, $layer) );
  //
  // },
  // _selPopOpenEvtExe: function ($target, $layer, event) {
  //   var curTg = $(event.currentTarget);
  //   var tg = $target;
  //   var dataTemp = curTg.find('button').attr('data-info');
  //   tg.text( curTg.text() );
  //   tg.attr('data-info', dataTemp );
  //   //this._popupService.close();
  //   var paramData = {
  //     invDt: dataTemp,
  //     selNum: this.selectDataInfo.selNum,
  //     childSvcMgmtNum:  this.resData.selectSvcMgmtNum
  //   };
  //   this._goLoad('/myt/bill/billguide/subChildBill' + '?' + $.param(paramData));
  // },
  //--------------------------------------------------------------------------[api]
  // _getUsedAmounts: function(param) {
  //   Tw.Logger.info('[param]', param);
  //
  //   this._apiService.request(Tw.API_CMD.BFF_05_0047, param)
  //     .done($.proxy(function(resp){
  //       Tw.Logger.info('[자녀폰 사용 요금조회]', resp);
  //       this.usedAmounts = resp.result;
  //       this._usedAmountsInit();
  //     }, this))
  //     .fail(function(err){})
  // },
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
  _getSelPeriod: function (str) {
    var startDate = moment(str).format('YYYY.MM') + '.01';
    var endDate = moment(str).format('YYYY.MM.DD');
    return startDate + ' ~ ' + endDate;
  }


};
