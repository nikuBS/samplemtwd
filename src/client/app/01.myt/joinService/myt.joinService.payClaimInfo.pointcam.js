/**
 * FileName: myt.joinService.payClaimInfo.pointcam.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.24
 * Info:
 */

Tw.MytJoinServicePayClaimInfoPointcam = function (rootEl, resData) {
  this.thisMain = this;
  this.resData = resData;
  this.init = this._init;
  Tw.Logger.info('[서버에서 데이터 받음]', resData);

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

Tw.MytJoinServicePayClaimInfoPointcam.prototype = {
  _init: function () {
    Tw.Logger.info('[초기화]');

    this._bindEvent();
  },

  _cachedElement: function () {
    this.$childPhonenum = $('[data-target="childPhonenum"]');

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="billMonthName"]', $.proxy(this._selPopOpen, this));
  },
  //--------------------------------------------------------------------------[이벤트 | 팝업 | 청구월 선택]
  _selPopOpen : function(event) {
    var $target = $(event.currentTarget);
    var tempArr = this.resData.usedAmountChildInfo.invDtArr;
    var arrOption = [];
    for ( var i=0, len=tempArr.length; i<len; i++ ) {
      arrOption.push({
        'attr' : 'data-info="' + tempArr[i] + '"',
        text : this._getSelClaimDtBtn( tempArr[i] )
      });
    }
    this._popupService.openChoice('기간선택', arrOption, 'type1', $.proxy(this._selPopOpenEvt, this, $target));
  },
  _selPopOpenEvt: function ($target, $layer) {
    $layer.find('.popup-choice-list').on('click', $.proxy(this._selPopOpenEvtExe, this, $target, $layer) );

  },
  _selPopOpenEvtExe: function ($target, $layer, event) {
    var curTg = $(event.currentTarget);
    var tg = $target;
    var dataTemp = curTg.find('button').attr('data-info');
    tg.text( curTg.text() );
    tg.attr('data-info', dataTemp );
    //this._popupService.close();
    var paramData = {
      invDt: dataTemp,
      selNum: this.selectDataInfo.selNum,
      childSvcMgmtNum:  this.resData.selectSvcMgmtNum
    };
    this._goLoad('/myt/bill/billguide/subChildBill' + '?' + $.param(paramData));
  },
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
    return moment(str).add(1, 'days').format('YYYY년 MM월');
  },
  _getSelPeriod: function(str) {
    var startDate = moment(str).format('YYYY.MM') + '.01';
    var endDate = moment(str).format('YYYY.MM.DD');
    return startDate + ' ~ ' + endDate;
  }


};
