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
  },
  _cachedElement: function () {
    this.$lineChangeBtn = $('[data-target="lineChangeBtn"]');
    this.$hbDetailListArea = $('[data-target="hbDetailListArea"]');

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="lineChangeBtn"]', $.proxy(this._lineChangeEvt, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  _lineChangeEvt: function() {
    this._putChangeSession('7016983918');
  },
  //--------------------------------------------------------------------------[API]
  //회선 변경
  _putChangeSession: function(smn) {
    this._apiService.request(Tw.NODE_CMD.CHANGE_SESSION, {
      svcMgmtNum: smn
    }).done($.proxy(this._putChangeSessionInit, this));
  },
  _putChangeSessionInit: function(res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.reload();
    }
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
      this._svcHbDetailList(rootNodes, this.$hbDetailListArea, $("#entry-template"));

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
  }

};