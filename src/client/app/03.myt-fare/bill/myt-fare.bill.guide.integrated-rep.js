/**
 * FileName: myt-fare.bill.guide.integrated-rep.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */
Tw.MyTFareBillGuideIntegratedRep = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();
};

Tw.MyTFareBillGuideIntegratedRep.prototype = {
  _init: function () {
    console.info('[초기화]');
    Tw.UIService.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'Y');

    this._cachedElement();
    this._bindEvent();

    this._getBillsDetailInfo();
    this._getChildBillInfo();
  },
  _cachedElement: function () {

    this.$entryTplBill = $('#entryTplBill');
    this.$entryTplChild = $('#entryTplChild');
    this.$lineChangeBtn = $('[data-target="lineChangeBtn"]');
    this.$hbDetailListArea = $('[data-target="hbDetailListArea"]');
    this.$hbChildListArea = $('[data-target="hbChildListArea"]');

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="lineChangeBtn"]', $.proxy(this._lineChangeEvt, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  _lineChangeEvt: function() {
    this._putChangeSession('7016983918');
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

  //청구요금 상세조회 : BFF_05_0036 청구요금 조회
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
      Tw.Logger.info('[BFF_05_0036 상세내역]', res.result.paidAmtDetailInfo);

      var resData = res.result.paidAmtDetailInfo;
      var groupKeyArr = ['svcMgmtNum', 'billItmLclNm', 'billItmSclNm'];
      var priceKey = 'invAmt';
      var rootNodes = [];

      rootNodes = thisMain._comTraverse(resData, groupKeyArr[0], priceKey);

      _.map(rootNodes, function(val, key, list) {
        val.children = thisMain._comTraverse(val.children, groupKeyArr[1], priceKey);
      } );

      _.map(rootNodes, function(val, key, list) {
        _.map(val.children, function(val1, key1, list1) {
          val1.children = thisMain._comTraverse(val1.children, groupKeyArr[2], priceKey);
        } );
      } );

      console.info('[ rootNodes ] : ', rootNodes);
      this._svcHbDetailList(rootNodes, this.$hbDetailListArea, this.$entryTplBill);

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
  _comTraverse: function( $data, $groupKey, $priceKey ) {
    var thisMain = this;
    var tempData = _.groupBy($data, $groupKey);
    var tempKey = _.keys(tempData);
    var tempCom = _.map(tempKey, function(val, key, list) {

      var childItemArr = tempData[val];

      var tempSum = 0;
      //토탈 계산
      for(var i=0; i < childItemArr.length; i++) {
        tempSum += Number(thisMain._comUnComma(childItemArr[i][$priceKey]));
      }
      tempSum = thisMain._comComma(tempSum);

      return {
        id:val,
        label:val,
        children: tempData[val],
        totPrice: tempSum
      }
    });

    return tempCom;
  },
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