/**
 * FileName: myt.bill.billguide.prepaidPage.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.08
 * Info: PPS(선불폰)
 */

Tw.mytBillBillguidePrepaidPage = function (rootEl, resData) {
  this.thisMain = this;
  this.resData = resData;
  Tw.Logger.info('[서버에서 데이터 받음]', resData);

  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this.dateObj = {
    selArr: [],
    termNum: 2,
    startDt: null,
    endDt: null
  };

  this._init();
  this._bindEvent();
};

Tw.mytBillBillguidePrepaidPage.prototype = {
  _init: function () {
    this.dateObj.startDt = moment().subtract(2, 'months');
    this.dateObj.endDt = moment();

    for ( var i=this.dateObj.termNum,len=0; i>=len; i-- ) {
      var tempDateFormat = moment().subtract(i, 'months').format('YYYYMM');
      this.dateObj.selArr.push(tempDateFormat);
    }

    this._cachedElement();

    this.$startDtBtn.text( this.dateObj.startDt.format('YYYY.MM') );
    this.$startDtBtn.attr( 'data-info', this.dateObj.startDt.format('YYYYMM') );

    this.$endDtBtn.text( this.dateObj.endDt.format('YYYY.MM') );
    this.$endDtBtn.attr( 'data-info', this.dateObj.endDt.format('YYYYMM') );

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="startDtBtn"]', $.proxy(this._selPopOpen, this));
    this.$container.on('click', '[data-target="endDtBtn"]', $.proxy(this._selPopOpen, this));
    this.$container.on('click', '[data-target="getListBtn"]', $.proxy(this._getList, this));
  },
  _queryInit: function() {

  },
  _cachedElement: function () {
    this.$startDtBtn = $('[data-target="startDtBtn"]');
    this.$endDtBtn = $('[data-target="endDtBtn"]');
  },
  //--------------------------------------------------------------------------[이벤트 | 팝업]
  _selPopOpen : function(event) {
    var $target = $(event.currentTarget);
    var tempArr = this.dateObj.selArr;
    var arrOption = [];
    for ( var i=0, len=tempArr.length; i<len; i++ ) {
      arrOption.push({
        'attr' : 'data-info="' + tempArr[i] + '"',
        text : this._getSelBtn( tempArr[i] )
      });
    }
    this._popupService.openChoice('기간선택', arrOption, 'type1', $.proxy(this._selPopOpenEvt, this, $target));
  },
  _selPopOpenEvt: function ($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._selPopOpenEvtExe, this, $target, $layer));
  },
  _selPopOpenEvtExe: function ($target, $layer, event) {
    var curTg = $(event.currentTarget);
    var tg = $target;
    var dataTemp = curTg.find('button').attr('data-info');
    tg.text( curTg.text() );
    tg.attr('data-info', dataTemp );
    this._popupService.close();
    //this._goLoad('/myt/bill/billguide?invDt='+ dataTemp);
  },
  //--------------------------------------------------------------------------[api]
  _getList: function() {
    console.info('[_getList]');

    this._cachedElement();

    var tempParam = {
      startMM: this.$startDtBtn.attr('data-info'),
      endMM:this.$endDtBtn.attr('data-info')
    };

    console.info('[tempParam]', tempParam);

    this._apiService.request(Tw.API_CMD.BFF_05_0014, tempParam)
      .done($.proxy(function(resp){
        this._getListOutput(resp.result);
      }, this))
      .fail(function(err){})
  },
  //--------------------------------------------------------------------------[공통]
  _getListOutput: function(dataList) {
    this._cachedElement();
    var tempList = dataList;

    console.info('[tempList]', tempList);

    // for ( var i=0,len=tempList.length; i<len; i++ ) {
    //
    // }

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
    return moment(str).add(1, 'days').format('YYYY년 MM월');
  },
  _getSelBtn: function (str) {
    return moment(str).add(1, 'days').format('YYYY.MM');
  }
};
