/**
 * FileName: myt-fare.bill.guide.individual.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */
Tw.MyTFareBillGuideIndividual = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._hashService = Tw.Hash;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();

  this.paramDate = '';
  this.paramLine = '';
};

Tw.MyTFareBillGuideIndividual.prototype = {
  _init: function () {

    this._cachedElement();
    this._bindEvent();
    this._hbRegisterHelper();

    if ( this.resData.childLineInfo ) {
      this._getChildBillInfo();
    }
    this._getUseBillsInfo();

    this._hashService.initHashNav($.proxy(this._onHashChange, this));

  },
  _onHashChange: function (hash) {
    Tw.Logger.info('[hash]', hash);

    if ( !hash.raw ) { return; }

    switch ( hash.raw ) {
      case 'conditionChange_P' :
        Tw.Logger.info('[hash > conditionChange_P]', hash);
        this.$conditionChangeBtn.trigger('click');
        break;
      default :

    }

  },
  _hbRegisterHelper: function () {
    Handlebars.registerHelper('index_of', function (context, ndx) {
      return context[ndx];
    });

    Handlebars.registerHelper('if_contents', function (strVal, searchName) {
      // Tw.Logger.info('[테스트 if_contents]', searchName);
      if ( strVal.indexOf(searchName) > -1) {
        return Tw.MYT_FARE_BILL_GUIDE.DETAIL_BTN.CONTENTS;
      }
    });

    Handlebars.registerHelper('if_micro', function (strVal, searchName) {
      // Tw.Logger.info('[테스트 if_contents]', searchName);
      if ( strVal.indexOf(searchName) > -1) {
        return Tw.MYT_FARE_BILL_GUIDE.DETAIL_BTN.MICRO;
      }
    });

    Handlebars.registerHelper('if_third_party', function (strVal, searchName) {
      // Tw.Logger.info('[테스트 if_contents]', searchName);
      if ( strVal.indexOf(searchName) > -1) {
        return Tw.MYT_FARE_BILL_GUIDE.THIRD_PARTY_TPL;
      }
    });
  },
  _cachedElement: function () {
    this.$entryTplUseBill = $('#fe-entryTplUseBill');
    this.$entryTplChild = $('#fe-entryTplChild');

    this.$hbDetailListArea = $('[data-target="hbDetailListArea"]');
    this.$hbChildListArea = $('[data-target="hbChildListArea"]');

    this.$conditionChangeBtn = $('[data-target="conditionChangeBtn"]');

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="conditionChangeBtn"]', $.proxy(this._conditionChangeEvt, this));

    this.$container.on('click', '[data-target="callGiftBtn"]', $.proxy(this._callGiftBtnEvt, this)); // 콜기프트 사용요금
    this.$container.on('click', '[data-target="roamingBtn"]', $.proxy(this._roamingBtnEvt, this)); // 로밍 사용요금
    this.$container.on('click', '[data-target="donationBtn"]', $.proxy(this._donationBtnEvt, this)); // 기부금/후원금 사용요금

    this.$container.on('click', '[data-target="feePayBtn"]', $.proxy(this._feePayBtnEvt, this)); // 요금납부
    this.$container.on('click', '[data-target="payListBtn"]', $.proxy(this._payListBtnEvt, this)); // 납부내역조회

    this.$container.on('click', '[data-target="detailContentsBtn"]', $.proxy(function() { // 콘텐츠 이용료 최초화면 바로가기
      this._goLoad('/myt/fare/payment/contents');
    }, this));

    this.$container.on('click', '[data-target="detailMicroBtn"]', $.proxy(function() { // 소액결재 최초화면 바로가기
      this._goLoad('/myt/fare/payment/micro');
    }, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  _feePayBtnEvt: function () {
    Tw.Logger.info('[요금납부]', Tw.MyTFarePayment);
    this.myTFarePayment = new Tw.MyTFarePayment(this.$container);
  },
  _payListBtnEvt: function () {
    Tw.Logger.info('[납부내역조회]');
    this._goLoad('/myt/fare/history/payment');
  },
  _callGiftBtnEvt: function () {
    this._goLoad('/myt/fare/bill/guide/call-gift');
  },
  _roamingBtnEvt: function () {
    this._goLoad('/myt/fare/bill/guide/roaming');
  },
  _donationBtnEvt: function () {
    this._goLoad('/myt/fare/bill/guide/donation');
  },

  _conditionChangeEvt: function (event) {
    var $target = $(event.currentTarget);
    var hbsName = 'actionsheet_select_a_type';
    var data = [{
      list: null
    }];
    var hashName = 'conditionChange';

    // 데이터 초기화
    var invDtArr = this.resData.billpayInfo.invDtArr; // data-value
    var conditionChangeDtList = this.resData.commDataInfo.conditionChangeDtList; // value
    var listData = _.map(invDtArr, function (item, idx) {
      return {
        value: conditionChangeDtList[idx],
        option: '',
        attr: 'data-value="' + invDtArr[idx] + '", data-target="selectBtn"'
      };
    });
    data[0].list = listData;

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: data,
        title: Tw.MYT_FARE_BILL_GUIDE.POP_TITLE_TYPE_0
      },
      $.proxy(this._conditionChangeEvtInit, this, $target),
      $.proxy(this._conditionChangeEvtClose, this, $target),
      hashName);
  },
  _conditionChangeEvtInit: function ($target, $layer) {
    $layer.on('click', '[data-target="selectBtn"]', $.proxy(this._setSelectedValue, this, $target));
    Tw.Logger.info('[팝업 오픈 : actionsheet_select_a_type]', $layer);

    this.paramDate = this.resData.reqQuery.date || '';

    if ( this.paramDate ) {
      var $selectBtnTg = $layer.find('[data-value="' + this.paramDate + '"]');
      $selectBtnTg.addClass('checked');
    }

  },
  _setSelectedValue: function ($target, event) {
    var $tg = $(event.currentTarget);
    this.paramDate = $tg.attr('data-value');
    Tw.Logger.info('[선택 : ]', this.paramDate);
    this._conditionChangeEvtClose();
  },
  _conditionChangeEvtClose: function () {
    Tw.Logger.info('[팝업 닫기 : actionsheet_select_a_type]');
    var param = {
      date: this.paramDate
    };
    this._goLoad('/myt/fare/bill/guide?' + $.param(param));
    // this._popupService.close();
  },
  //--------------------------------------------------------------------------[API]
  _getChildBillInfo: function () {
    var thisMain = this;
    var childTotNum = this.resData.childLineInfo.length;
    var targetApi = Tw.API_CMD.BFF_05_0047;
    var commands = [];

    for ( var i = 0; i < childTotNum; i++ ) {
      commands.push({ command: targetApi, params: { childSvcMgmtNum: this.resData.childLineInfo[i].svcMgmtNum } });
    }

    this._apiService.requestArray(commands)
      .done(function () {
        var childLineInfo = thisMain.resData.childLineInfo;

        _.each(arguments, function (element, index) {
          // Tw.Logger.info('[element, index, list]', element, index, list);
          if ( childLineInfo[index].svcMgmtNum === element.result.svcMgmtNum ) {
            childLineInfo[index].detailInfo = element.result;
          }

        });

        thisMain._getChildBillInfoInit();

      });
  },
  _getChildBillInfoInit: function () {
    var thisMain = this;
    var childListData = $.extend(true, {}, thisMain.resData.childLineInfo);

    childListData = _.map(childListData, function (item) {
      item.detailInfo.useAmtTot = Tw.FormatHelper.addComma(item.detailInfo.useAmtTot);
      item.svcNum = thisMain._phoneStrToDash(item.svcNum);
      return item;
    });

    Tw.Logger.info('childListData', childListData);

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
      var useAmtDetailInfo = $.extend(true, {}, res.result.useAmtDetailInfo);

      useAmtDetailInfo = _.map(useAmtDetailInfo, function (item) {
        item.invAmt = Tw.FormatHelper.addComma(item.invAmt);
        return item;
      });
      Tw.Logger.info('[useAmtDetailInfo]', useAmtDetailInfo);
      var resData = useAmtDetailInfo;
      var groupKeyArr = ['billItmLclNm', 'billItmSclNm'];
      var priceKey = 'invAmt';
      var rootNodes = {};
      rootNodes.useSvcType = this._useSvcTypeFun();
      rootNodes.useBill = thisMain._comTraverse(resData, groupKeyArr[0], priceKey);

      _.map(rootNodes.useBill, function (val) {
        val.children = thisMain._comTraverse(val.children, groupKeyArr[1], priceKey);
      });

      Tw.Logger.info('[ rootNodes ] : ', rootNodes);
      this._svcHbDetailList(rootNodes, this.$hbDetailListArea, this.$entryTplUseBill);

      //위젯 아코디언 초기화
      skt_landing.widgets.widget_accordion($('.widget'));

    }
  },
  //--------------------------------------------------------------------------[SVC]
  _useSvcTypeFun: function () {
    var svcTypeList = this.resData.commDataInfo.intBillLineList;
    var svcMgmtNum = this.resData.svcInfo.svcMgmtNum;
    var selectSvcType = _.find(svcTypeList, function (item) {
      return item.svcMgmtNum === svcMgmtNum;
    });
    console.info('[ selectSvcType ] : ', selectSvcType);
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