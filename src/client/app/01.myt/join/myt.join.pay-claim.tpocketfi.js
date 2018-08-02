/**
 * FileName: myt.joinService.payClaimInfo.tpocketfi.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.24
 * Info:
 */

Tw.MytJoinPayClaimTpocketfi = function (rootEl, resData) {
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

Tw.MytJoinPayClaimTpocketfi.prototype = {
  _init: function () {
    Tw.Logger.info('[Client Init]');

    this._bindEvent();
  },

  _cachedElement: function () {
    this.$childPhonenum = $('[data-target="childPhonenum"]');

  },
  _bindEvent: function () {
    //this.$container.on('click', '[data-target="billMonthName"]', $.proxy(this._selPopOpen, this));
    this.$container.on('click', '[data-target="billguideBtn"]', $.proxy(this._goBillguide, this));
  },
  _goBillguide: function() {
    this._goLoad('/myt/bill/billguide');
  },
  //--------------------------------------------------------------------------[이벤트 | 팝업]
  // _selPopOpen : function(event) {
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
