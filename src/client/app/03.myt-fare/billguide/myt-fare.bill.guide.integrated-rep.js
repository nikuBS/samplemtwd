/**
 * MenuName: 나의 요금 > 요금안내서 통합(대표,일반)청구회선(MF_02_01)
 * @file myt-fare.bill.guide.integrated-rep.js
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.09.12
 * Summay: 요금안내서 통합(대표,일반)청구회선 조회화면 처리, 자녀 이용요금 조회
 */

Tw.MyTFareBillGuideIntegratedRep = function (rootEl, resData) {
  this.resData = resData;
  // Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._hashService = Tw.Hash;

  this._history = new Tw.HistoryService();

  this._init();

  this.paramDate = '';
  this.paramLine = '';

  // this._hashService.initHashNav($.proxy(this._onHashChange, this));
};

Tw.MyTFareBillGuideIntegratedRep.prototype = {

  _init: function () {
    this._cachedElement();
    this._bindEvent();
    this._hbRegisterHelper();

    if ( this.resData.childLineInfo && this.resData.childLineInfo.length > 0 ) {
      this._getChildBillInfo();
    } else {
      $('#divChildListHaeder').hide().attr('aria-hidden', true);
    }

    if ( this.resData.reqQuery.line ) {
      //특정 회선 선택
      this.$wrapHbPaidAmtSvcCdListArea.hide();
      $('#fe-bill-sum-list').hide().attr('aria-hidden', true);
      // this._getUseBillsInfo();
      if(this.resData.billpayInfo && this.resData.billpayInfo.paidAmtDetailList){
        this._getBillsDetailInfoInit({code:Tw.API_CODE.CODE_00, result:this.resData.billpayInfo});
      }
      this._searchNmSvcTypeFun();
    }
    else {
      // 서비스 전체
      //this._getBillsDetailInfo();
      if(this.resData.billpayInfo && this.resData.billpayInfo.paidAmtDetailList){
        this._getBillsDetailInfoInit({code:Tw.API_CODE.CODE_00, result:this.resData.billpayInfo});
      }

      this._svcHbDetailList(
        this._sortBySvcTypeMain(this.resData.commDataInfo.joinSvcList),
        this.$hbPaidAmtSvcCdListArea,
        this.$entryTplPaidAmtSvcCdList
      );
    }

  },

  // on hashchange 미사용
  _onHashChange: function (hash) {
    // Tw.Logger.info('[hash]', hash);

    if ( !hash.raw ) {
      return;
    }

    switch ( hash.raw ) {
      case 'conditionChange_P' :
        // Tw.Logger.info('[hash > conditionChange_P]', hash);
        this.$conditionChangeBtn.trigger('click');
        break;
      default :

    }

  },

  /**
   * hbs 헬퍼 등로
   * @private
   */
  _hbRegisterHelper: function () {

    Handlebars.registerHelper('date_txt', function (dateVal) {
      return Tw.DateHelper.getShortDateWithFormatAddByUnit(dateVal, 1, 'days', Tw.MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE, 'YYYYMMDD');
    });

    Handlebars.registerHelper('index_of', function (context, ndx) {
      return context[ndx];
    });

    // 컨텐츠/소액결제 분기 및 tag리턴
    Handlebars.registerHelper('if_contents', function (strVal) {
      for(var i = 0; i < Tw.MYT_FARE_BILL_GUIDE_TPL.DETAIL_BTN.length; i++){
        var searchName = Tw.MYT_FARE_BILL_GUIDE_TPL.DETAIL_BTN[i].SCH_ID;
        if ( strVal.indexOf(searchName) > -1 ) {
          return Tw.MYT_FARE_BILL_GUIDE_TPL.DETAIL_BTN[i].ELEMENT;
        }
      }
      return strVal;
    });

    // 휴대폰/인터넷/TV 아이콘 리턴
    Handlebars.registerHelper('if_icon', function (strVal) {
      if(!strVal) return Tw.MYT_FARE_BILL_GUIDE_TPL.TIT_ICON[0].ELEMENT;
      for(var i = 0; i < Tw.MYT_FARE_BILL_GUIDE_TPL.TIT_ICON.length; i++){
        var searchName = Tw.MYT_FARE_BILL_GUIDE_TPL.TIT_ICON[i].SCH_LB;
        if ( strVal.indexOf(searchName) > -1 ) {
          return Tw.MYT_FARE_BILL_GUIDE_TPL.TIT_ICON[i].ELEMENT;
        }
      }
      return Tw.MYT_FARE_BILL_GUIDE_TPL.TIT_ICON[0].ELEMENT;
    });

    // 콘텐츠 이용료, 소액결제 템플릿 리턴
    Handlebars.registerHelper('if_third_party', function (strVal, searchName) {
      if ( strVal.indexOf(searchName) > -1 ) {
        return Tw.MYT_FARE_BILL_GUIDE_TPL.THIRD_PARTY_TPL;
      }
    });

    // 할인요금인 경우 빨간글씨 처리 클래스 리턴
    Handlebars.registerHelper('if_dc_red', function (strVal) {
      if ( strVal.indexOf(Tw.MYT_FARE_BILL_GUIDE_TPL.PRICE_DC_POINT.LABEL) > -1 ) {
        return Tw.MYT_FARE_BILL_GUIDE_TPL.PRICE_DC_POINT.CLASS;
      }
      return '';
    });

  },

  /**
   * 화면 element cache
   * @private
   */
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

    this.$searchNmSvcTypeTplAll = Handlebars.compile(Tw.MYT_FARE_BILL_GUIDE_TPL.SVC_TYPE_TPL.ALL);
    this.$searchNmSvcTypeTplOth = Handlebars.compile(Tw.MYT_FARE_BILL_GUIDE_TPL.SVC_TYPE_TPL.OTHER);
  },

  /**
   * 이벤트 bind
   * @private
   */
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

    this.$container.on('click', '[data-target="detailContentsBtn"]', $.proxy(function () { // 콘텐츠 이용료 최초화면 바로가기
      this._history.goLoad('/myt-fare/bill/contents/history');
    }, this));

    this.$container.on('click', '[data-target="detailMicroBtn"]', $.proxy(function () { // 소액결재 최초화면 바로가기
      this._history.goLoad('/myt-fare/bill/small/history');
    }, this));

    this.$container.on('click', '[data-target="childBillInfo"]', $.proxy(this._goChildBillInfo, this)); // 자녀사용량 조회화면으로 이동
    this.$container.on('click', '[data-target="goProdPageBtn"]', $.proxy(this._goProdPage, this)); // 상품원장페이지로 이동

  },
  //--------------------------------------------------------------------------[EVENT]
  /**
   * 상품원장 페이지로 이동(상단, 하단 모두 씀)
   * @private
   */
  _goProdPage: function (event) {
    var url = $(event.currentTarget).data('prod-page-url');
    this._history.goLoad(url);
  },
  // 요금납부 호출
  _feePayBtnEvt: function () {
    // Tw.Logger.info('[요금납부]', Tw.MyTFareBill);
    this.myTFarePayment = new Tw.MyTFareBill(this.$container, this.resData.svcAttrCd);
  },
  // 납부내역화면으로 이동
  _payListBtnEvt: function () {
    // Tw.Logger.info('[납부내역조회]');
    this._history.goLoad('/myt-fare/info/history');
  },
  // 콜기프트 화면으로 이동
  _callGiftBtnEvt: function () {
    this._history.goLoad('/myt-fare/billguide/callgift');
  },
  // 로밍 내역 화면으로 이동
  _roamingBtnEvt: function () {
    this._history.goLoad('/myt-fare/billguide/roaming');
  },
  // 기부금/후원금 내역 화면으로 이동
  _donationBtnEvt: function () {
    this._history.goLoad('/myt-fare/billguide/donation');
  },
  /**
   * 자녀 이용요금 화면으로 이동
   * @param event
   * @private
   */
  _goChildBillInfo: function(event) {
    var childLine = $(event.currentTarget).data('svc-mgmt-num');
    var dt = this.resData.reqQuery.date || '';
    this._history.goLoad('/myt-fare/billguide/child?line='+childLine+'&date='+dt);
  },
  // [조건변경 팝업] 날짜 클릭시
  _hbDateRadioEvt: function (e) {
    // Tw.Logger.info('[날짜 클릭]');
    this.paramDate = $(e.currentTarget).find('input').attr('value');
    // Tw.Logger.info('[날짜 클릭 완료]', this.paramDate);
  },
  // [조건변경 팝업] 회선 클릭시
  _hbLineRadioBtn: function (e) {
    // Tw.Logger.info('[회선 클릭]');
    this.paramLine = $(e.currentTarget).find('input').attr('value');
    // Tw.Logger.info('[회선 클릭 완료]', this.paramLine);
  },
  // [조건변경 팝업] 조건변경 버튼 클릭시
  _hbPopChangeBtn: function () {
    var param = {
      date: this.paramDate,
      line: this.paramLine
    };
    // Tw.CommonHelper.startLoading(this.$container, 'grey');
    // // Tw.Logger.info('[param]', param);
    // // Tw.Logger.info('[param]2', '/myt-fare/billguide/guide?'+ $.param(param));
    this._history.goLoad('/myt-fare/billguide/guide?' + $.param(param));
  },

  /**
   * 조건변경 팝업 오픈
   * @private
   */
  _conditionChangeEvt: function () {
    var hbsName = 'MF_02_01_01';
    var data = [{
      dateList: this.resData.commDataInfo.conditionChangeDtList,
      dateListVal: this.resData.billpayInfo.invDtArr,
      lineList: this.resData.commDataInfo.intBillLineList
    }];
    var hashName = 'conditionChange';

    // Tw.Logger.info('[팝업 오픈 전 : MF_02_01_01]', data);

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: data
      },
      $.proxy(this._conditionChangeEvtInit, this),
      $.proxy(this._conditionChangeEvtClose, this),
      hashName);
  },
  /**
   * 조건변경 팝업 ui초기화
   * @private
   */
  _conditionChangeEvtInit: function () {
    this._cachedElement();

    // Tw.Logger.info('[팝업 오픈 : MF_02_01_01]');

    var selDateVal = this.resData.reqQuery.date;
    var selLineVal = this.resData.reqQuery.line;

    // 선택 날짜 ui 처리
    if ( selDateVal ) {
      var selDateValObj = this.$dateBtnArea.find('input[value="' + selDateVal + '"]');
      selDateValObj.trigger('click');
      // // Tw.Logger.info('[dateBtnArea]', $('[data-target="dateBtnArea"]'));
      // // Tw.Logger.info('[obj]', obj);
    }else {
      var firstDateValObj = this.$dateBtnArea.find('input').eq(0);
      firstDateValObj.trigger('click');
    }

    // 선택 회선 ui 처리
    if ( selLineVal ) {
      var selLineValObj = this.$lineSelectArea.find('input[value="' + selLineVal + '"]');
      selLineValObj.trigger('click');
      // // Tw.Logger.info('[obj]', selLineValObj);
    }

  },
  // 안씀. 조건변경 팝업 닫히면..
  _conditionChangeEvtClose: function () {
    // Tw.Logger.info('[팝업 닫기 : MF_02_01_01]');
  },

  //--------------------------------------------------------------------------[API]
  /**
   * 자녀회선 이용내역 조회
   * @private
   */
  _getChildBillInfo: function () {
    var thisMain = this;
    var childTotNum = this.resData.childLineInfo.length;
    var targetApi = Tw.API_CMD.BFF_05_0047;
    var commands = [];

    for ( var i = 0; i < childTotNum; i++ ) {
      commands.push({
        command: targetApi,
        params: {
          childSvcMgmtNum: this.resData.childLineInfo[i].svcMgmtNum,
          invDt: this.resData.reqQuery.date
        },
        version: Tw.API_VERSION.V2
      });
    }

    // Tw.Logger.info('------- 자녀 사용량 조회 -----------------');
    this._apiService.requestArray(commands)
      .done($.proxy(function () {
        var childLineInfo = thisMain.resData.childLineInfo;
        Tw.Logger.info('자녀 청구요금 조회 결과', arguments);
        /*_.each(arguments, function (element, index) {
          if ( element.result && (element.result.svcMgmtNum === childLineInfo[index].svcMgmtNum) ) {
            childLineInfo[index].detailInfo = element.result;
          }
        });*/

        if(!arguments || arguments.length !== childLineInfo.length){
          $('#divChildListHaeder').hide().attr('aria-hidden', true);
          return;
        }

        for ( var i = 0; i < childLineInfo.length; i++ ) {
          var d = null;
          if(arguments[i].result && arguments[i].result.invAmtList && arguments[i].result.invAmtList.length > 0){
            var date = this.resData.reqQuery ? this.resData.reqQuery.date : null;
            if(!date){
              date = this.resData.billpayInfo.invDtArr[0];
            }
            // 날짜로 조회결과를 찾아야함
            d = _.find(arguments[i].result.invAmtList, function(item){
              return item.invDt === date;
            });
            // 결과가 없는 경우
            if(!d){
              d = {totInvAmt: '0'};
            }
          }
          childLineInfo[i].detailInfo = d;
        }

        thisMain._getChildBillInfoInit();

      }, this));
  },
  /**
   * 자녀회선 이용요금 조회 조회결과로 ui 세팅
   * @private
   */
  _getChildBillInfoInit: function () {
    var thisMain = this;
    var childListData = thisMain.resData.childLineInfo;

    for(var i = 0; i < childListData.length; i++){
      var item = childListData[i];
      item.svcNum = thisMain._phoneStrToDash(item.svcNum);
      if ( item.detailInfo ) {
        item.detailInfo.useAmtTot = Tw.FormatHelper.addComma(item.detailInfo.totInvAmt);
      }
    }

    // Tw.Logger.info('childListData', childListData);

    this._svcHbDetailList(childListData, this.$hbChildListArea, this.$entryTplChild);

  },


  //청구요금 상세조회 : BFF_05_0036 청구요금 조회
  // 2019.03.26 현재 안씀. 성틍개선 api변경으로 대상으로 js에서 청구/사용요금 다시 조회하지 않음
  _getBillsDetailInfo: function () {
    // Tw.Logger.info('====== 전체회선 조회 ===============');
    /*
    * 실 데이터
    * */
    return this._apiService.request(Tw.API_CMD.BFF_05_0036, {
      detailYn: 'Y',
      invDt: this.resData.reqQuery.date
    }).done($.proxy(this._getBillsDetailInfoInit, this));

    // // Tw.Logger.info('클라이언트 목데이터');
    // $.ajax('http://localhost:3000/mock/bill.guide.BFF_05_00036_detail.json')
    //   .done($.proxy(this._getBillsDetailInfoInit, this))
    //   .fail(function(err) {
    //     // Tw.Logger.info(err);
    //   });

  },
  /**
   * 청구요금 조회 결과 화면 처리
   * (node에서 조회해온 data로 처리)
   * @param res
   * @private
   */
  _getBillsDetailInfoInit: function (res) {
    var thisMain = this;
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      // // Tw.Logger.info('[BFF_05_0036 상세내역]', res.result.paidAmtDetailInfo);

      var paidAmtDetailInfo = res.result.paidAmtDetailList;

      // 자녀회선 삭제
      // if(thisMain.resData.childLineInfo) {
      //   for ( var i = paidAmtDetailInfo.length - 1; i >= 0; i-- ) {
      //     for ( var j = 0; j < thisMain.resData.childLineInfo.length; j++ ) {
      //       if ( paidAmtDetailInfo[i].svcMgmtNum === thisMain.resData.childLineInfo[j].svcMgmtNum ) {
      //         paidAmtDetailInfo.splice(i, 1);
      //       }
      //     }
      //   }
      // }

      paidAmtDetailInfo = $.extend(true, {}, paidAmtDetailInfo);
      paidAmtDetailInfo = _.map(paidAmtDetailInfo, function (item) {
        // item.svcInfoNm = thisMain._phoneStrToDash(item.svcInfoNm);
        // item.svcInfoNm = thisMain._getShortStr(item.svcInfoNm);
        item.invAmt = Tw.FormatHelper.addComma(item.invAmt);
        if ( item.svcNm === Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_0 ) {
          item.svcNm = Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_1;
        }
        return item;
      });
      // // Tw.Logger.info('[paidAmtDetailInfo]', paidAmtDetailInfo);
      var resData = paidAmtDetailInfo;
      var groupKeyArr = ['svcMgmtNum', 'billItmLclNm', 'billItmSclNm'];
      var priceKey = 'invAmt';
      var rootNodes = [];

      rootNodes = thisMain._comTraverse(resData, groupKeyArr[0], priceKey);

      // rootNode는 무조건 회선정보로 한다.(세션에 있는 경우 세션정보를, 없는경우 통합청구등록회선 조회에서 가져온 값
      if(rootNodes && this.resData && this.resData.commDataInfo && this.resData.commDataInfo.intBillLineList){
        for(var i = 0; i < rootNodes.length; i++){
          for(var j = 0; j < this.resData.commDataInfo.intBillLineList.length; j++){
            if(rootNodes[i].id === this.resData.commDataInfo.intBillLineList[j].svcMgmtNum){
              rootNodes[i].label = this.resData.commDataInfo.intBillLineList[j].svcType;
              rootNodes[i].svcInfoNm = this.resData.commDataInfo.intBillLineList[j].label;

              // 상품이름이 없는 경우 통합청구등록회선조회 값 세팅
              if(!rootNodes[i].prodNm){
                rootNodes[i].prodNm = this.resData.commDataInfo.intBillLineList[j].assistAddr;
              }
            }
          }
        }
      }

      _.map(rootNodes, function (val) {
        val.children = thisMain._comTraverse(val.children, groupKeyArr[1], priceKey);
      });

      _.map(rootNodes, function (val) {
        _.map(val.children, function (val1) {
          val1.children = thisMain._comTraverse(val1.children, groupKeyArr[2], priceKey);
        });
      });

      // Tw.Logger.info('[ rootNodes ] : ', rootNodes);
      this._svcHbDetailList(this._sortBySvcTypeDetail(rootNodes), this.$hbDetailListArea, this.$entryTplBill);

      //위젯 아코디언 초기화
      skt_landing.widgets.widget_accordion($('.widget'));
      this._insertAsteMark();
    }
  },


  // BFF_05_0047 사용요금 조회(본인)
  // 2019.03.26 현재 안씀. 성틍개선 api변경으로 대상으로 js에서 청구/사용요금 다시 조회하지 않음
  _getUseBillsInfo: function () {
    // Tw.Logger.info('====== 특정회선 조회 ===============');
    return this._apiService.request(Tw.API_CMD.BFF_05_0047, {
      sSvcMgmtNum: this.resData.reqQuery.line,
      invDt: this.resData.reqQuery.date
    }).done($.proxy(this._getUseBillsInfoInit, this));
  },
  // 2019.03.26 현재 안씀. 성틍개선 api변경으로 대상으로 js에서 청구/사용요금 다시 조회하지 않음
  _getUseBillsInfoInit: function (res) {
    var thisMain = this;
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var useAmtDetailInfo = $.extend(true, {}, res.result.useAmtDetailInfo);

      useAmtDetailInfo = _.map(useAmtDetailInfo, function (item) {
        item.invAmt = Tw.FormatHelper.addComma(item.invAmt);
        return item;
      });
      // // Tw.Logger.info('[paidAmtDetailInfo]', paidAmtDetailInfo);
      var resData = useAmtDetailInfo;
      var groupKeyArr = ['billItmLclNm', 'billItmSclNm'];
      var priceKey = 'invAmt';
      var rootNodes = {};
      rootNodes.useSvcType = this._useSvcTypeFun();
      rootNodes.useBill = thisMain._comTraverse(resData, groupKeyArr[0], priceKey);

      _.map(rootNodes.useBill, function (val) {
        val.children = thisMain._comTraverse(val.children, groupKeyArr[1], priceKey);
      });

      // Tw.Logger.info('[ rootNodes ] : ', rootNodes);
      this._svcHbDetailList(rootNodes, this.$hbDetailListArea, this.$entryTplUseBill);

      //위젯 아코디언 초기화
      skt_landing.widgets.widget_accordion($('.widget'));
      this._insertAsteMark();
    }
  },

  //--------------------------------------------------------------------------[SVC]
  // 개별회선 선택시 타이틀에 회선 정보 출력
  _searchNmSvcTypeFun: function () {
    var svcTypeList = this.resData.commDataInfo.intBillLineList;
    var svcMgmtNum = this.resData.reqQuery.line;
    var selectSvcType = _.find(svcTypeList, function (item) {
      return item.svcMgmtNum === svcMgmtNum;
    });
    // // Tw.Logger.info('[ _searchNmSvcTypeFun ]', selectSvcType);
    var textVal = selectSvcType.svcType;
    var templt = this.$searchNmSvcTypeTplOth;

    if ( selectSvcType.svcType === Tw.MYT_FARE_BILL_GUIDE.FIRST_SVCTYPE ) {
      templt = this.$searchNmSvcTypeTplAll;
    } else {
      textVal = selectSvcType.svcType + '(' + this._getShortStr(selectSvcType.label) + ')';
    }

    this.$searchNmSvcType.html(templt({svcType: textVal}));
  },
  // 2019.03.26 현재 안씀. 성틍개선 api변경으로 대상으로 js에서 청구/사용요금 다시 조회하지 않음
  _useSvcTypeFun: function () {
    var svcTypeList = this.resData.commDataInfo.intBillLineList;
    var svcMgmtNum = this.resData.reqQuery.line;
    var selectSvcType = _.find(svcTypeList, function (item) {
      return item.svcMgmtNum === svcMgmtNum;
    });
    // console.info('[ selectSvcType ] : ', selectSvcType);
    return selectSvcType;

  },
  /**
   * hbs script 템플릿 출력
   * @param resData - 데이터
   * @param $jqTg - 출력될 html area
   * @param $hbTg - hbs 템플릿
   * @private
   */
  _svcHbDetailList: function (resData, $jqTg, $hbTg) {
    var jqTg = $jqTg;
    var hbTg = $hbTg;
    var source = hbTg.html();
    var template = Handlebars.compile(source);
    var data = {
      resData: resData
    };
    var html = template(data);
    jqTg.append(html);
  },
  // allSvc 정보에서 해당 상품의 id와 이름을 찾아서 리턴한다.
  _getProdInfo: function(svcMgmtNum) {
    var svcS = this.resData.allSvc.s || [];
    var svcM = this.resData.allSvc.m || [];
    var svcO = this.resData.allSvc.o || [];
    for(var i = 0; i < svcS.length; i++){
      if(svcMgmtNum === svcS[i].svcMgmtNum){
        return {id: svcS[i].prodId, nm: svcS[i].prodNm};
      }
    }
    for(i = 0; i < svcM.length; i++){
      if(svcMgmtNum === svcM[i].svcMgmtNum){
        return {id: svcM[i].prodId, nm: svcM[i].prodNm};
      }
    }
    for(i = 0; i < svcO.length; i++){
      if(svcMgmtNum === svcO[i].svcMgmtNum){
        return {id: svcO[i].prodId, nm: svcO[i].prodNm};
      }
    }
    return {id: '', nm: ''};
  },

  /**
   * svc 이름으로 소팅(상단 메인 요금 부분)
   * 휴대폰(T Pocket-Fi 포함)→T Login→T WiBro→집전화→IPTV→인터넷
   * @param arr
   * @returns {*} 정렬된 배열
   * @private
   */
  _sortBySvcTypeMain: function(arr){
    // DV001-14479 이슈로 메인과 상세 부분 정렬을 분기
    arr = _.sortBy(arr, function(obj){
      var sortNo = 0;
      switch ( obj.label || obj.svcNm ) {
        case Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_0 :
        case Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_1 : sortNo = 0; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TPOCKET : sortNo = 1; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TLOGIN : sortNo = 2; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TWIBRO : sortNo = 3; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TEL_0 :
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TEL_1 : sortNo = 4; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TV :
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_IPTV : sortNo = 5; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_INET : sortNo = 6; break;
      }
      return sortNo;
    });
    return arr;
  },

  /**
   * svc 이름으로 소팅(하단 상세 요금 부분)
   * 휴대폰(T Pocket-Fi 포함) → T Login → 인터넷 → 집전화 → IPTV
   * @param arr
   * @returns {*} 정렬된 배열
   * @private
   */
  _sortBySvcTypeDetail: function(arr){
    // DV001-14479 이슈로 메인과 상세 부분 정렬을 분기
    arr = _.sortBy(arr, function(obj){
      var sortNo = 0;
      switch ( obj.label || obj.svcNm ) {
        case Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_0 :
        case Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_1 : sortNo = 0; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TPOCKET : sortNo = 1; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TLOGIN : sortNo = 2; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TWIBRO : sortNo = 3; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TEL_0 :
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TEL_1 : sortNo = 5; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_TV :
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_IPTV : sortNo = 6; break;
        case Tw.MYT_FARE_BILL_GUIDE.SVCNM_INET : sortNo = 4; break;
      }
      return sortNo;
    });
    return arr;
  },

  /**
   * 웹접근성 부가세 제외대상 * -> icon으로 변경
   * @private
   */
  _insertAsteMark: function(){
    $('.basic-list .title').each(function(){
      var str = $(this).text().trim();
      if(str.indexOf(Tw.MYT_FARE_BILL_GUIDE_TPL.ASTERISK_TPL.SCH_ID) === str.length-1){
        $(this).html(
          $(this).text().replace(
            Tw.MYT_FARE_BILL_GUIDE_TPL.ASTERISK_TPL.SCH_ID,
            Tw.MYT_FARE_BILL_GUIDE_TPL.ASTERISK_TPL.ELEMENT)
        );
      }
    });
  },
  //--------------------------------------------------------------------------[COM]
  /**
   * 요금 데이터를 그룹핑하고 합계를 구함
   * @param $data - 그룹핑할 데이터
   * @param $groupKey - 그룹핑할 object key
   * @param $priceKey - 합계 key
   * @returns {*}
   * @private
   */
  _comTraverse: function ($data, $groupKey, $priceKey) {
    var thisMain = this;
    var tempData = _.groupBy($data, $groupKey);
    var tempKey = _.keys(tempData);
    var tempCom = _.map(tempKey, function (val) {

      var childItemArr = tempData[val];

      var tempSum = 0;
      //토탈 계산
      for ( var i = 0; i < childItemArr.length; i++ ) {
        tempSum += Number(thisMain._comUnComma(childItemArr[i][$priceKey]));
      }
      tempSum = thisMain._comComma(tempSum);

      var prodInfo = thisMain._getProdInfo(tempData[val][0].svcMgmtNum);
      return {
        id: val,
        label: tempData[val][0].svcNm,
        svcInfoNm: tempData[val][0].svcInfoNm,
        prodId: prodInfo.id,
        prodNm: prodInfo.nm,
        children: tempData[val],
        totPrice: tempSum
      };
    });

    return tempCom;
  },
  // 요금에 콤마 추가
  _comComma: function (str) {
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  },
  // 요금에 콤파 삭제
  _comUnComma: function (str) {
    str = String(str);
    // return str.replace(/[^\d]+/g, '');
    return str.replace(/,/g, '');
  },
  // 휴대폰 번호 포맷
  _phoneStrToDash: function (str) {
    var strVal = String(str);
    return strVal.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
  },
  _go: function (hash) {
    this._history.setHistory();
    this._history.goHash(hash);
    // window.location.hash = hash;
  },
  // 긴 string ... 처리(회선정보)
  _getShortStr: function(str){
    if( str && window.unescape(encodeURIComponent(str)).length > 18 ){
      return str.substr(0, 18) + '...';
    }
    return str;
  }

};