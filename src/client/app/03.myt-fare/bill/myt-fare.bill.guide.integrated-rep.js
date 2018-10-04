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

  this.paramDate = '';
  this.paramLine = '';
};

Tw.MyTFareBillGuideIntegratedRep.prototype = {

  _init: function () {
    this._cachedElement();
    this._bindEvent();
    this._hbRegisterHelper();

    this._getChildBillInfo();

    if ( this.resData.reqQuery.line ) {
      //특정 회선 선택
      this.$wrapHbPaidAmtSvcCdListArea.hide();
      this._getUseBillsInfo();
      this._searchNmSvcTypeFun();
    } else {
      // 서비스 전체
      this._getBillsDetailInfo();
      this._svcHbDetailList(this.resData.commDataInfo.joinSvcList, this.$hbPaidAmtSvcCdListArea, this.$entryTplPaidAmtSvcCdList);
    }

  },
  _hbRegisterHelper: function() {
    Handlebars.registerHelper('index_of', function(context, ndx) {
      return context[ndx];
    });
  },
  _cachedElement: function () {
    this.$entryTplBill = $('#fe-entryTplBill');
    this.$entryTplUseBill = $('#fe-entryTplUseBill');
    this.$entryTplChild = $('#fe-entryTplChild');
    this.$entryTplPaidAmtSvcCdList = $('#fe-entryTplPaidAmtSvcCdList');

    this.$hbDetailListArea = $('[data-target="hbDetailListArea"]');
    this.$hbChildListArea = $('[data-target="hbChildListArea"]');
    this.$hbPaidAmtSvcCdListArea = $('[data-target="hbPaidAmtSvcCdListArea"]');
    this.$wrapHbPaidAmtSvcCdListArea = $('[data-target="wrapHbPaidAmtSvcCdListArea"]');
    this.$conditionChangeBtn = $('[data-target="conditionChangeBtn"]');
    this.$dateBtnArea = $('[data-target="dateBtnArea"]');
    this.$lineSelectArea = $('[data-target="lineSelectArea"]');

    this.$searchNmSvcType = $('[data-target="searchNmSvcType"]');

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="conditionChangeBtn"]', $.proxy(this._conditionChangeEvt, this));
    this.$container.on('click', '[data-target="hbDateRadioBtn"]', $.proxy(this._hbDateRadioEvt, this)); // 날짜 선택
    this.$container.on('click', '[data-target="hbLineRadioBtn"]', $.proxy(this._hbLineRadioBtn, this)); // 회선 선택
    this.$container.on('click', '[data-target="hbPopChangeBtn"]', $.proxy(this._hbPopChangeBtn, this)); // 변경하기

    this.$container.on('click', '[data-target="callGiftBtn"]', $.proxy(this._callGiftBtnEvt, this)); // 콜기프트 사용요금
    this.$container.on('click', '[data-target="roamingBtn"]', $.proxy(this._roamingBtnEvt, this)); // 로밍 사용요금
    this.$container.on('click', '[data-target="donationBtn"]', $.proxy(this._donationBtnEvt, this)); // 기부금/후원금 사용요금

    this.$container.on('click', '[data-target="feePayBtn"]', $.proxy(this._feePayBtnEvt, this)); // 요금납부
    this.$container.on('click', '[data-target="payListBtn"]', $.proxy(this._payListBtnEvt, this)); // 납부내역조회
  },
  //--------------------------------------------------------------------------[EVENT]
  _feePayBtnEvt: function(event) {
    Tw.Logger.info('[요금납부]');
    var $target = $(event.currentTarget);
    var hbsName = 'popup-action2';
    var data = [
      {
        'list': [
          { 'value': '자동납부', 'text2': '신청' }
        ]
      },
      {
        'type': '요금 납부',
        'list': [
          { 'value': '계좌이체 납부' },
          { 'value': '체크/신용카드 납부' },
          { 'value': 'OK캐쉬백/T포인트 납부' }
        ]
      },
      {
        'list': [
          { 'value': '입금전용계좌 SMS신청', 'explain': '입근전용계좌 정보를 SMS로 전송합니다. <br/>자동납부 인출 중이 아닌 경우에만 이용 가능합니다.' }
        ]
      }
    ];

    var hashName = 'feePay';

    // 데이터 초기화
    // var invDtArr = this.resData.billpayInfo.invDtArr; // data-value
    // var conditionChangeDtList = this.resData.commDataInfo.conditionChangeDtList; // value
    // var listData = _.map(invDtArr, function (item, idx) {
    //   return {
    //     value: conditionChangeDtList[idx],
    //     option: '',
    //     attr: 'data-value="' + invDtArr[idx] + '", data-target="selectBtn"'
    //   }
    // });
    // data[0].list = listData;

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: data,
        title: Tw.MYT_FARE_BILL_GUIDE.POP_TITLE_TYPE_1
      },
      $.proxy(this._feePayBtnEvtInit, this, $target),
      $.proxy(this._feePayBtnEvtClose, this, $target),
      hashName);
  },
  _feePayBtnEvtInit: function($target, $layer) {
    Tw.Logger.info('[팝업 오픈 : popup-action2]', $layer);
    // $layer.on('click', '[data-target="selectBtn"]', $.proxy(this._setSelectedValue, this, $target));
  },
  _feePayBtnEvtClose: function($target, $layer) {
    Tw.Logger.info('[팝업 닫기 : popup-action2]');
    // this._popupService.close();
  },


  _payListBtnEvt: function() {
    Tw.Logger.info('[납부내역조회]');
  },
  _callGiftBtnEvt: function() {
    this._goLoad('/myt/fare/bill/guide/call-gift');
  },
  _roamingBtnEvt: function() {
    this._goLoad('/myt/fare/bill/guide/roaming');
  },
  _donationBtnEvt: function() {
    this._goLoad('/myt/fare/bill/guide/donation');
  },
  _hbDateRadioEvt: function(e) {
    Tw.Logger.info('[날짜 클릭]');
    this.paramDate = $(e.currentTarget).find('input').attr('value');
    Tw.Logger.info('[날짜 클릭 완료]', this.paramDate);
  },
  _hbLineRadioBtn: function(e) {
    Tw.Logger.info('[회선 클릭]');
    this.paramLine = $(e.currentTarget).find('input').attr('value');
    Tw.Logger.info('[회선 클릭 완료]', this.paramLine);
  },
  _hbPopChangeBtn: function(e) {
    var param = {
      date: this.paramDate,
      line: this.paramLine
    };
    // Tw.Logger.info('[param]', param);
    // Tw.Logger.info('[param]2', '/myt/fare/bill/guide?'+ $.param(param));
    this._goLoad('/myt/fare/bill/guide?'+ $.param(param));
  },

  _conditionChangeEvt: function() {
    var hbsName = 'MF_02_01_01';
    var data = [{
      dateList: this.resData.commDataInfo.conditionChangeDtList,
      dateListVal: this.resData.billpayInfo.invDtArr,
      lineList: this.resData.commDataInfo.intBillLineList
    }];
    var hashName = 'conditionChange';

    this._popupService.open({
      hbs: hbsName,
      layer: true,
      data: data
    },
      $.proxy(this._conditionChangeEvtInit, this),
      $.proxy(this._conditionChangeEvtClose, this),
      hashName);
  },
  _conditionChangeEvtInit: function() {
    this._cachedElement();

    Tw.Logger.info('[팝업 오픈 : MF_02_01_01]');

    var selDateVal = this.resData.reqQuery.date;
    var selLineVal = this.resData.reqQuery.line;

    if ( selDateVal ) {
      var selDateValObj = this.$dateBtnArea.find('input[value="' + selDateVal +'"]');
      selDateValObj.trigger('click');
      // Tw.Logger.info('[dateBtnArea]', $('[data-target="dateBtnArea"]'));
      // Tw.Logger.info('[obj]', obj);
    }

    if ( selLineVal ) {
      var selLineValObj = this.$lineSelectArea.find('input[value="' + selLineVal +'"]');
      selLineValObj.trigger('click');
      // Tw.Logger.info('[obj]', selLineValObj);
    }

  },
  _conditionChangeEvtClose: function() {
    Tw.Logger.info('[팝업 닫기 : MF_02_01_01]');
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
          if ( childLineInfo[ index ].svcMgmtNum === element.result.svcMgmtNum) {
            childLineInfo[ index ].detailInfo = element.result;
          }

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
    * */
    return this._apiService.request(Tw.API_CMD.BFF_05_0036, {
      detailYn: 'Y'
    }).done($.proxy(this._getBillsDetailInfoInit, this));

    // Tw.Logger.info('클라이언트 목데이터');
    // $.ajax('http://localhost:3000/mock/bill.guide.BFF_05_00036_detail.json')
    //   .done($.proxy(this._getBillsDetailInfoInit, this))
    //   .fail(function(err) {
    //     Tw.Logger.info(err);
    //   });

  },
  _getBillsDetailInfoInit: function (res) {
    var thisMain = this;
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      // Tw.Logger.info('[BFF_05_0036 상세내역]', res.result.paidAmtDetailInfo);

      var paidAmtDetailInfo = $.extend(true, {}, res.result.paidAmtDetailInfo);

      paidAmtDetailInfo = _.map(paidAmtDetailInfo, function(item, idx, arr) {
        item.svcInfoNm = thisMain._phoneStrToDash(item.svcInfoNm);
        item.invAmt = Tw.FormatHelper.addComma(item.invAmt);
        if ( item.svcNm === Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_0) {
          item.svcNm = Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_1;
        }
        return item;
      });
      // Tw.Logger.info('[paidAmtDetailInfo]', paidAmtDetailInfo);
      var resData = paidAmtDetailInfo;
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

      Tw.Logger.info('[ rootNodes ] : ', rootNodes);
      this._svcHbDetailList(rootNodes, this.$hbDetailListArea, this.$entryTplBill);

      //위젯 아코디언 초기화
      skt_landing.widgets.widget_accordion( $('.widget') );

    }
  },


  // BFF_05_0047 사용요금 조회(본인)
  _getUseBillsInfo: function () {
    return this._apiService.request(Tw.API_CMD.BFF_05_0047, {
      sSvcMgmtNum: this.resData.reqQuery.line,
      invDt: this.resData.reqQuery.date
    }).done($.proxy(this._getUseBillsInfoInit, this));
  },
  _getUseBillsInfoInit: function (res) {
    var thisMain = this;
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var useAmtDetailInfo = $.extend(true, {}, res.result.useAmtDetailInfo);

      useAmtDetailInfo = _.map(useAmtDetailInfo, function(item, idx, arr) {
        item.invAmt = Tw.FormatHelper.addComma(item.invAmt);
        return item;
      });
      // Tw.Logger.info('[paidAmtDetailInfo]', paidAmtDetailInfo);
      var resData = useAmtDetailInfo;
      var groupKeyArr = ['billItmLclNm', 'billItmSclNm'];
      var priceKey = 'invAmt';
      var rootNodes = {};
      rootNodes.useSvcType = this._useSvcTypeFun();
      rootNodes.useBill = thisMain._comTraverse(resData, groupKeyArr[0], priceKey);

      _.map(rootNodes.useBill, function(val, key, list) {
        val.children = thisMain._comTraverse(val.children, groupKeyArr[1], priceKey);
      } );

      Tw.Logger.info('[ rootNodes ] : ', rootNodes);
      this._svcHbDetailList(rootNodes, this.$hbDetailListArea, this.$entryTplUseBill);

      //위젯 아코디언 초기화
      skt_landing.widgets.widget_accordion( $('.widget') );

    }
  },

  //--------------------------------------------------------------------------[SVC]
  _searchNmSvcTypeFun: function() {
    var svcTypeList = this.resData.commDataInfo.intBillLineList;
    var svcMgmtNum = this.resData.reqQuery.line;
    var selectSvcType = _.find(svcTypeList, function(item) {
      return item.svcMgmtNum == svcMgmtNum;
    });
    // Tw.Logger.info('[ _searchNmSvcTypeFun ]', selectSvcType);
    var textVal = '';

    if ( selectSvcType.svcType === Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_1) {
      textVal = Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_1 +'(' + selectSvcType.label + ')'
    } else {
      textVal = selectSvcType.svcType + '(' + selectSvcType.dtlAddr + ')';
    }

    this.$searchNmSvcType.text( textVal );
  },
  _useSvcTypeFun: function() {
    var svcTypeList = this.resData.commDataInfo.intBillLineList;
    var svcMgmtNum = this.resData.reqQuery.line;
    var selectSvcType = _.find(svcTypeList, function(item) {
      return item.svcMgmtNum == svcMgmtNum;
    });
    // console.info('[ selectSvcType ] : ', selectSvcType);
    return selectSvcType;

  },
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
        label:tempData[val][0].svcNm,
        svcInfoNm:tempData[val][0].svcInfoNm,
        children: tempData[val],
        totPrice: tempSum
      }
    });

    return tempCom;
  },
  _comComma: function (str) {
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  },
  _comUnComma: function (str) {
    str = String(str);
    // return str.replace(/[^\d]+/g, '');
    return str.replace(/,/g, '');
  },
  _phoneStrToDash: function (str) {
    var str = String(str);
    return str.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
  },
  _goBack: function () {
    this._history.go(-1);
  },
  _goLoad: function (url) {
    location.href = url;
  },
  _go: function (hash) {
    this._history.setHistory();
    window.location.hash = hash;
  }

};