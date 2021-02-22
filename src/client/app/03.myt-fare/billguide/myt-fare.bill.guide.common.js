/**
 * MenuName: 나의 요금 > 요금안내서
 * @file myt-fare.bill.guide.common.js
 * @author 양정규
 * @since 2020.01.22
 * Summay: 통합청구(대표,일반), 개별청구 공통 JS
 */
Tw.MyTFareBillGuideCommon = function (rootEl, resData) {
  this.resData = resData;
  // this.resData = JSON.parse(window.unescape(resData));

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._hashService = Tw.Hash;

  this._history = new Tw.HistoryService();

  this.paramDate = this.resData.reqQuery.date || '';
  this.paramLine = this.resData.reqQuery.line || '';

  this._init();
};

Tw.MyTFareBillGuideCommon.prototype = {

  _init: function () {
    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
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
      if ( strVal.indexOf(searchName) > -1) {
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

    // 상세요금 아코디언 열기
    Handlebars.registerHelper('is_open_accordion', function (item) {
      console.log('is_open_accordion item', item);
      if(item.isOpenAccordion && item.isOpenAccordion === 'Y') {
        return 'on';
      } else {
        return '';
      }
    });

    // 상세요금 아코디언 버튼 열기
    Handlebars.registerHelper('is_open_accordion_btn', function (item) {
      console.log('is_open_accordion_btn item', item);
      if(item.isOpenAccordion && item.isOpenAccordion === 'Y') {
        return 'true';
      } else {
        return 'false';
      }
    });
  },

  /**
   * 화면 element cache
   * @private
   */
  _cachedElement: function () {
    Handlebars.registerPartial('billContent', $('#fe-bill-detail').html());

    this.$entryTplUseBill = $('#fe-entryTplUseBill');
    this.$entryTplChild = $('#fe-entryTplChild');

    this.$hbDetailListArea = $('[data-target="hbDetailListArea"]');
    this.$hbChildListArea = $('[data-target="hbChildListArea"]');
    this.$conditionChangeBtn = $('[data-target="conditionChangeBtn"]');
  },

  /**
   * 이벤트 bind
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '[data-target="conditionChangeBtn"]', $.proxy(this._conditionChangeEvt, this));

    this.$container.on('click', '[data-target="callGiftBtn"]', $.proxy(this._callGiftBtnEvt, this)); // 콜기프트 사용요금
    this.$container.on('click', '[data-target="roamingBtn"]', $.proxy(this._roamingBtnEvt, this)); // 로밍 사용요금
    this.$container.on('click', '[data-target="donationBtn"]', $.proxy(this._donationBtnEvt, this)); // 기부금/후원금 사용요금

    this.$container.on('click', '[data-target="feePayBtn"]', $.proxy(this._feePayBtnEvt, this)); // 요금납부
    this.$container.on('click', '[data-target="payListBtn"]', $.proxy(this._payListBtnEvt, this)); // 납부내역조회

    this.$container.on('click', '[data-target="detailContentsBtn"]', $.proxy(function() { // 콘텐츠 이용료 최초화면 바로가기
      this._history.goLoad('/myt-fare/bill/contents/history');
    }, this));

    this.$container.on('click', '[data-target="detailMicroBtn"]', $.proxy(function() { // 소액결재 최초화면 바로가기
      this._history.goLoad('/myt-fare/bill/small/history');
    }, this));

    this.$container.on('click', '[data-target="childBillInfo"]', $.proxy(this._goChildBillInfo, this)); // 자녀사용량 조회화면으로 이동
    this.$container.on('click', '[data-target="goProdPageBtn"]', $.proxy(this._goProdPage, this)); // 상품원장페이지로 이동
    this.$container.on('click', '[data-url]', $.proxy(this._goLoad, this));
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
  // 요금납부 호출
  _feePayBtnEvt: function (event) {
    // Tw.Logger.info('[요금납부]', Tw.MyTFareBill);
    this.myTFarePayment = new Tw.MyTFareBill(this.$container, this.resData.svcAttrCd, $(event.currentTarget));
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
  /**
   * 날짜조건 변경 actionsheet 팝업
   * @param event
   * @private
   */
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
      hashName, $target);
  },
  _conditionChangeEvtInit: function ($target, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer);
    $layer.one('click', 'li.type1', $.proxy(this._setSelectedValue, this));
  },
  // 안씀. 조건변경 팝업 닫히면..
  _conditionChangeEvtClose: function () {

  },
  // [날짜변경 actionsheet] 날짜 선택시
  _setSelectedValue: function (event) {
    var $tg = $(event.currentTarget);
    this.paramDate = $tg.find('input[type=radio]').attr('data-value');

    if(this.paramDate === this.resData.reqQuery.date){
      this._popupService.close();
    } else {

      var param = {
        date: this.paramDate
      };
      this._history.goLoad('/myt-fare/billguide/guide?' + $.param(param));
    }
  },
  //--------------------------------------------------------------------------[API]
  /**
   * 자녀회선 이용내역 조회
   * @private
   */
  _getChildBillInfo: function () {
    var childListData = this.resData.childLineInfo;
    var commands = [];

    for ( var i = 0; i < childListData.length; i++ ) {
      commands.push({
        command: Tw.API_CMD.BFF_05_0047,
        params: {
          childSvcMgmtNum: childListData[i].svcMgmtNum,
          invDt: this.resData.reqQuery.date
        },
        version: Tw.API_VERSION.V2
      });
    }

    // Tw.Logger.info('------- 자녀 사용량 조회 -----------------');
    this._apiService.requestArray(commands)
      .done($.proxy(function () {
        Tw.Logger.info('자녀 청구요금 조회 결과', arguments);
        if(!arguments || arguments.length !== childListData.length){
          $('#divChildListHaeder').hide().attr('aria-hidden', true);
          return;
        }

        var iterator = function (date) {
          return function (item) {
            return item.invDt === date;
          };
        };

        for (var i = 0, length = childListData.length; i < length; i += 1) {
          var result = arguments[i].result;
          // var detail = { totInvAmt: '0' };  // 2020-01-22 : 초기값이 없으면 루프 돌때 직전 값 가져오는 문제 있음.
          childListData[i].detailInfo = { totInvAmt: '0' };
          if (result && result.invAmtList && result.invAmtList.length > 0) {
            var date = this.resData.reqQuery && this.resData.reqQuery.date;
            if (!date) {
              date = this.resData.billpayInfo.invDtArr[0];
            }
            // 날짜로 조회결과를 찾아야함
            childListData[i].detailInfo = _.find(result.invAmtList, iterator(date));
          }
        }

        this._getChildBillInfoInit();
      }, this));
  },
  /**
   * 자녀회선 이용요금 조회 조회결과로 ui 세팅
   * @private
   */
  _getChildBillInfoInit: function () {
    _.each(this.resData.childLineInfo, function(item){
      item.svcNum = this._phoneStrToDash(item.svcNum);
      if ( item.detailInfo ) {
        item.detailInfo.useAmtTot = Tw.FormatHelper.addComma(item.detailInfo.totInvAmt);
      }
    }.bind(this));

    this._svcHbDetailList(this.resData.childLineInfo, this.$hbChildListArea, this.$entryTplChild);
  },

  //--------------------------------------------------------------------------[SVC]
  _useSvcTypeFun: function () {
    var svcTypeList = this.resData.commDataInfo.intBillLineList;
    var svcMgmtNum = this.resData.svcMgmtNum;
    var selectSvcType = _.find(svcTypeList, function (item) {
      return item.svcMgmtNum === svcMgmtNum;
    });
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
  // 요금에 콤마 추가
  _comComma: function (str) {
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  },
  // 요금에 콤마 삭제
  _comUnComma: function (str) {
    str = String(str);
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
  },

  _goLoad: function (event) {
    this._history.goLoad($(event.currentTarget).data('url'));
  }
};
