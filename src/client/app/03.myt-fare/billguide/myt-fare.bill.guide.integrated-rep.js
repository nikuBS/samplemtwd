/**
 * MenuName: 나의 요금 > 요금안내서 통합(대표,일반)청구회선(MF_02_01)
 * @file myt-fare.bill.guide.integrated-rep.js
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.09.12
 * Summay: 요금안내서 통합(대표,일반)청구회선 조회화면 처리, 자녀 이용요금 조회
 */

Tw.MyTFareBillGuideIntegratedRep = function () {
  // ES5 Inheritance
  Tw.MyTFareBillGuideCommon.apply(this, arguments);

  this.paramDate = '';
  this.paramLine = '';
};

// ES5 Inheritance
Tw.MyTFareBillGuideIntegratedRep.prototype = Object.create(Tw.MyTFareBillGuideCommon.prototype);
Tw.MyTFareBillGuideIntegratedRep.prototype.constructor = Tw.MyTFareBillGuideIntegratedRep;

Tw.MyTFareBillGuideIntegratedRep.prototype = $.extend(Tw.MyTFareBillGuideIntegratedRep.prototype, {
  _init: function () {
    Tw.MyTFareBillGuideCommon.prototype._init.call(this);
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

  /**
   * 화면 element cache
   * @private
   */
  _cachedElement: function () {
    Tw.MyTFareBillGuideCommon.prototype._cachedElement.apply(this, arguments);

    this.$entryTplBill = $('#fe-entryTplBill');
    this.$entryTplPaidAmtSvcCdList = $('#fe-entryTplPaidAmtSvcCdList');

    this.$hbPaidAmtSvcCdListArea = $('[data-target="hbPaidAmtSvcCdListArea"]');
    this.$wrapHbPaidAmtSvcCdListArea = $('[data-target="wrapHbPaidAmtSvcCdListArea"]');
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
    Tw.MyTFareBillGuideCommon.prototype._bindEvent.apply(this, arguments);
    this.$container.on('click', '[data-target="hbDateRadioBtn"]', $.proxy(this._hbDateRadioEvt, this)); // 날짜 선택
    this.$container.on('click', '[data-target="hbLineRadioBtn"]', $.proxy(this._hbLineRadioBtn, this)); // 회선 선택
    this.$container.on('click', '[data-target="hbPopChangeBtn"]', $.proxy(this._hbPopChangeBtn, this)); // 변경하기
  },
  //--------------------------------------------------------------------------[EVENT]
  // [조건변경 팝업] 날짜 클릭시
  _hbDateRadioEvt: function (e) {
    this.paramDate = $(e.currentTarget).find('input').attr('value');
  },
  // [조건변경 팝업] 회선 클릭시
  _hbLineRadioBtn: function (e) {
    this.paramLine = $(e.currentTarget).find('input').attr('value');
  },
  // [조건변경 팝업] 조건변경 버튼 클릭시
  _hbPopChangeBtn: function () {
    var param = {
      date: this.paramDate,
      line: this.paramLine
    };
    this._history.goLoad('/myt-fare/billguide/guide?' + $.param(param));
  },

  /**
   * 조건변경 팝업 오픈
   * @private
   */
  _conditionChangeEvt: function ($event) {
    var $target = $($event.currentTarget);
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
      hashName, $target);
  },
  /**
   * 조건변경 팝업 ui초기화
   * @private
   */
  _conditionChangeEvtInit: function ($popupContainer) {
    Tw.CommonHelper.focusOnActionSheet($popupContainer);

    this._cachedElement();

    var selDateVal = this.resData.reqQuery.date;
    var selLineVal = this.resData.reqQuery.line;

    // 선택 날짜 ui 처리
    if ( selDateVal ) {
      var selDateValObj = this.$dateBtnArea.find('input[value="' + selDateVal + '"]');
      selDateValObj.trigger('click');
    }else {
      var firstDateValObj = this.$dateBtnArea.find('input').eq(0);
      firstDateValObj.trigger('click');
    }

    // 선택 회선 ui 처리
    if ( selLineVal ) {
      var selLineValObj = this.$lineSelectArea.find('input[value="' + selLineVal + '"]');
      selLineValObj.trigger('click');
    }
  },
  //--------------------------------------------------------------------------[API]
  /**
   * 청구요금 조회 결과 화면 처리
   * (node에서 조회해온 data로 처리)
   * @param res
   * @private
   */
  _getBillsDetailInfoInit: function (res) {
    var thisMain = this;
    if ( res.code === Tw.API_CODE.CODE_00 ) {

      var paidAmtDetailInfo = res.result.paidAmtDetailList;

      paidAmtDetailInfo = $.extend(true, {}, paidAmtDetailInfo);
      paidAmtDetailInfo = _.map(paidAmtDetailInfo, function (item) {
        item.invAmt = Tw.FormatHelper.addComma(item.invAmt);
        if ( item.svcNm === Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_0 ) {
          item.svcNm = Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_1;
        }
        return item;
      });
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

      this._svcHbDetailList(this._sortBySvcTypeDetail(rootNodes), this.$hbDetailListArea, this.$entryTplBill);

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
    var textVal = selectSvcType.svcType;
    var templt = this.$searchNmSvcTypeTplOth;

    if ( selectSvcType.svcType === Tw.MYT_FARE_BILL_GUIDE.FIRST_SVCTYPE ) {
      templt = this.$searchNmSvcTypeTplAll;
    } else {
      textVal = selectSvcType.svcType + '(' + this._getShortStr(selectSvcType.label) + ')';
    }

    this.$searchNmSvcType.html(templt({svcType: textVal}));
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
  // 긴 string ... 처리(회선정보)
  _getShortStr: function(str){
    if( str && window.unescape(encodeURIComponent(str)).length > 18 ){
      return str.substr(0, 18) + '...';
    }
    return str;
  }
});
