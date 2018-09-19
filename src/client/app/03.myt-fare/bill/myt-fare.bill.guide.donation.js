/**
 * FileName: myt-fare.bill.guide.donation.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */
Tw.MyTFareBillGuideDonation = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();
};

Tw.MyTFareBillGuideDonation.prototype = {
  _init: function () {

    this._cachedElement();
    this._bindEvent();

  },
  _cachedElement: function () {
    // this.$entryTplBill = $('#entryTplBill');
    // this.$lineChangeBtn = $('[data-target="lineChangeBtn"]');
  },
  _bindEvent: function () {
    // this.$container.on('click', '[data-target="lineChangeBtn"]', $.proxy(this._lineChangeEvt, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  _lineChangeEvt: function() {
    // this._putChangeSession('7016983918');
  },
  //--------------------------------------------------------------------------[API]
  _getChildBillInfo: function() {
    var thisMain = this;
    var childTotNum = this.resData.childLineInfo.length;
    var targetApi = Tw.API_CMD.BFF_05_0047;
    var commands = [];

    for ( var i=0; i<childTotNum; i++ ) {
      commands.push({command: targetApi, params: { childSvcMgmtNum: this.resData.childLineInfo[i].svcMgmtNum }});
    }

    this._apiService.requestArray(commands)
      .done(function () {
        var childLineInfo = thisMain.resData.childLineInfo;

        _.each( arguments, function( element, index, list ) {
          // Tw.Logger.info('[element, index, list]', element, index, list);
          childLineInfo[ index ].detailInfo = element.result;
        });

        thisMain._getChildBillInfoInit();

      });

  },

  _getChildBillInfoInit: function() {
    var thisMain = this;
    var childListData = $.extend(true, {}, thisMain.resData.childLineInfo);

    childListData = _.map( childListData, function (item) {
      item.detailInfo.useAmtTot = Tw.FormatHelper.addComma(item.detailInfo.useAmtTot);
      item.svcNum = thisMain._phoneStrToDash(item.svcNum);
      return item;
    });

    Tw.Logger.info('childListData', childListData);

    this._svcHbDetailList(childListData, this.$hbChildListArea, this.$entryTplChild);

  },

  _getBillsDetailInfo: function () {
    /*
    * 실 데이터
    return this._apiService.request(Tw.API_CMD.BFF_05_0036, {
      detailYn: 'Y'
    }).done($.proxy(this._getBillsDetailInfoInit, this));
    */

    // Tw.Logger.info('클라이언트 목데이터');
    $.ajax('http://localhost:3000/mock/bill.guide.BFF_05_00036_detail.json')
      .done($.proxy(this._getBillsDetailInfoInit, this))
      .fail(function(err) {
        Tw.Logger.info(err);
      });

  },
  _getBillsDetailInfoInit: function (res) {
    var thisMain = this;
    if ( res.code === Tw.API_CODE.CODE_00 ) {
    }
  },
  //--------------------------------------------------------------------------[SVC]
  _svcHbDetailList: function( resData, $jqTg, $hbTg ) {
    var jqTg = $jqTg;
    var hbTg = $hbTg;
    var source = hbTg.html();
    var template = Handlebars.compile(source);
    var data = {
      resData : resData
    };
    var html = template(data);
    jqTg.append(html);
  },
  //--------------------------------------------------------------------------[COM]

  _comComma: function (str) {
    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
  },
  _comUnComma: function (str) {
    str = String(str);
    // return str.replace(/[^\d]+/g, '');
    return str.replace(/,/g, '');
  },
  _phoneStrToDash: function (str) {
    return str.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
  }

};