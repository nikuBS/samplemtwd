/**
 * FileName: myt-fare.bill.guide.integrated-normal.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */
Tw.MyTFareBillGuideIntegratedNormal = function (rootEl, resData) {
  this.resData = resData;
  // Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._hashService = Tw.Hash;

  this._history = new Tw.HistoryService();

  this._init();

  this.paramDate = this.resData.reqQuery.date || '';
  this.paramLine = this.resData.reqQuery.line || '';
};

Tw.MyTFareBillGuideIntegratedNormal.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
    this._hbRegisterHelper();

    if ( this.resData.childLineInfo && this.resData.childLineInfo.length > 0 ) {
      this._getChildBillInfo();
    } else {
      $('#divChildListHaeder').hide().attr('aria-hidden', true);
    }

    if(this.resData.billpayInfo && this.resData.billpayInfo.usedAmountDetailList){
      this._getUseBillsInfoInit({code:Tw.API_CODE.CODE_00, result:this.resData.billpayInfo});
    }
    // this._hashService.initHashNav($.proxy(this._onHashChange, this));

  },
  _onHashChange: function (hash) {
    // Tw.Logger.info('[hash]', hash);

    if ( !hash.raw ) { return; }

    switch ( hash.raw ) {
      case 'conditionChange_P' :
        // Tw.Logger.info('[hash > conditionChange_P]', hash);
        this.$conditionChangeBtn.trigger('click');
        break;
      default :

    }

  },
  _hbRegisterHelper: function () {
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

    Handlebars.registerHelper('if_third_party', function (strVal, searchName) {
      if ( strVal.indexOf(searchName) > -1) {
        return Tw.MYT_FARE_BILL_GUIDE_TPL.THIRD_PARTY_TPL;
      }
    });

    Handlebars.registerHelper('if_dc_red', function (strVal) {
      if ( strVal.indexOf(Tw.MYT_FARE_BILL_GUIDE_TPL.PRICE_DC_POINT.LABEL) > -1 ) {
        return Tw.MYT_FARE_BILL_GUIDE_TPL.PRICE_DC_POINT.CLASS;
      }
      return '';
    });

  },
  _cachedElement: function () {
    this.$entryTplUseBill = $('#fe-entryTplUseBill');
    this.$entryTplChild = $('#fe-entryTplChild');

    this.$hbDetailListArea = $('[data-target="hbDetailListArea"]');
    this.$hbChildListArea = $('[data-target="hbChildListArea"]');
    this.$conditionChangeBtn = $('[data-target="conditionChangeBtn"]');

    // this.$searchNmSvcTypeTplAll = Handlebars.compile(Tw.MYT_FARE_BILL_GUIDE_TPL.SVC_TYPE_TPL.ALL);
    // this.$searchNmSvcTypeTplOth = Handlebars.compile(Tw.MYT_FARE_BILL_GUIDE_TPL.SVC_TYPE_TPL.OTHER);
  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="conditionChangeBtn"]', $.proxy(this._conditionChangeEvt, this));

    this.$container.on('click', '[data-target="callGiftBtn"]', $.proxy(this._callGiftBtnEvt, this)); // 콜기프트 사용요금
    this.$container.on('click', '[data-target="roamingBtn"]', $.proxy(this._roamingBtnEvt, this)); // 로밍 사용요금
    this.$container.on('click', '[data-target="donationBtn"]', $.proxy(this._donationBtnEvt, this)); // 기부금/후원금 사용요금

    this.$container.on('click', '[data-target="detailContentsBtn"]', $.proxy(function() { // 콘텐츠 이용료 최초화면 바로가기
      this._history.goLoad('/myt-fare/bill/contents');
    }, this));

    this.$container.on('click', '[data-target="detailMicroBtn"]', $.proxy(function() { // 소액결재 최초화면 바로가기
      this._history.goLoad('/myt-fare/bill/small');
    }, this));

    this.$container.on('click', '[data-target="childBillInfo"]', $.proxy(this._goChildBillInfo, this)); // 자녀사용량 조회화면으로 이동
    this.$container.on('click', '[data-target="goProdPageBtn"]', $.proxy(this._goProdPage, this)); // 상품원장페이지로 이동
  },
  //--------------------------------------------------------------------------[EVENT]
  /**
   * 상품원장 페이지로 이동
   * @private
   */
  _goProdPage: function (event) {
    var url = $(event.currentTarget).data('prod-page-url');
    this._history.goLoad(url);
  },
  _callGiftBtnEvt: function () {
    this._history.goLoad('/myt-fare/billguide/callgift');
  },
  _roamingBtnEvt: function () {
    this._history.goLoad('/myt-fare/billguide/roaming');
  },
  _donationBtnEvt: function () {
    this._history.goLoad('/myt-fare/billguide/donation');
  },
  _goChildBillInfo: function(event) {
    var childLine = $(event.currentTarget).data('svc-mgmt-num');
    var dt = this.resData.reqQuery.date || '';
    this._history.goLoad('/myt-fare/billguide/child?line='+childLine+'&date='+dt);
  },
  _conditionChangeEvt: function (event) {
    var $target = $(event.currentTarget);
    var hbsName = 'actionsheet01';
    var hashName = 'conditionChange';
    var reqDate = this.resData.reqQuery.date;
    // 데이터 초기화
    var invDtArr = this.resData.billpayInfo.invDtArr; // data-value
    var conditionChangeDtList = this.resData.commDataInfo.conditionChangeDtList; // value
    var listData = _.map(invDtArr, function (item, idx) {
      var radioAttr = 'id="ra'+idx+'" name="r1" data-value="' + invDtArr[idx] + '"';
      if(reqDate === invDtArr[idx] || (idx === 0 && !reqDate)){
        radioAttr += ' checked';
      }
      return {
        'label-attr': 'id="ra'+idx+'"',
        'radio-attr': radioAttr,
        'txt': conditionChangeDtList[idx]
      };
    });

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: [{ list: listData }],
        title: Tw.MYT_FARE_BILL_GUIDE.POP_TITLE_TYPE_0,
        btnfloating : { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE }
      },
      $.proxy(this._conditionChangeEvtInit, this, $target),
      $.proxy(this._conditionChangeEvtClose, this, $target),
      hashName);
  },
  _conditionChangeEvtInit: function ($target, $layer) {
    $layer.one('click', 'li.type1', $.proxy(this._setSelectedValue, this));
    // Tw.Logger.info('[팝업 오픈 : actionsheet_select_a_type]', $layer);
  },
  _setSelectedValue: function (event) {
    var $tg = $(event.currentTarget);
    this.paramDate = $tg.find('input[type=radio]').attr('data-value');
    // Tw.Logger.info('[선택 : ]', this.paramDate);

    if(this.paramDate === this.resData.reqQuery.date){
      this._popupService.close();
    } else {

      var param = {
        date: this.paramDate
      };
      // Tw.CommonHelper.startLoading(this.$container, 'grey');
      this._history.goLoad('/myt-fare/billguide/guide?' + $.param(param));
    }

    //this._conditionChangeEvtClose();
  },
  _conditionChangeEvtClose: function () {
    // Tw.Logger.info('[팝업 닫기 : actionsheet_select_a_type]');
    // var param = {
    //   date: this.paramDate
    // };
    //
    // this._history.goLoad('/myt-fare/billguide/guide?' + $.param(param));
    // this._popupService.close();
  },
  //--------------------------------------------------------------------------[API]
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
            d = _.find(arguments[i].result.invAmtList, function(item){
              return item.invDt === date;
            });
            if(!d){
              d = {totInvAmt: '0'};
            }
          }
          childLineInfo[i].detailInfo = d;
        }

        thisMain._getChildBillInfoInit();

      }, this));
  },
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
      var useAmtDetailInfo = $.extend(true, {}, res.result.usedAmountDetailList);

      useAmtDetailInfo = _.map(useAmtDetailInfo, function (item) {
        item.invAmt = Tw.FormatHelper.addComma(item.billInvAmt);
        return item;
      });
      // Tw.Logger.info('[useAmtDetailInfo]', useAmtDetailInfo);
      var resData = useAmtDetailInfo;
      var groupKeyArr = ['billItmLclNm', 'billItmMclNm'];
      var priceKey = 'billInvAmt';
      var rootNodes = {};
      // rootNodes.useSvcType = this._useSvcTypeFun();
      rootNodes.useSvcType = this.resData.commDataInfo;
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
  _useSvcTypeFun: function () {
    var svcTypeList = this.resData.commDataInfo.intBillLineList;
    var svcMgmtNum = this.resData.svcMgmtNum;
    var selectSvcType = _.find(svcTypeList, function (item) {
      return item.svcMgmtNum === svcMgmtNum;
    });
    // console.info('[ selectSvcType ] : ', selectSvcType);
    return selectSvcType;

  },
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

      return {
        id: val,
        label: tempData[val][0].svcNm,
        svcInfoNm: tempData[val][0].svcInfoNm,
        children: tempData[val],
        totPrice: tempSum
      };
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
    var strVal = String(str);
    return strVal.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
  },
  _go: function (hash) {
    this._history.setHistory();
    this._history.goHash(hash);
    //window.location.hash = hash;
  }


};